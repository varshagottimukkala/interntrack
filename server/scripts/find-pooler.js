require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const net = require('net');

const hosts = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-1-ap-south-1.pooler.supabase.com',
  'aws-2-ap-south-1.pooler.supabase.com',
  'aws-0-ap-south-2.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-southeast-2.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-ap-northeast-2.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-1-us-east-1.pooler.supabase.com',
  'aws-2-us-east-1.pooler.supabase.com',
  'aws-0-us-east-2.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-us-west-2.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-central-2.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-eu-north-1.pooler.supabase.com',
];

const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
const users = ['postgres.ciwjsbcnxidurzgkxzfm', 'postgres'];

async function tryOne(host, port, user) {
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 2500,
  });
  try {
    await client.connect();
    const r = await client.query('select 1 as ok');
    await client.end();
    return 'OK ' + JSON.stringify(r.rows[0]);
  } catch (err) {
    try {
      await client.end();
    } catch {}
    return (err.message || '').split('\n')[0];
  }
}

(async () => {
  const jobs = [];
  for (const host of hosts) {
    for (const port of [6543]) {
      for (const user of ['postgres.ciwjsbcnxidurzgkxzfm']) {
        jobs.push(
          tryOne(host, port, user).then((msg) => {
            console.log(`${host}:${port} => ${msg}`);
          })
        );
      }
    }
  }
  await Promise.all(jobs);
  console.log('done');
})();
