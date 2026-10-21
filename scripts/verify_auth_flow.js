const fs = require('fs');
const mongoose = require('mongoose');

async function test() {
  const ts = Date.now();
  const email = `smoke_test_${ts}@parakh-test.internal`;
  const name = 'Smoke Tester';
  const password = 'TestPassword123!';

  console.log('--- TEST 1: Register ---');
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Host': 'localhost:3000', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ name, email, password })
  });
  console.log('Register status:', regRes.status);
  const regCookie = regRes.headers.get('set-cookie');
  console.log('Register has set-cookie:', !!regCookie && regCookie.includes('parakh_token'));
  const regJson = await regRes.json();
  console.log('Register ok:', regJson.ok, 'role:', regJson.user?.role);

  console.log('\n--- TEST 2: GET /api/auth/me with Register Cookie ---');
  const cookieVal = regCookie ? regCookie.split(';')[0] : '';
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Cookie': cookieVal }
  });
  console.log('Me status:', meRes.status);
  const meJson = await meRes.json();
  console.log('Me ok:', meJson.ok, 'user email matches:', meJson.user?.email === email);

  console.log('\n--- TEST 3: Login ---');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Host': 'localhost:3000', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email, password })
  });
  console.log('Login status:', loginRes.status);
  const loginCookie = loginRes.headers.get('set-cookie');
  console.log('Login has set-cookie:', !!loginCookie && loginCookie.includes('parakh_token'));
  const loginJson = await loginRes.json();
  console.log('Login ok:', loginJson.ok);

  console.log('\n--- TEST 4: Logout ---');
  const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: { 'Host': 'localhost:3000', 'Origin': 'http://localhost:3000', 'Cookie': cookieVal }
  });
  console.log('Logout status:', logoutRes.status);
  const logoutCookie = logoutRes.headers.get('set-cookie');
  console.log('Logout clears cookie:', !!logoutCookie && (logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires=')));

  console.log('\n--- TEST 5: GET /api/auth/me after logout ---');
  const meAfterLogout = await fetch('http://localhost:3000/api/auth/me');
  console.log('Me after logout status:', meAfterLogout.status);

  // Clean up
  const env = fs.readFileSync('.env.local', 'utf-8');
  let uri = '';
  for (const l of env.split('\n')) {
    if (l.trim().startsWith('MONGODB_URI=')) {
      uri = l.trim().substring('MONGODB_URI='.length).replace(/^['"]|['"]$/g, '');
    }
  }
  await mongoose.connect(uri);
  await mongoose.connection.collection('users').deleteOne({ email });
  await mongoose.disconnect();
  console.log('\nCleanup completed: Test user deleted from MongoDB Atlas.');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
