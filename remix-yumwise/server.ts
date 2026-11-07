import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { FOOD_CATALOG } from './src/data/foodCatalog.ts';
import { rankFoodSuggestions } from './src/services/allergenFilter.ts';
import { ChildProfile } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '20mb' }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Endpoint: POST /api/recognize-drawing
 * Recognizes child drawings with strict uncertainty treatment.
 */
app.post('/api/recognize-drawing', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'חסרה תמונת הציור' });
    }

    // Clean base64 data header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!ai) {
      // Fallback if API key is temporarily unavailable in environment
      return res.json({
        detectedFoodHe: 'חטיף מתוק / שוקולד',
        categoryHe: 'ממתקים ושוקולד',
        certainty: 'בינונית (זיהוי לא ודאי)',
        noteHe: 'זיהינו בסבירות חלקית ציור של חטיף מתוק. מומלץ לתקן ידנית לפי כוונת הילד.',
      });
    }

    const promptText = `
אתה מזהה ציורי ילדים עבור אפליקציית YumWise. ילד צייר מאכל או חשק למזון שהוא רוצה לאכול.
חשוב מאוד: זיהוי ציורי ילדים אינו ודאי. עליך לזהות מה המאכל הסביר ביותר שהילד צייר.
החזר אך ורק תשובת JSON במבנה הבא:
- detectedFoodHe: שם המאכל בעברית פשוטה וברורה (למשל: "שוקולד", "גלידה בגביע", "צ'יפס", "עוגייה", "סוכרייה על מקל", "ארטיק תות", "פיצה")
- categoryHe: קטגוריה כללית (למשל: "ממתקים ושוקולד", "גלידות וארטיקים", "חטיפים מלוחים", "מאפים")
- certainty: רמת הוודאות בעברית (למשל: "בינונית (ציור סכמטי)", "גבוהה יחסית", "נמוכה (דורש אישור)")
- noteHe: משפט קצר וחם בעברית המדגיש שהזיהוי הוא השערה בלבד וניתן לערוך אותו בחופשיות.
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedFoodHe: { type: Type.STRING },
            categoryHe: { type: Type.STRING },
            certainty: { type: Type.STRING },
            noteHe: { type: Type.STRING },
          },
          required: ['detectedFoodHe', 'categoryHe', 'certainty', 'noteHe'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      detectedFoodHe: parsed.detectedFoodHe || 'מאכל מתוק / חטיף',
      categoryHe: parsed.categoryHe || 'חטיפים וממתקים',
      certainty: parsed.certainty || 'הערכה ראשונית',
      noteHe:
        parsed.noteHe ||
        'זיהוי ציור אינו ודאי לחלוטין. אנא בדקו וערכו את המאכל הרצוי לפני המשך.',
    });
  } catch (error: unknown) {
    console.error('Error in /api/recognize-drawing:', error);
    return res.json({
      detectedFoodHe: 'חטיף מתוק או צ׳יפס',
      categoryHe: 'חטיפים',
      certainty: 'לא ודאי (עקב שגיאת פענוח)',
      noteHe: 'לא הצלחנו לזהות את הציור בוודאות מלאה. תוכלו להקליד ידנית את שם המאכל.',
    });
  }
});

/**
 * Endpoint: POST /api/transcribe-voice
 * Transcribes spoken Hebrew audio using Gemini audio transcription.
 * Strictly preserves the child's raw words without translation or rewriting.
 * Audio is never persisted to disk.
 */
app.post('/api/transcribe-voice', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'חסרה הקלטת שמע' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    // Clean MIME type to standard IANA format (strip codecs parameters like ;codecs=opus)
    const cleanMime = (mimeType || 'audio/webm').split(';')[0].trim();

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'שירות Gemini אינו מוגדר בשרת (חסר GEMINI_API_KEY). אנא הגדירו את המפתח בהגדרות.',
      });
    }

    const promptText = `
תמלל בעברית את מה שנאמר בהקלטת השמע של הילד.
הוראות קריטיות:
1. החזר אך ורק את המילים המדויקות שנאמרו בעברית.
2. אל תוסיף שום מילה משלך, אל תתרגם, אל תנסח מחדש, ואל תוסיף הסברים או מרכאות.
3. שמור על המילים של הילד בדיוק כפי שנאמרו (למשל: "בא לי שוקולד חלב", "אני רוצה ארטיק קר").
4. אם בהקלטה יש רק שקט, רעש רקע, או שאין שום דיבור ברור בעברית, החזר אך ורק את המילה: EMPTY.
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMime,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
    });

    const rawText = (response.text || '').trim();

    if (!rawText || rawText === 'EMPTY' || rawText.toLowerCase().includes('empty')) {
      return res.json({
        success: false,
        error: 'לא זוהה דיבור ברור בהקלטה. בואו ננסה להקליט שוב!',
      });
    }

    // Clean any accidental enclosing quotes or punctuation
    const cleanTranscript = rawText.replace(/^["'״”`]|["'״”`]$/g, '').trim();

    return res.json({
      success: true,
      transcription: cleanTranscript,
    });
  } catch (error: unknown) {
    console.error('Error in /api/transcribe-voice:', error);
    return res.status(500).json({
      success: false,
      error: 'חלה שגיאה בעיבוד ההקלטה בשרת. אנא נסו שוב או השתמשו בכתיבה.',
    });
  }
});

/**
 * Endpoint: POST /api/generate-alternatives
 * Evaluates candidate food items strictly against child's allergies and restrictions,
 * matches sensory attributes (taste, texture, color, consistency),
 * and presents verified nutrition sources or unverified demo status.
 */
app.post('/api/generate-alternatives', async (req: Request, res: Response) => {
  try {
    const {
      childProfile,
      childRequest,
      parentNote,
      maxSuggestions = 3,
    }: {
      childProfile: ChildProfile;
      childRequest: string;
      parentNote?: string;
      maxSuggestions?: number;
    } = req.body;

    if (!childProfile || !childRequest) {
      return res.status(400).json({ error: 'חסרים נתוני פרופיל או בקשת מזון' });
    }

    // Step 1: Run deterministic allergen filter and ranking pipeline
    const suggestions = rankFoodSuggestions(
      FOOD_CATALOG,
      childProfile,
      childRequest,
      parentNote,
      maxSuggestions
    );

    return res.json({
      success: true,
      totalSafeFound: suggestions.length,
      suggestions,
      parentReviewRequiredNotice:
        'ההמלצות מוצגות כהצעה חוזרת ומבוססות על נתוני דמו. ההורה אחראי לאמת רכיבים ואלרגנים על גבי אריזת המזון.',
    });
  } catch (error: unknown) {
    console.error('Error in /api/generate-alternatives:', error);
    return res.status(500).json({
      error: 'חלה שגיאה בעיבוד ההמלצות. אנא נסו שוב.',
    });
  }
});

// Vite middleware for dev / static for prod
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[YumWise Server] Running on http://0.0.0.0:${PORT}`);
});
