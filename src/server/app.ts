import { Hono } from 'hono';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Mistral } from '@mistralai/mistralai';

const app = new Hono();

// Helper for dynamic env selection (Node vs Cloudflare)
const env = (c: any, key: string) => c.env?.[key] || process.env[key];

app.post('/api/chat', async (c) => {
  try {
    const { provider, prompt, history, modelString } = await c.req.json();
    
    const systemInstruction = `You are "Nathan-coder", an autonomous AI developer agent. 
You act as a Vibe Architect and Senior Full-stack Engineer.
Your workflow:
1. Pahami instruksi dari user (Contoh: "Buatkan website belanja online").
2. Buat rencana kerja dengan memecah tugas besar menjadi tugas-tugas kecil.
3. Eksekusi semua tugas satu per satu secara detail. (Format: "### Tugas 1: [Nama Tugas]\n... Mengeksekusi...\n... Selesai.").
4. Setiap selesai eksekusi satu tugas, tulis tag [JEDA_1_DETIK] sebelum memulai tugas berikutnya.
5. When writing or updating code files, you MUST use the following markdown code block format exactly:
\`\`\`language path="dir/filename.ext"
// code goes here
\`\`\`
6. If there are errors, narrate fixing them autonomously.
7. Give a short summary of what was done.
Keep your tone professional, concise, and futuristic. Use markdown.`;

    if (provider === 'gemini') {
      const apiKey = env(c, 'GEMINI_API_KEY');
      if (!apiKey) return c.json({ error: 'GEMINI_API_KEY missing. Periksa Secret Anda.' }, 500);
      
      const ai = new GoogleGenAI({ apiKey });

      return new Response(new ReadableStream({
        async start(controller) {
          try {
            const result = await ai.models.generateContentStream({
              model: modelString || 'gemini-3-flash-preview',
              contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
              config: {
                systemInstruction,
                temperature: 0.7
              }
            });

            for await (const chunk of result) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
            controller.enqueue('data: [DONE]\n\n');
          } catch (e: any) {
            controller.enqueue(`data: ${JSON.stringify({ error: e.message })}\n\n`);
          } finally {
            controller.close();
          }
        }
      }), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });

    } else if (provider === 'mistral') {
      const apiKey = env(c, 'MISTRAL_API_KEY');
      if (!apiKey) return c.json({ error: 'MISTRAL_API_KEY missing. Periksa Secret di Dashboard.' }, 500);

      const client = new Mistral({ apiKey });
      const oaiHistory = history.map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.parts ? msg.parts.map((p: any) => p.text).join('\n') : '',
      }));

      return new Response(new ReadableStream({
        async start(controller) {
          try {
            const result = await client.chat.stream({
              model: modelString || 'mistral-large-latest',
              messages: [{ role: 'system', content: systemInstruction }, ...oaiHistory, { role: 'user', content: prompt }],
              temperature: 0.7,
            });

            for await (const chunk of result) {
              const content = (chunk as any).data?.choices?.[0]?.delta?.content || (chunk as any).choices?.[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(`data: ${JSON.stringify({ text: content })}\n\n`);
              }
            }
            controller.enqueue('data: [DONE]\n\n');
          } catch (e: any) {
            controller.enqueue(`data: ${JSON.stringify({ error: e.message })}\n\n`);
          } finally {
            controller.close();
          }
        }
      }), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        }
      });

    } else {
      let apiKey = '';
      let baseURL = undefined;
      const model = modelString || 'gpt-4o';

      if (provider === 'openai') {
        apiKey = env(c, 'OPENAI_API_KEY') || '';
      } else if (provider === 'groq') {
        apiKey = env(c, 'GROQ_API_KEY') || '';
        baseURL = 'https://api.groq.com/openai/v1';
      } else if (provider === 'deepseek') {
        apiKey = env(c, 'DEEPSEEK_API_KEY') || '';
        baseURL = 'https://api.deepseek.com';
      }

      if (!apiKey) return c.json({ error: `${provider.toUpperCase()}_API_KEY missing.` }, 500);

      const openai = new OpenAI({ apiKey, baseURL });
      const oaiHistory = history.map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.parts ? msg.parts.map((p: any) => p.text).join('\n') : '',
      }));

      return new Response(new ReadableStream({
        async start(controller) {
          try {
            const stream = await openai.chat.completions.create({
              model,
              messages: [{ role: 'system', content: systemInstruction }, ...oaiHistory, { role: 'user', content: prompt }],
              stream: true,
              temperature: 0.7,
            });

            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(`data: ${JSON.stringify({ text: content })}\n\n`);
              }
            }
            controller.enqueue('data: [DONE]\n\n');
          } catch (e: any) {
            controller.enqueue(`data: ${JSON.stringify({ error: e.message })}\n\n`);
          } finally {
            controller.close();
          }
        }
      }), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        }
      });
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export { app };
export default app;
