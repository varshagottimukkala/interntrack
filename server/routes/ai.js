const express = require('express');
const { getSupabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
];

function buildPrompt({ mode, item, extra }) {
  const role = item?.title || 'an internship';
  const company = item?.company || 'the company';
  const location = item?.location || '';
  const notes = item?.description || extra || '';
  const status = item?.status || '';

  if (mode === 'summarize') {
    return `You are InternTrack, a concise career coach for students.

Summarize this internship opportunity in 4-6 short bullet points covering: what the role is, why it might fit a student, key requirements you can infer, and one practical next step.

Role: ${role}
Company: ${company}
Location: ${location}
Status: ${status}
Notes / description:
${notes}

Keep it under 140 words. Use plain language. No markdown headings.`;
  }

  if (mode === 'cover_letter') {
    return `You are InternTrack, helping a student draft a short internship cover letter.

Write a warm, specific, 180-220 word cover letter for:
Role: ${role}
Company: ${company}
Location: ${location}
Notes / job details:
${notes}

Student extra context: ${extra || 'Motivated student seeking a meaningful internship.'}

Tone: confident, human, not generic. Avoid clichés like "I am writing to apply". Do not invent employers, skills, or awards the student did not mention.`;
  }

  if (mode === 'interview') {
    return `You are InternTrack, an interview coach for students.

Create a compact interview prep sheet for ${role} at ${company}.
Include:
- 6 likely interview questions (mix of behavioral + role-specific)
- A strong STAR-style sample answer for the first question
- 3 smart questions the student should ask the interviewer
- 3 last-minute prep tips

Notes: ${notes}
Extra: ${extra || ''}

Keep it practical and under 280 words.`;
  }

  if (mode === 'next_steps') {
    return `You are InternTrack. Based on this internship application, suggest 5 concrete next actions the student should take this week.

Role: ${role} at ${company}
Status: ${status}
Deadline: ${item?.deadline || 'not set'}
Notes: ${notes}

Be specific and ordered by priority. Under 120 words.`;
  }

  return extra || notes || 'Give one encouraging, practical tip for a student tracking internships today. Under 60 words.';
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error('Gemini is not configured on the server.');
    err.status = 503;
    throw err;
  }

  let lastError = 'Gemini request failed.';
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 900 },
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      if (text.trim()) return { text: text.trim(), model };
      lastError = 'Gemini returned an empty response.';
      continue;
    }
    lastError = json?.error?.message || lastError;
    if (res.status !== 404 && res.status !== 400) break;
  }
  const err = new Error(lastError);
  err.status = 502;
  throw err;
}

router.post('/generate', requireAuth, async (req, res) => {
  try {
    const mode = String(req.body.mode || req.body.type || 'assist');
    const extra = String(req.body.prompt || req.body.extra || '').slice(0, 4000);
    const itemId = req.body.itemId || req.body.item_id;
    let item = req.body.item || null;

    if (itemId) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('items')
        .select('id, title, description, company, status, deadline, location, ai_summary')
        .eq('id', itemId)
        .eq('user_id', req.user.id)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Internship not found.' });
      item = data;
    }

    const prompt = buildPrompt({ mode, item, extra });
    const { text, model } = await callGemini(prompt);

    if (itemId && (mode === 'summarize' || mode === 'summary')) {
      const supabase = getSupabase();
      await supabase
        .from('items')
        .update({ ai_summary: text })
        .eq('id', itemId)
        .eq('user_id', req.user.id);
    }

    res.json({ text, model, mode });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'AI request failed.' });
  }
});

module.exports = router;
