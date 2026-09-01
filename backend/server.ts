import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-study-set', async (req, res) => {
  try {
    const { input, blockType } = req.body;

    if (!input || typeof input !== 'string' || input.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Please provide valid study material or a topic.'
        }
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'MISSING_API_KEY',
          message: 'Server is missing the Gemini API Key.'
        }
      });
    }

    let typePrompt = '';
    if (blockType === 'card') {
      typePrompt = `You must ONLY generate Flashcards (type: "card"). Generate roughly 5-10 cards.\nSchema: {"id": "unique-id", "type": "card", "content": {"front": "...", "back": "..."}}`;
    } else if (blockType === 'quiz') {
      typePrompt = `You must ONLY generate Quiz questions (type: "quiz"). Generate roughly 5-10 questions.\nSchema: {"id": "unique-id", "type": "quiz", "content": {"question": "...", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "..."}}`;
    } else if (blockType === 'text') {
      typePrompt = `You must ONLY generate Follow-up Questions and Answers (type: "text"). Generate roughly 2-5 common follow-up questions related to the material. Use the 'title' field for the question and the 'text' field for the detailed answer.\nSchema: {"id": "unique-id", "type": "text", "content": {"title": "...", "text": "..."}}`;
    } else {
      typePrompt = `You can generate multiple blocks. Generate a mix of cards, quizzes, and follow-up Q&A text blocks.\nSchemas:\n{"id": "unique-id", "type": "card", "content": {"front": "...", "back": "..."}}\n{"id": "unique-id", "type": "quiz", "content": {"question": "...", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "..."}}\n{"id": "unique-id", "type": "text", "content": {"title": "Question", "text": "Answer..."}}`;
    }

    const SYSTEM_PROMPT = `
You are a study material generator.

Return your response strictly as JSON Lines (JSONL).
Each line MUST be a valid JSON object matching exactly one of the schemas provided below.
Do not wrap your response in markdown code blocks (e.g. \`\`\`json). Just output raw JSONL.
Do not include any empty lines or regular text. Only output valid JSON lines.
IMPORTANT: When generating quizzes, you MUST randomly distribute the correctAnswer index among 0, 1, 2, and 3. Do not always make it 0.

${typePrompt}
    `;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash-lite',
      contents: [
        { role: 'user', parts: [{ text: input }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    res.end();

  } catch (error) {
    console.error('API Error:', error);
    // If headers are already sent, we can't send a JSON error response safely
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while generating the study set.'
        }
      });
    } else {
      res.end();
    }
  }
});

app.post('/api/refine-study-set', async (req, res) => {
  try {
    const { feedback, blocks } = req.body;

    if (!feedback || !blocks || !Array.isArray(blocks)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid input.' } });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const REFINE_PROMPT = `
You are a study material editor. The user has provided an existing study set (JSON blocks) and some feedback/instructions.
Your task is to update the study set based on the feedback.
- If the user wants to ADD new blocks, output ONLY the new blocks with newly generated unique ids.
- If the user wants to MODIFY existing blocks, output ONLY the modified blocks, and you MUST keep their original "id".
- If the user wants to DELETE blocks, output a special block: {"id": "the-id-to-delete", "_delete": true}
- DO NOT output any blocks that remain unchanged.
- Output ONLY valid JSON Lines matching the block schemas. No markdown.
- IMPORTANT: When generating or updating quizzes, ensure the correctAnswer index is randomly distributed (0, 1, 2, or 3) and not always 0.

Schemas:
{"id": "unique-id", "type": "card", "content": {"front": "...", "back": "..."}}
{"id": "unique-id", "type": "quiz", "content": {"question": "...", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "..."}}
{"id": "unique-id", "type": "text", "content": {"title": "Question", "text": "Answer..."}}
{"id": "id-to-delete", "_delete": true}
    `;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash-lite',
      contents: [
        { role: 'user', parts: [{ text: `Here is the current study set:\n${JSON.stringify(blocks)}\n\nUser Feedback: ${feedback}` }] }
      ],
      config: {
        systemInstruction: REFINE_PROMPT,
        temperature: 0.3,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    res.end();
  } catch (error) {
    console.error('Refine Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: { message: 'Failed to refine.' } });
    } else {
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
