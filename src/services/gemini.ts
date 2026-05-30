type CaptionInput = {
  username: string;
  note: string;
  landmark: string;
  activity: string;
};

const fallbackCaptions = [
  'at hackathon rn lol',
  'quick uni update',
  'heading out for a bit',
  'coffee run with friends',
  'on my way home',
  'date night update',
];

export async function generateGeminiCaption(input: CaptionInput): Promise<string> {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
  const key = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.VITE_GOOGLE_API_KEY;

  if (!key) {
    return input.note.trim() || fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
  }

  const prompt = [
    'Write one tiny casual private-update caption for LEMMEKNOW.',
    'Tone: chill, funny if natural, Gen Z, no panic language, no safety proof language.',
    'Keep it under 9 words.',
    `User: ${input.username || 'friend'}`,
    `Activity: ${input.activity || 'hanging out'}`,
    `Location: ${input.landmark || 'nearby'}`,
    `Draft note: ${input.note || 'none'}`,
  ].join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 24,
          },
        }),
      }
    );

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
  } catch {
    return input.note.trim() || fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
  }
}

export function localActivitySuggestions() {
  return [
    'at hackathon rn lol',
    'uni grind',
    'getting dinner',
    'going out',
    'on the train',
    'heading home',
    'coffee run',
    'date night',
  ];
}
