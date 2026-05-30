type CaptionInput = {
  username: string;
  note: string;
  landmark: string;
  activity: string;
};

type SmartContext = {
  activity?: string;
  destination?: string;
  vehiclePlate?: string;
  transitMode?: string;
  people?: string[];
  cleanedNote?: string;
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
    'Write one tiny casual private-update caption for LMK.',
    'Tone: chill, funny if natural, Gen Z, casual, never alarming.',
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

export function extractSmartContext(note: string, activity: string): SmartContext {
  const text = note.trim();
  const lower = text.toLowerCase();
  const vehiclePlate = text.match(/\b[A-Z0-9]{2,4}[-\s]?[A-Z0-9]{2,4}\b/)?.[0]?.replace(/\s+/g, '');
  const people = Array.from(text.matchAll(/\bwith\s+([A-Z][a-z]+)\b/g)).map((match) => match[1]);
  const destination = lower.includes('home')
    ? 'home'
    : lower.match(/\bto\s+([a-z][a-z\s]{2,18})/)?.[1]?.trim();

  let inferredActivity = activity || undefined;
  let transitMode: string | undefined;

  if (lower.includes('uber') || lower.includes('lyft')) {
    inferredActivity = 'Uber ride';
    transitMode = 'rideshare';
  } else if (lower.includes('train')) {
    inferredActivity = 'Train ride';
    transitMode = 'train';
  } else if (lower.includes('bus')) {
    inferredActivity = 'Bus ride';
    transitMode = 'bus';
  } else if (lower.includes('walking') || lower.includes('walk')) {
    inferredActivity = 'Walking';
    transitMode = 'walk';
  } else if (lower.includes('hackathon')) {
    inferredActivity = 'Hackathon';
  } else if (lower.includes('uni') || lower.includes('class')) {
    inferredActivity = 'Uni';
  }

  return {
    activity: inferredActivity,
    destination,
    vehiclePlate,
    transitMode,
    people: people.length ? people : undefined,
    cleanedNote: text ? text.replace(/\s+/g, ' ') : undefined,
  };
}
