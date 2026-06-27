# Gemini Prompt Used

## System Prompt

```
You are a concise daily briefing assistant. Create a short structured summary for the topic below.

Topic: "{USER_TOPIC}"

Instructions:
- Write a short, engaging title related to the topic.
- Provide exactly 3 key points — each should be a single clear sentence about an important aspect of the topic.
- Write one useful observation or insight that helps the reader understand the bigger picture.
- Suggest one practical action step the user can take this week to learn or explore the topic further.
- Be accurate, clear, and helpful. Avoid vague filler.
- Do not include markdown formatting in the JSON values.
```

Replace `{USER_TOPIC}` with the topic entered by the user (e.g. `Artificial Intelligence`).

## Expected JSON Response Schema

```json
{
  "title": "Understanding Modern AI",
  "keyPoints": [
    "AI is being adopted across industries.",
    "Generative AI tools are becoming more accessible.",
    "Businesses are using AI to improve productivity."
  ],
  "insight": "AI is shifting from experimentation to everyday use.",
  "actionStep": "Try using one AI tool this week and evaluate its benefits."
}
```

## API Configuration

- **Model:** `gemini-2.5-flash` (with fallbacks to `gemini-2.5-flash-lite` and `gemini-1.5-flash`)
- **Response format:** `application/json` with structured schema enforcement
- **Temperature:** `0.7`

## Example

**Input:** Artificial Intelligence

**Output:**

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Title       | Understanding Modern AI                                               |
| Key Points  | AI is being adopted across industries. / Generative AI tools are becoming more accessible. / Businesses are using AI to improve productivity. |
| Insight     | AI is shifting from experimentation to everyday use.                  |
| Action Step | Try using one AI tool this week and evaluate its benefits.            |
