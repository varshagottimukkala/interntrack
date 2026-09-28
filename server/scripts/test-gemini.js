require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const key = process.env.GEMINI_API_KEY;
const models = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash-001',
];

(async () => {
  const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
  console.log('list', list.status, (await list.text()).slice(0, 800));

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Reply with the single word: pong' }] }],
      }),
    });
    const text = await res.text();
    console.log(model, res.status, text.slice(0, 300));
    if (res.ok) break;
  }
})();
