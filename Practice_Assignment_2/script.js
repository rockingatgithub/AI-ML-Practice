const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];

const BACKGROUND_PALETTES = [
  { bg: '#f4f1ec', accent: '#e8edf5' },
  { bg: '#eef6f3', accent: '#dcefe8' },
  { bg: '#f5eef8', accent: '#eadcf2' },
  { bg: '#fef4ec', accent: '#fde8d4' },
  { bg: '#eef4ff', accent: '#dce8ff' },
  { bg: '#f0f7fa', accent: '#d9eef5' },
];

const CARD_ACCENTS = [
  ['#2563eb', '#7c3aed'],
  ['#0891b2', '#2563eb'],
  ['#059669', '#0891b2'],
  ['#d97706', '#dc2626'],
  ['#7c3aed', '#db2777'],
  ['#0284c7', '#6366f1'],
];

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    productName: {
      type: 'string',
      description: 'A catchy, brand-ready product name.',
    },
    tagline: {
      type: 'string',
      description: 'A short marketing tagline (under 10 words).',
    },
    description: {
      type: 'string',
      description: 'A 1–2 sentence product description for a landing page.',
    },
    emoji: {
      type: 'string',
      description: 'A single emoji that fits the product idea.',
    },
  },
  required: ['productName', 'tagline', 'description', 'emoji'],
};

const productIdeaInput = document.getElementById('product-idea');
const apiKeyInput = document.getElementById('api-key');
const generateBtn = document.getElementById('generate-btn');
const statusEl = document.getElementById('status');
const placeholderEl = document.getElementById('placeholder');
const productCard = document.getElementById('product-card');
const cardEmoji = document.getElementById('card-emoji');
const cardName = document.getElementById('card-name');
const cardTagline = document.getElementById('card-tagline');
const cardDescription = document.getElementById('card-description');
const copyBtn = document.getElementById('copy-btn');

let latestCardText = '';

init();

function init() {
  const savedKey = localStorage.getItem('gemini_api_key');
  const configKey = window.GEMINI_CONFIG?.apiKey?.trim();

  if (savedKey) {
    apiKeyInput.value = savedKey;
  } else if (configKey && configKey !== 'your_gemini_api_key_here') {
    apiKeyInput.value = configKey;
  }

  generateBtn.addEventListener('click', handleGenerate);
  copyBtn.addEventListener('click', handleCopy);

  productIdeaInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleGenerate();
  });
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function getApiKey() {
  const key = apiKeyInput.value.trim();
  if (key) localStorage.setItem('gemini_api_key', key);
  return key;
}

function buildPrompt(productIdea) {
  return `You are a startup marketing expert. Create compelling product card content for this idea:

"${productIdea}"

Rules:
- productName: creative, memorable, and brand-ready
- tagline: punchy and under 10 words
- description: 1–2 clear sentences explaining the value proposition
- emoji: exactly one emoji that visually represents the product
- Do not use markdown or quotation marks inside the JSON values`;
}

async function generateWithModel(apiKey, modelName, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.85,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini.');
  return JSON.parse(text);
}

function isRetryableError(message) {
  return message.includes('404') || message.includes('not found') || message.includes('NOT_FOUND');
}

function formatApiError(err) {
  const message = err?.message ?? String(err);

  if (message.includes('API key not valid') || message.includes('API_KEY_INVALID')) {
    return 'Invalid API key. Check your key at aistudio.google.com/apikey.';
  }

  if (message.includes('429') || message.includes('quota') || message.includes('Quota exceeded')) {
    return 'Rate limit reached. Wait a moment and try again.';
  }

  return message;
}

async function generateProductCard(productIdea) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Add your Gemini API key in API settings or config.js.');
  }

  const prompt = buildPrompt(productIdea);
  const preferredModel = window.GEMINI_CONFIG?.model?.trim();
  const models = preferredModel
    ? [preferredModel, ...MODELS.filter((m) => m !== preferredModel)]
    : MODELS;

  let lastError = null;

  for (const modelName of models) {
    try {
      return await generateWithModel(apiKey, modelName, prompt);
    } catch (err) {
      lastError = err;
      if (isRetryableError(err.message)) continue;
      throw new Error(formatApiError(err));
    }
  }

  throw new Error(formatApiError(lastError));
}

function applyTheme(index) {
  const palette = BACKGROUND_PALETTES[index % BACKGROUND_PALETTES.length];
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  document.body.style.background = `linear-gradient(160deg, ${palette.bg} 0%, ${palette.accent} 100%)`;
  productCard.style.setProperty('--card-accent-start', accent[0]);
  productCard.style.setProperty('--card-accent-end', accent[1]);
}

function renderCard(data) {
  cardEmoji.textContent = data.emoji || '✨';
  cardName.textContent = data.productName;
  cardTagline.textContent = data.tagline;
  cardDescription.textContent = data.description;

  latestCardText = [
    `Product Name: ${data.productName}`,
    `Tagline: ${data.tagline}`,
    `Description: ${data.description}`,
  ].join('\n');

  placeholderEl.classList.add('hidden');
  productCard.classList.remove('hidden');
  copyBtn.textContent = 'Copy to clipboard';
  copyBtn.classList.remove('copied');

  applyTheme(Math.floor(Math.random() * BACKGROUND_PALETTES.length));
}

async function handleGenerate() {
  const productIdea = productIdeaInput.value.trim();

  if (!productIdea) {
    setStatus('Please enter a product idea.', true);
    productIdeaInput.focus();
    return;
  }

  generateBtn.disabled = true;
  setStatus('Generating with Gemini…');

  try {
    const data = await generateProductCard(productIdea);
    renderCard(data);
    setStatus('Product card generated.');
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    generateBtn.disabled = false;
  }
}

async function handleCopy() {
  if (!latestCardText) return;

  try {
    await navigator.clipboard.writeText(latestCardText);
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy to clipboard';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch {
    setStatus('Could not copy to clipboard.', true);
  }
}
