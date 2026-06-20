import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
]

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

function getModelList() {
  const override = import.meta.env.VITE_GEMINI_MODEL?.trim()
  if (override) return [override, ...DEFAULT_MODELS.filter((m) => m !== override)]
  return DEFAULT_MODELS
}

function parseRetrySeconds(message) {
  const match = message.match(/retry in ([\d.]+)s/i)
  return match ? Math.ceil(Number(match[1])) : null
}

function formatApiError(err) {
  const message = err?.message ?? String(err)

  if (message.includes('429') || message.includes('quota') || message.includes('Quota exceeded')) {
    const retrySec = parseRetrySeconds(message)
    const retryHint = retrySec ? ` Try again in about ${retrySec} seconds.` : ''

    if (message.includes('limit: 0')) {
      return (
        'This API key has no free-tier quota for the requested model. ' +
        'Create a new key at aistudio.google.com/apikey, ensure billing is enabled on the project, ' +
        'or set VITE_GEMINI_MODEL in .env to a supported model (e.g. gemini-2.5-flash).' +
        retryHint
      )
    }

    return `Rate limit reached.${retryHint} Wait a minute and try again, or check usage at ai.dev/rate-limit.`
  }

  if (message.includes('404') || message.includes('not found')) {
    return 'Model not found. Set VITE_GEMINI_MODEL=gemini-2.5-flash in your .env file.'
  }

  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
    return 'Invalid API key. Check VITE_GEMINI_API_KEY in your .env file.'
  }

  return message
}

async function generateWithModel(genAI, modelName, prompt) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

function isRetryableError(err) {
  const message = err?.message ?? ''
  return (
    message.includes('404') ||
    message.includes('not found') ||
    (message.includes('429') && message.includes('limit: 0'))
  )
}

export async function researchTopic(topic, context = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'Missing API key. Add VITE_GEMINI_API_KEY to your .env file. See .env.example.',
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = buildPrompt(topic, context)
  const models = getModelList()
  let lastError = null

  for (const modelName of models) {
    try {
      const text = await generateWithModel(genAI, modelName, prompt)
      return JSON.parse(text)
    } catch (err) {
      lastError = err
      if (isRetryableError(err)) continue
      throw new Error(formatApiError(err))
    }
  }

  throw new Error(formatApiError(lastError))
}
