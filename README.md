
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Big Coco's Weather Bureau - v3.0

This repository contains a premium, AI-powered weather dashboard for select cities in New Brunswick, built with React, Vite, and the Gemini API.

## Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies:**
    `npm install`
2.  **Create an environment file:** Create a `.env.local` file in the project root.
3.  **Add your API Key:** Add your Gemini API key to the `.env.local` file. You can get a key from [Google AI Studio](https://aistudio.google.com).
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
4.  **Run the app:**
    `npm run dev`

The app should now be running on `http://localhost:3000`.

## Deploy to Vercel

This app is optimized for a secure deployment on [Vercel](https://vercel.com/).

1.  **Fork this Repository:** Create your own copy of this project on GitHub.
2.  **Create a Vercel Project:**
    *   Go to your Vercel dashboard and click "Add New... > Project".
    *   Import the repository you just forked. Vercel will automatically detect the Vite configuration.
3.  **Configure Environment Variables:**
    *   In your new Vercel project's settings, navigate to the "Environment Variables" section.
    *   Add your Gemini API key. This key will be securely available to the backend serverless function, **not** the frontend.
        *   **Name:** `GEMINI_API_KEY`
        *   **Value:** Paste your API key.
4.  **Deploy:** Click the "Deploy" button. Vercel will build the frontend, deploy the backend API endpoint, and your app will be live.
