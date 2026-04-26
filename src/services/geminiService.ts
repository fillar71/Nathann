import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function* chatWithNathanStream(prompt: string, history: Array<{ role: 'user' | 'model', parts: { text: string }[] }> = []) {
  if (!ai) {
    throw new Error('Gemini API Key is missing. Please set it in the AI Studio environment.');
  }

  const systemInstruction = `You are "Nathan-coder", an autonomous AI developer agent. 
You act as a Vibe Architect and Senior Full-stack Engineer.
Your workflow:
1. Understand the user's prompt. Take project context into account if provided.
2. Provide a summary of recommendations & tech stack (e.g. Next.js, Tailwind, Supabase).
3. Breakdown the task into tiny atomic steps.
4. Execute steps. (You must narrate this process. Format your response to show your internal thought process and actions, e.g., "### Step 1: Initialize Database\n... Executing...\n... Testing... Success.").
5. If there are errors (simulate one occasionally), narrate fixing them autonomously.
6. Give a short summary of what was done, and add any extra features you thought were necessary.
Keep your tone professional, concise, and futuristic. Use markdown. Use blockquotes for terminal outputs or file changes.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
       yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
