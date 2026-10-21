// scripts/verify_db_status.js
const fs = require('fs');
if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const companies = await db.collection('companies').find().toArray();
  const totalQuestions = await db.collection('questions').countDocuments();
  console.log('=== DATABASE VERIFICATION ===');
  console.log('Total Companies in DB:', companies.length);
  console.log('Total Questions in DB:', totalQuestions);
  console.log('\n--- Company Question Counts ---');
  for (const c of companies) {
    const count = await db.collection('questions').countDocuments({ companies: c._id });
    console.log(`${c.name} (${c.slug}): ${count} questions`);
  }
  const noLeetcode = await db.collection('questions').find({
    $or: [{ leetcodeUrl: { $exists: false } }, { leetcodeUrl: '' }, { leetcodeUrl: null }]
  }).toArray();
  console.log('\nQuestions without leetcodeUrl:', noLeetcode.length);
  noLeetcode.forEach(q => console.log(' - ' + q.title + ' (' + q.slug + ')'));
  await mongoose.disconnect();
}

check();
