const express = require('express');
const bcrypt = require('bcryptjs');
const { getSupabase } = require('../lib/supabase');
const { requireAuth, signToken } = require('../middleware/auth');

const router = express.Router();

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    created_at: row.created_at,
  };
}

router.post('/register', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const full_name = String(req.body.full_name || '').trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!full_name) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }

    const supabase = getSupabase();
    const { data: existing, error: findErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (findErr) return res.status(500).json({ error: findErr.message });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const password_hash = await bcrypt.hash(password, 12);
    const { data: created, error: insertErr } = await supabase
      .from('profiles')
      .insert({ email, full_name, password_hash })
      .select('id, email, full_name, created_at')
      .single();

    if (insertErr) return res.status(500).json({ error: insertErr.message });

    const token = signToken(created);
    res.status(201).json({ user: publicUser(created), token });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, password_hash, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password.' });

    const token = signToken(user);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not sign in.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not load profile.' });
  }
});

module.exports = router;
