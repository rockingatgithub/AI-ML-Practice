import { GoogleGenerativeAI } from '@google/generative-ai'

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    analysisType: {
      type: 'string',
      enum: ['pros-cons', 'opportunities-risks'],
      description:
        'Use pros-cons for general/educational topics; use opportunities-risks for business, strategy, or investment topics.',
    },
    keyPoints: {
      type: 'array',
      items: { type: 'string' },
      description: 'Exactly 5 concise, factual key points about the topic.',
    },
    positives: {
      type: 'array',
      items: { type: 'string' },
      description: 'Pros or opportunities — 3 to 5 items.',
    },
    negatives: {
      type: 'array',
      items: { type: 'string' },
      description: 'Cons or risks — 3 to 5 items.',
    },
    recommendation: {
      type: 'string',
      description: 'A short, actionable final recommendation in 2–4 sentences.',
    },
  },
  required: ['analysisType', 'keyPoints', 'positives', 'negatives', 'recommendation'],
}

function buildPrompt(topic, context) {
  const contextBlock = context?.trim()
    ? `\n\nThe user provided the following source material. Prioritize this content when generating your analysis:\n---\n${context.trim()}\n---`
    : ''

  return `You are an expert research assistant. Analyze the following topic and return structured research output.

Topic: "${topic}"${contextBlock}

Instructions:
- Provide exactly 5 key points — each should be a single clear sentence covering an important aspect of the topic.
- Choose "pros-cons" for general, educational, or technical topics; choose "opportunities-risks" for business, market, policy, or strategic topics.
- List 3–5 positives (pros or opportunities) and 3–5 negatives (cons or risks).
- End with a concise, actionable recommendation (2–4 sentences).
- Be accurate, balanced, and specific. Avoid vague filler.
- Do not include markdown formatting in the JSON values.`
}

export async function researchTopic(topic, context = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'Missing API key. Add VITE_GEMINI_API_KEY to your .env file. See .env.example.',
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
    },
  })

  const result = await model.generateContent(buildPrompt(topic, context))
  const text = result.response.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Failed to parse AI response. Please try again.')
  }
}
