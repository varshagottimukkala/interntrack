function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url: url.replace(/\/$/, ''), key };
}

async function sb(path, { method = 'GET', body, query, prefer, single = false } = {}) {
  const { url, key } = config();
  const u = new URL(`${url}/rest/v1/${path.replace(/^\//, '')}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
    });
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: prefer || (single ? 'return=representation' : 'return=representation'),
  };
  if (single) headers.Accept = 'application/vnd.pgrst.object+json';

  const res = await fetch(u, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = data?.message || data?.error_description || data?.error || text || `Supabase error ${res.status}`;
    return { data: null, error: { message, status: res.status, code: data?.code } };
  }
  return { data, error: null };
}

function getSupabase() {
  return {
    from(table) {
      const state = {
        table,
        method: 'GET',
        query: { select: '*' },
        body: null,
        filters: [],
        single: false,
        maybe: false,
        returning: true,
      };

      function applyFilters(params) {
        for (const f of state.filters) {
          params[f.col] = `${f.op}.${f.val}`;
        }
        return params;
      }

      const api = {
        select(cols) {
          state.query.select = cols || '*';
          return api;
        },
        insert(row) {
          state.method = 'POST';
          state.body = row;
          return api;
        },
        update(row) {
          state.method = 'PATCH';
          state.body = row;
          return api;
        },
        delete() {
          state.method = 'DELETE';
          return api;
        },
        eq(col, val) {
          state.filters.push({ col, op: 'eq', val });
          return api;
        },
        order(col, { ascending = true } = {}) {
          state.query.order = `${col}.${ascending ? 'asc' : 'desc'}`;
          return api;
        },
        limit(n) {
          state.query.limit = String(n);
          return api;
        },
        maybeSingle() {
          state.single = true;
          state.maybe = true;
          return api;
        },
        single() {
          state.single = true;
          return api;
        },
        async then(resolve, reject) {
          try {
            const query = applyFilters({ ...state.query });
            let prefer = 'return=representation';
            if (state.method === 'DELETE' && !state.returning) prefer = 'return=minimal';
            const result = await sb(state.table, {
              method: state.method,
              body: state.body,
              query,
              prefer,
              single: state.single,
            });
            if (result.error && result.error.status === 406 && state.maybe) {
              resolve({ data: null, error: null });
              return;
            }
            resolve(result);
          } catch (err) {
            if (reject) reject(err);
            else resolve({ data: null, error: { message: err.message } });
          }
        },
      };
      return api;
    },
  };
}

module.exports = { getSupabase, sb, config };
