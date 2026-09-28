const express = require('express');
const { getSupabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];

function cleanItem(body) {
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const company = String(body.company || '').trim();
  const location = String(body.location || '').trim();
  const deadline = body.deadline ? String(body.deadline).trim() : '';
  let status = String(body.status || 'wishlist').trim().toLowerCase();
  if (!STATUSES.includes(status)) status = 'wishlist';
  return { title, description, company, location, deadline, status };
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('items')
      .select('id, user_id, title, description, ai_summary, company, status, deadline, location, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ items: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not load internships.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('items')
      .select('id, user_id, title, description, ai_summary, company, status, deadline, location, created_at')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Internship not found.' });
    res.json({ item: data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not load internship.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const fields = cleanItem(req.body);
    if (!fields.title) return res.status(400).json({ error: 'Please add a role or title.' });
    if (!fields.company) return res.status(400).json({ error: 'Please add a company name.' });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('items')
      .insert({ ...fields, user_id: req.user.id })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ item: data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not save internship.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = cleanItem(req.body);
    if (!fields.title) return res.status(400).json({ error: 'Please add a role or title.' });
    if (!fields.company) return res.status(400).json({ error: 'Please add a company name.' });

    const patch = { ...fields };
    if (typeof req.body.ai_summary === 'string') patch.ai_summary = req.body.ai_summary;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('items')
      .update(patch)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Internship not found.' });
    res.json({ item: data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not update internship.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Internship not found.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not delete internship.' });
  }
});

module.exports = router;
