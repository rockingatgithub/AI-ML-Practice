# Topic Research Assistant

A Personal Researcher app built with React and Vite. Enter any topic and get a structured research brief — 5 key points, pros/cons (or opportunities/risks), and a final recommendation — powered by the Google Gemini API.

## Features

- Topic input with optional source/context paste area
- 5 structured key points
- Pros/Cons or Opportunities/Risks (auto-selected by topic type)
- Short actionable recommendation
- Clean, card-based output layout
- Gemini JSON schema for reliable structured responses

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure your Gemini API key**

   Copy the example env file and add your key from [Google AI Studio](https://aistudio.google.com/apikey):

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   VITE_GEMINI_API_KEY=your_actual_api_key
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

1. Enter a research topic (e.g. "Electric vehicles in urban transport").
2. Optionally paste source material in the context box to ground the analysis.
3. Click **Generate Research Brief**.
4. Review the structured output: key points, analysis columns, and recommendation.

## Tech Stack

- React 19 + Vite
- `@google/generative-ai` (Gemini 2.0 Flash)
- Structured JSON output via Gemini response schema
