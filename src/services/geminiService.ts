export async function* chatWithNathanStream(
  prompt: string, 
  history: Array<{ role: 'user' | 'model', parts: { text: string }[] }> = [],
  provider: string = 'gemini',
  modelString?: string
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history, provider, modelString })
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
        const lines = chunk.split('\\n');
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

