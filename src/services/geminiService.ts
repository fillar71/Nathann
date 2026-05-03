export async function* chatWithNathanStream(
  prompt: string, 
  history: Array<{ role: 'user' | 'model', parts: { text: string }[] }> = [],
  provider: string = 'gemini',
  modelString?: string
) {
  const systemPrompt = `You are Nathan-coder, an expert autonomous AI developer agent.
You are interacting with a user in a specialized IDE.

CRITICAL INSTRUCTION FOR FILE CREATION AND CODE SNIPPETS:
When you write or modify code, you MUST ALWAYS provide the exact file path using the following markdown format:

\`\`\`[language] path="[file_path]"
[file_wrapper_content]
\`\`\`

Example:
\`\`\`tsx path="src/App.tsx"
import React from 'react';
export default function App() { return <div>Hello App</div>; }
\`\`\`

If you don't use the \`path="..."\` attribute, the code will NOT appear in the user's File Explorer or Code Editor!

For terminal commands, use standard bash blocks. Provide the full code when modifying files.`;

  // Inject system prompt to the first user message if history is empty,
  // or prepend as a system instruction logic if provider supports it.
  // For simplicity, we just add it to the current prompt to ensure the LLM obeys it.
  const enhancedPrompt = history.length === 0 
    ? `${systemPrompt}\n\nUser Request: ${prompt}`
    : `Reminder: ALWAYS use \`\`\`language path="filename"\`\`\` to write code files so they appear in my IDE.\n\nUser: ${prompt}`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: enhancedPrompt, history, provider, modelString })
  });

  if (!response.ok) {
     const text = await response.text();
     let err = text;
     try { const j = JSON.parse(text); err = j.error || text; } catch(e){}
     throw new Error(`Failed to chat: ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body missing reader');

  const decoder = new TextDecoder('utf-8');
  let done = false;

  while (!done) {
     const { value, done: doneReading } = await reader.read();
     done = doneReading;
     if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
           if (line.startsWith('data: ')) {
               const dataStr = line.replace(/^data: /, '').trim();
               if (dataStr === '[DONE]') {
                   return;
               }
               try {
                   const j = JSON.parse(dataStr);
                   if (j.error) throw new Error(j.error);
                   if (j.text) yield j.text;
               } catch(e) {}
           }
        }
     }
  }
}

