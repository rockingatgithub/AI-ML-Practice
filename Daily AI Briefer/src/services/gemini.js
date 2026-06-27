import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
]

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'A short, engaging title related to the topic.',
    },
    keyPoints: {
      type: 'array',
      items: { type: 'string' },
      description: 'Exactly 3 important points about the topic.',
    },
    insight: {
      type: 'string',
      description: 'One useful observation or insight about the topic.',
    },
    actionStep: {
      type: 'string',
      description: 'One practical action the user can take to learn or explore the topic further.',
    },
  },
  required: ['title', 'keyPoints', 'insight', 'actionStep'],
}

export function buildPrompt(topic) {
  return `You are a concise daily briefing assistant. Create a short structured summary for the topic below.

Topic: "${topic}"

Instructions:
- Write a short, engaging title related to the topic.
- Provide exactly 3 key points — each should be a single clear sentence about an important aspect of the topic.
- Write one useful observation or insight that helps the reader understand the bigger picture.
- Suggest one practical action step the user can take this week to learn or explore the topic further.
- Be accurate, clear, and helpful. Avoid vague filler.
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

export async function generateBrief(topic) {
  const trimmed = topic.trim()

  if (!trimmed) {
    throw new Error('Please enter a topic before generating a brief.')
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'Missing API key. Add VITE_GEMINI_API_KEY to your .env file. See .env.example.',
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = buildPrompt(trimmed)
  const models = getModelList()
  let lastError = null

  for (const modelName of models) {
    try {
      const text = await generateWithModel(genAI, modelName, prompt)
      const data = JSON.parse(text)

      if (!data.keyPoints || data.keyPoints.length !== 3) {
        throw new Error('The AI returned an unexpected format. Please try again.')
      }

      return data
    } catch (err) {
      lastError = err
      if (err instanceof SyntaxError) {
        throw new Error('Failed to parse the AI response. Please try again.', { cause: err })
      }
      if (isRetryableError(err)) continue
      throw new Error(formatApiError(err), { cause: err })
    }
  }

  throw new Error(formatApiError(lastError), { cause: lastError })
}
