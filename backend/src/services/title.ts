import { GoogleGenAI } from '@google/genai';

const googleAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateTitleFromPrompt(prompt: string): Promise<string | null> {
  const instruction = `Generate a short, descriptive title (3-4 words) for the following conversation prompt. Do not include quotes or trailing punctuation. Make sure you capture the gist of the content. Title only.\n\nPrompt: ${prompt}`;
  try {
    const resp: any = await googleAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: instruction,
    });
    const raw = (resp?.text || '').trim();
    if (!raw) return null;
    const cleaned = raw
      .replace(/^[["'“”]+|[["'“”]+$/g, '')
      .replace(/[.!?]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const words = cleaned.split(' ');
    return words.slice(0, 8).join(' ');
  } catch (e) {
    return null;
  }
}

export function fallbackTitleFromPrompt(prompt: string, maxWords: number = 10): string {
  const words = (prompt || '').trim().split(/\s+/);
  const snippet = words.slice(0, maxWords).join(' ');
  return snippet;
}


