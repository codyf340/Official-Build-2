
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// This function is the secure backend endpoint.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { city, currentTemp, condition, twnUrl } = req.body;

  if (!city || currentTemp === undefined || !condition || !twnUrl) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    Meteorological Assessment for ${city}, NB.
    Current Conditions: ${currentTemp}°C, ${condition}.

    TASK 1: CRITICAL ALERT & STATEMENT AUDIT (MANDATORY)
    - Your ONLY source for weather alerts is this URL: ${twnUrl}
    - You MUST check for both "Warnings" and "Special Weather Statements".
    - If the page contains a "Special Weather Statement", treat it as an alert with severity "Minor" or "Moderate".
    - You MUST access this page. If the page explicitly states "No alerts in effect" or similar, you MUST return an empty "alerts" array. Do not invent alerts.
    - If alerts or statements ARE present, extract each one's severity, title, and a detailed description.

    TASK 2: PREDICTIVE & OBSERVATIONAL ANALYSIS
    - Based on all available data, provide: "snowDayProbability", "powerOutageProbability", "roadConditions" (and summary), "significantWeather" (5-day), "periodOutlooks", and "minuteCast" (60-minute array).
    - Also provide "atmosphericDetails" (including UV index, air quality, visibility, pressure) and "astro" data (sunrise, sunset, moon phase, etc.).

    Return your complete findings in a single JSON object.
  `;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      alerts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            sourceUrl: { type: Type.STRING }
          },
          required: ['severity', 'title', 'description']
        }
      },
      snowDayProbability: { type: Type.NUMBER },
      snowDayReasoning: { type: Type.STRING },
      powerOutageProbability: { type: Type.NUMBER },
      powerOutageReasoning: { type: Type.STRING },
      roadConditions: { type: Type.OBJECT, properties: { status: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['status', 'summary'] },
      significantWeather: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, severity: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['day', 'severity', 'description'] } },
      periodOutlooks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, day: { type: Type.STRING }, temp: { type: Type.STRING }, condition: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['period', 'day', 'temp', 'condition', 'summary'] } },
      minuteCast: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, intensity: { type: Type.NUMBER }, type: { type: Type.STRING } }, required: ['time', 'intensity', 'type'] } } }, required: ['summary', 'data'] },
      atmosphericDetails: {
        type: Type.OBJECT,
        properties: {
          uvIndex: { type: Type.NUMBER },
          uvDescription: { type: Type.STRING },
          airQuality: { type: Type.NUMBER },
          airQualityDescription: { type: Type.STRING },
          visibility: { type: Type.STRING },
          pressure: { type: Type.STRING }
        },
        required: ['uvIndex', 'uvDescription', 'airQuality', 'airQualityDescription', 'visibility', 'pressure']
      },
      astro: {
        type: Type.OBJECT,
        properties: {
          sunrise: { type: Type.STRING },
          sunset: { type: Type.STRING },
          moonIllumination: { type: Type.NUMBER },
          moonPhase: { type: Type.STRING },
          dayLength: { type: Type.STRING }
        },
        required: ['sunrise', 'sunset', 'moonIllumination', 'moonPhase', 'dayLength']
      }
    },
    required: [
      'alerts', 'snowDayProbability', 'snowDayReasoning', 
      'powerOutageProbability', 'powerOutageReasoning', 'roadConditions', 
      'significantWeather', 'periodOutlooks', 'minuteCast',
      'atmosphericDetails', 'astro'
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(response.text || '{}');
    const searchSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Weather Station'
    })).filter((s: any) => s.uri) || [];

    res.status(200).json({ data, searchSources, aiStatus: 'active' });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: 'Failed to fetch data from AI service.' });
  }
}
