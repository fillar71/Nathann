import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/chat', async (req, res) => {
    try {
      const { provider, prompt, history, modelString } = req.body;
      
      const systemInstruction = `You are "Nathan-coder", an autonomous AI developer agent. 
You act as a Vibe Architect and Senior Full-stack Engineer.
Your workflow:
1. Understand the user's prompt. Take project context into account if provided.
2. Provide a summary of recommendations & tech stack (e.g. Next.js, Tailwind, Supabase).
3. Breakdown the task into tiny atomic steps.
4. Execute steps. (You must narrate this process. Format your response to show your internal thought process and actions, e.g., "### Step 1: Initialize Database\\n... Executing...\\n... Testing... Success.").
5. When writing or updating code files, you MUST use the following markdown code block format exactly:
\`\`\`language path="dir/filename.ext"
// code goes here
\`\`\`
6. If there are errors (simulate one occasionally), narrate fixing them autonomously.
7. Give a short summary of what was done, and add any extra features you thought were necessary.
Keep your tone professional, concise, and futuristic. Use markdown. Use blockquotes for terminal outputs or file changes.`;

      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing. Please configure it in your secrets.' });
        const ai = new GoogleGenAI({ apiKey });
        
        const responseStream = await ai.models.generateContentStream({
          model: modelString || 'gemini-2.0-flash',
          contents: [
            ...history,
            { role: 'user', parts: [{ text: prompt }] }
          ],
          config: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            temperature: 0.7,
          }
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of responseStream) {
           res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        return res.end();

      } else if (provider === 'mistral') {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
           return res.status(500).json({ error: 'MISTRAL_API_KEY missing. Please add it to your secrets in AI Studio.' });
        }

        const client = new Mistral({ apiKey });
        
        const oaiHistory = history.map((msg: any) => ({
           role: msg.role === 'model' ? 'assistant' : msg.role,
           content: msg.parts ? msg.parts.map((p: any) => p.text).join('\n') : '',
        }));

        const result = await client.chat.stream({
          model: modelString || 'mistral-large-latest',
          messages: [
            { role: 'system', content: systemInstruction },
            ...oaiHistory,
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of result) {
           const content = chunk.data.choices[0]?.delta?.content || '';
           if (content) {
              res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
           }
        }
        res.write('data: [DONE]\n\n');
        return res.end();

      } else {
        // OpenAI-compatible providers
        let apiKey = '';
        let baseURL = undefined;
        let model = modelString || 'gpt-4o';

        if (provider === 'openai') {
          apiKey = process.env.OPENAI_API_KEY || '';
        } else if (provider === 'groq') {
          apiKey = process.env.GROQ_API_KEY || '';
          baseURL = 'https://api.groq.com/openai/v1';
        } else if (provider === 'deepseek') {
          apiKey = process.env.DEEPSEEK_API_KEY || '';
          baseURL = 'https://api.deepseek.com';
        }

        if (!apiKey) {
           return res.status(500).json({ error: `${provider.toUpperCase()}_API_KEY missing. Please configure it in your secrets.` });
        }

        const openai = new OpenAI({ apiKey, baseURL });
        
        // Convert history format to OpenAI format
        const oaiHistory = history.map((msg: any) => ({
           role: msg.role === 'model' ? 'assistant' : msg.role,
           content: msg.parts ? msg.parts.map((p: any) => p.text).join('\\n') : '',
        }));

        const stream = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            ...oaiHistory,
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
           const content = chunk.choices[0]?.delta?.content || '';
           if (content) {
              res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
           }
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      }

    } catch (e: any) {
      console.error(e);
      if (!res.headersSent) {
          res.status(500).json({ error: e.message });
      } else {
          res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
          res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // We serve the dist folder built by Vite
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
