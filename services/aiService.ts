import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const AVAILABLE_STYLES = ['Clay', '3D', 'Anime', 'Pixel Art'] as const;

export function getAllStyles(customStyles: string[] = []): string[] {
  return [...AVAILABLE_STYLES, ...customStyles];
}

function getReplicateApiToken(): string {
  const token = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.replicateApiToken;
  if (typeof token === 'string' && token.trim().length > 0) return token;
  throw new Error('Missing REPLICATE_API_TOKEN. Set it in .env and rebuild the app.');
}

const REPLICATE_API = 'https://api.replicate.com/v1/predictions';
const MODEL_VERSION = 'a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8deaf';

const PROMPT_MAP: Record<string, string> = {
  Clay: 'a person in a post apocalyptic war game, claymation style',
  '3D': 'a person rendered in stunning 3D CGI, cinematic lighting',
  Anime: 'a person in a beautifully detailed anime style, vibrant colors',
  'Pixel Art': 'a person as a 16-bit retro arcade pixel character',
};

function promptForStyle(style: string): string {
  return PROMPT_MAP[style] ?? `a person in a ${style} art style, highly detailed`;
}

const CACHE_PREFIX = 'clipart_cache_v1_';

function imageFingerprint(base64: string): string {
  const clean = base64.startsWith('data:') ? base64.split(',')[1] ?? base64 : base64;
  return `${clean.length}_${clean.slice(0, 80)}_${clean.slice(-80)}`;
}

function cacheKey(base64: string, style: string): string {
  return `${CACHE_PREFIX}${imageFingerprint(base64)}_${style}`;
}

async function getCached(base64: string, style: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(cacheKey(base64, style));
  } catch {
    return null;
  }
}

async function setCache(base64: string, style: string, url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(base64, style), url);
  } catch {
    // Cache write failures should not block generation.
  }
}

async function pollResult(getUrl: string): Promise<string> {
  const token = getReplicateApiToken();
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { data } = await axios.get(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    if (data.status === 'succeeded') {
      const output = data.output;
      if (Array.isArray(output) && output.length > 0) return output[0] as string;
      if (typeof output === 'string') return output;
      throw new Error('Unexpected output format.');
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${data.error ?? 'unknown'}`);
    }
  }
  throw new Error('Timed out waiting for prediction.');
}

export async function generateClipart(base64Image: string, style: string): Promise<string> {
  const token = getReplicateApiToken();
  const safeStyle = style.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!safeStyle || safeStyle.length > 40) {
    throw new Error('Invalid style name.');
  }

  const cached = await getCached(base64Image, safeStyle);
  if (cached) return cached;

  const image = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  const { data } = await axios.post(
    REPLICATE_API,
    {
      version: MODEL_VERSION,
      input: {
        image,
        style: safeStyle,
        prompt: promptForStyle(safeStyle),
        instant_id_strength: 0.8,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      timeout: 30000,
    },
  );

  let resultUrl: string | null = null;

  if (data.status === 'succeeded') {
    const output = data.output;
    if (Array.isArray(output) && output.length > 0) resultUrl = output[0] as string;
    else if (typeof output === 'string') resultUrl = output;
  }

  if (!resultUrl && data.urls?.get) {
    resultUrl = await pollResult(data.urls.get as string);
  }

  if (!resultUrl) throw new Error(`Generation failed: ${data.status}`);

  await setCache(base64Image, safeStyle, resultUrl);
  return resultUrl;
}
