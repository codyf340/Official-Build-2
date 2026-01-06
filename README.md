
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1FmOnpy493OZSXIEplAGLaoe0DLFYyhjm

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file in the project root.
3. Add your API keys to the `.env.local` file:
   `GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE`
   `OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY_HERE` (Optional)
4. Run the app:
   `npm run dev`

## Deploy to Vercel

This app is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Fork this Repository:** Create your own copy of this project on GitHub.
2.  **Create a Vercel Project:**
    *   Go to your Vercel dashboard and click "Add New... > Project".
    *   Import the repository you just forked.
3.  **Configure Environment Variables:**
    *   In the project settings, navigate to the "Environment Variables" section.
    *   Add your Gemini API key:
        *   **Name:** `GEMINI_API_KEY`
        *   **Value:** Paste your API key obtained from [Google AI Studio](https://aistudio.google.com).
    *   Add your OpenRouter API key (optional):
        *   **Name:** `OPENROUTER_API_KEY`
        *   **Value:** Paste your API key from [OpenRouter](https://openrouter.ai/).
4.  **Deploy:** Click the "Deploy" button. Vercel will automatically detect that this is a Vite project, install dependencies, run the build script, and deploy your app.
