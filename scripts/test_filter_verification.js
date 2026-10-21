// scripts/test_filter_verification.js
async function test() {
  const r1 = await fetch('http://localhost:3000/api/questions?company=amazon&difficulty=Easy').then(r => r.json());
  console.log('Amazon + Easy total:', r1.pagination.total);
  const r2 = await fetch('http://localhost:3000/api/questions?company=amazon&topic=Array').then(r => r.json());
  console.log('Amazon + Array total:', r2.pagination.total);
  const r3 = await fetch('http://localhost:3000/api/questions?company=amazon&search=two').then(r => r.json());
  console.log('Amazon + search "two" total:', r3.pagination.total);
  const r4 = await fetch('http://localhost:3000/api/questions?company=flipkart').then(r => r.json());
  console.log('Flipkart total:', r4.pagination.total);
  const r5 = await fetch('http://localhost:3000/api/questions?company=google').then(r => r.json());
  console.log('Google total:', r5.pagination.total);
  const r6 = await fetch('http://localhost:3000/api/questions?company=deloitte').then(r => r.json());
  console.log('Deloitte total:', r6.pagination.total);
  const r7 = await fetch('http://localhost:3000/api/questions?company=netlify').then(r => r.json());
  console.log('Netlify total:', r7.pagination.total, 'data length:', r7.data.length);
}
test();
