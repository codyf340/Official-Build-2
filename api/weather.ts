import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Use the mandatory API_KEY environment variable
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY is missing from environment.");
    return res.status(500).json({ 
      error: 'Backend Configuration Error', 
      details: 'API_KEY is not defined.' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { city, currentTemp, condition, twnUrl } = req.body;

  if (!city || currentTemp === undefined || !condition || !twnUrl) {
    return res.status(400).json({ error: 'Missing weather parameters.' });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert New Brunswick meteorologist.
      Conduct a detailed assessment for ${city}, NB.
      Current conditions: ${currentTemp}°C, ${condition}.

      TASKS:
      1. Check ${twnUrl} for alerts.
      2. Calculate Snow Day probability for NB schools.
      3. Assess Power Outage risk.
      4. Provide atmospheric and astronomical data.

      Return ONLY a JSON object matching the requested schema.
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
        roadConditions: { 
          type: Type.OBJECT, 
          properties: { status: { type: Type.STRING }, summary: { type: Type.STRING } }, 
          required: ['status', 'summary'] 
        },
        significantWeather: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: { day: { type: Type.STRING }, severity: { type: Type.STRING }, description: { type: Type.STRING } }, 
            required: ['day', 'severity', 'description'] 
          } 
        },
        periodOutlooks: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: { period: { type: Type.STRING }, day: { type: Type.STRING }, temp: { type: Type.STRING }, condition: { type: Type.STRING }, summary: { type: Type.STRING } }, 
            required: ['period', 'day', 'temp', 'condition', 'summary'] 
          } 
        },
        minuteCast: { 
          type: Type.OBJECT, 
          properties: { 
            summary: { type: Type.STRING }, 
            data: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { time: { type: Type.STRING }, intensity: { type: Type.NUMBER }, type: { type: Type.STRING } }, 
                required: ['time', 'intensity', 'type'] 
              } 
            } 
          }, 
          required: ['summary', 'data'] 
        },
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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    let rawText = response.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : rawText;
    
    const data = JSON.parse(cleanedJson);
    const searchSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Meteorological Source'
    })).filter((s: any) => s.uri) || [];

    return res.status(200).json({ data, searchSources, aiStatus: 'active' });
  } catch (error: any) {
    console.error("Gemini Failure:", error);
    return res.status(500).json({ 
      error: 'Intelligence uplink failed.', 
      details: error.message 
    });
  }
}