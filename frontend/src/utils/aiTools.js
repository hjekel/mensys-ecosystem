// Detectie van AI-tools in contact-keywords, notities, functietitel of
// bedrijfsnaam. Gebruikt voor de filter op de CEO & MD tab.

export const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Copilot',
  'Gemini',
  'Canva',
  'Midjourney',
  'Perplexity',
  'Notion AI',
  'Figma',
  'Miro',
  'Jasper',
  'Suno',
  'ElevenLabs',
  'Runway',
  'Sora',
  'DALL-E',
  'Stable Diffusion',
  'Cursor',
  'Anthropic',
  'OpenAI',
];

function buildHaystack(record) {
  return [
    record.keywords || '',
    record.notes || '',
    record.notities || '',
    record.jobTitle || '',
    record.functietitel || '',
    record.company || '',
    record.bedrijf || '',
  ]
    .join(' ')
    .toLowerCase();
}

export function detectAiTools(record) {
  if (!record) return [];
  const hay = buildHaystack(record);
  if (!hay.trim()) return [];
  const hits = [];
  for (const tool of AI_TOOLS) {
    if (hay.includes(tool.toLowerCase())) hits.push(tool);
  }
  return hits;
}

export function hasAiTool(record, tool) {
  if (!tool) return true;
  const hay = buildHaystack(record);
  return hay.includes(String(tool).toLowerCase());
}
