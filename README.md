# StudyFlow — AI Study Assistant

## Overview
StudyFlow is an AI-powered study assistant that allows users to turn free-form notes or topics into structured, interactive study sessions. It leverages the Gemini API to generate custom flashcards and multiple-choice quizzes on demand.

## Features
* **Free-form Study Input:** Paste notes, textbook excerpts, or simple topics to generate a study set.
* **AI-Generated Study Sets:** Automatically transforms input into flashcards, multiple-choice quizzes, and Q&A blocks.
* **Streamed Generation:** Uses Gemini streaming and JSONL delta parsing so users see study materials generate block-by-block in real-time.
* **Interactive Flashcards:** Clean, responsive, 3D flip-animated flashcards to study and reveal answers.
* **Quizzes with Explanations:** Real-time feedback and explanations for correct/incorrect answers. Correct answers are dynamically randomized to avoid positional bias.
* **Score Tracking & Retry Logic:** Retake the quiz or retry only the questions you got wrong.
* **Follow-up Q&A:** Allows students to ask follow-up questions directly to the AI, which append seamlessly to the study set.
* **Runtime Validation:** Uses Zod to ensure the AI output perfectly matches the expected structure.
* **Responsive UI with Dark Mode:** Works beautifully on desktop, tablet, and mobile, automatically adapting to the system dark/light theme.

## Architecture
The application is separated into a Vite/React frontend and an Express Node.js backend.

```text
Browser (React) -> Backend API (Express) -> LLM (Gemini API Streaming) 
-> Streaming JSONL Deltas -> Incremental Parsing & Validation (Zod) -> React UI Updates
```

## Setup

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the example:
```bash
cp .env.example .env
```
Add your Gemini API key to the `.env` file:
`GEMINI_API_KEY=your_actual_api_key_here`

Start the backend development server:
```bash
npm run dev
```
The server will run on `http://localhost:3001`.

### 2. Frontend Setup
In a new terminal window, navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The frontend will typically run on `http://localhost:5173`. Open this URL in your browser.

## Usage

1. **Create a Session:** Enter a topic (e.g., "The Water Cycle") or paste study material into the initial prompt.
2. **Study:** 
   - Flip **Flashcards** to review concepts.
   - Take the **Quizzes** to test your knowledge.
   - Check out the **Follow-up Q&A** to see anticipated questions.
3. **Refine & Expand:** Click "Add 3 more..." at the bottom of any tab to generate more content dynamically, or use the "Ask AI" input in the Q&A tab to ask your own specific question.
4. **Retry:** If you get quiz questions wrong, click "Retry Incorrect Questions" on the completion screen to try them again.

## Failure Handling

StudyFlow is built to be resilient against the unpredictability of AI responses:
- **Streaming Recovery:** The frontend handles incomplete JSON chunks gracefully and safely skips unparseable or invalid JSON lines without crashing the rest of the stream.
- **Wrong Schema:** Zod validation is applied on the frontend to ensure exactly 4 options for quiz questions, correct ID generation, and required fields. Invalid blocks are safely skipped.
- **Prompt Engineering:** Extensive system instructions are used to force pure JSONL, randomize correct answers, and prevent markdown wrappers.
- **Stale Requests:** The frontend uses React `useRef` with an `AbortController` to cancel in-flight streams if a user navigates away or submits a new topic before the previous one finished loading.

## AI Usage Note
AI tools were used for development assistance to bootstrap boilerplate and UI components. The core logic, validation architecture, state management, streaming implementation, and failure handling strategies were carefully reviewed, understood, tested, and modified by the developer to ensure a robust, production-quality implementation.

## Known Limitations
* The quality of the generated content depends on the underlying LLM.
* There is no persistent account/database system; saving relies strictly on browser `localStorage`.
* The application currently assumes English input and output.

## Time Spent
Approximately 2-3 hours.
