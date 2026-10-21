// Verify all LeetCode slugs from the Apna College manifest via LeetCode GraphQL API
const fs = require('fs');

async function verify() {
  const questions = JSON.parse(fs.readFileSync('fixtures/questions_apna_college.json', 'utf8'));
  const query = 'query questionTitle($titleSlug: String!) { question(titleSlug: $titleSlug) { questionFrontendId title titleSlug difficulty } }';
  
  let verified = 0;
  let failed = 0;
  const failures = [];
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const slug = q.leetcodeUrl.replace('https://leetcode.com/problems/', '').replace(/\/$/, '');
    try {
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ query, variables: { titleSlug: slug } })
      });
      const d = await res.json();
      if (d.data && d.data.question && d.data.question.title) {
        console.log('[OK] #' + d.data.question.questionFrontendId + ' ' + d.data.question.title + ' (' + d.data.question.difficulty + ') slug=' + slug);
        verified++;
      } else {
        console.log('[FAIL] ' + slug + ' -> No question found');
        failed++;
        failures.push(slug);
      }
    } catch (e) {
      console.log('[ERROR] ' + slug + ' -> ' + e.message);
      failed++;
      failures.push(slug);
    }
    // Small delay to avoid rate limiting
    if (i % 10 === 9) await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log('Verified: ' + verified + '/' + questions.length);
  console.log('Failed: ' + failed);
  if (failures.length > 0) {
    console.log('Failed slugs: ' + failures.join(', '));
  }
}

verify();
