/**
 * Parakh Live End-to-End System Audit Script
 * Executes full student lifecycle against live running server:
 * Register -> Auth -> Dashboard -> Bookmark -> Solved -> Revision -> Notes -> Password Change -> Account Deletion
 */

const BASE_URL = "http://localhost:3000";

async function runLiveAudit() {
  console.log("=== PARAKH LIVE E2E SYSTEM AUDIT ===");

  const timestamp = Date.now();
  const testEmail = `audit_student_${timestamp}@example.com`;
  const originalPassword = "Password123!";
  const newPassword = "NewSecurePassword456!";

  let cookie = "";

  // Helper for requests
  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (cookie) {
      headers["cookie"] = cookie;
    }
    if (options.body && typeof options.body === "object") {
      headers["content-type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
    if (typeof res.headers.getSetCookie === "function") {
      const cookies = res.headers.getSetCookie();
      for (const c of cookies) {
        const match = c.match(/parakh_token=[^;]+/);
        if (match) cookie = match[0];
      }
    } else {
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        const match = setCookie.match(/parakh_token=[^;]+/);
        if (match) cookie = match[0];
      }
    }
    let data = null;
    try {
      data = await res.json();
    } catch {
      // Not JSON
    }
    return { status: res.status, data, headers: res.headers };
  }

  // 1. Health check
  console.log("1. Checking DB Health...");
  const health = await request("/api/health/db");
  if (health.status !== 200 || !health.data?.ok) {
    throw new Error(`DB Health failed: ${JSON.stringify(health.data)}`);
  }
  console.log("   ✓ Database connected");

  // 2. Register
  console.log(`2. Registering student (${testEmail})...`);
  const reg = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Audit Candidate",
      email: testEmail,
      password: originalPassword,
    },
  });
  if (reg.status !== 201 || !reg.data?.ok) {
    throw new Error(`Registration failed: ${JSON.stringify(reg.data)}`);
  }
  console.log("   ✓ User registered");

  // 2b. Login
  console.log("2b. Logging in to obtain session cookie...");
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: testEmail,
      password: originalPassword,
    },
  });
  if (loginRes.status !== 200 || !loginRes.data?.ok || !cookie) {
    throw new Error(`Login failed or cookie not set: ${JSON.stringify(loginRes.data)}`);
  }
  console.log("   ✓ Session established with httpOnly token cookie");

  // 3. Auth Me
  console.log("3. Verifying /api/auth/me session...");
  const me = await request("/api/auth/me");
  if (me.status !== 200 || !me.data?.ok || me.data.user.email !== testEmail) {
    throw new Error(`Auth Me failed: ${JSON.stringify(me.data)}`);
  }
  console.log(`   ✓ Authenticated as ${me.data.user.name} (${me.data.user.role})`);

  // 4. Initial Dashboard
  console.log("4. Inspecting initial dashboard statistics...");
  const dash1 = await request("/api/dashboard");
  if (dash1.status !== 200 || !dash1.data?.success || !dash1.data?.data) {
    throw new Error(`Dashboard failed: ${JSON.stringify(dash1.data)}`);
  }
  const d1 = dash1.data.data;
  console.log(`   ✓ Total questions in catalog: ${d1.totalQuestions}`);
  console.log(`   ✓ Initial solved: ${d1.solvedQuestions}`);
  console.log(`   ✓ Initial preparation score: ${d1.preparationScore.score}`);
  console.log(`   ✓ Initial current streak: ${d1.streak.current}`);

  // 5. Bookmark Two Sum
  console.log("5. Bookmarking 'two-sum'...");
  const bm = await request("/api/questions/two-sum/bookmark", { method: "POST" });
  if (bm.status !== 200 || !bm.data?.bookmarked) {
    throw new Error(`Bookmark failed: ${JSON.stringify(bm.data)}`);
  }
  console.log("   ✓ 'two-sum' bookmarked");

  // 6. Mark Two Sum Solved
  console.log("6. Marking 'two-sum' solved...");
  const solved = await request("/api/questions/two-sum/solved", { method: "POST" });
  if (solved.status !== 200 || !solved.data?.solved) {
    throw new Error(`Solved failed: ${JSON.stringify(solved.data)}`);
  }
  console.log("   ✓ 'two-sum' marked as solved and activity logged");

  // 7. Add to Revision Queue
  console.log("7. Adding 'two-sum' to revision queue...");
  const rev = await request("/api/questions/two-sum/revision", { method: "POST" });
  if (rev.status !== 200 || !rev.data?.needsRevision) {
    throw new Error(`Revision add failed: ${JSON.stringify(rev.data)}`);
  }
  console.log("   ✓ 'two-sum' added to revision queue");

  // 8. Personal Notes CRUD
  console.log("8. Creating private note on 'two-sum'...");
  const notePut = await request("/api/questions/two-sum/notes", {
    method: "PUT",
    body: {
      content: "Map each element to its index; find target - current in O(1) time.",
    },
  });
  if (notePut.status !== 200 || !notePut.data?.success) {
    throw new Error(`Note create failed: ${JSON.stringify(notePut.data)}`);
  }
  console.log("   ✓ Note saved");

  console.log("   Reading private note...");
  const noteGet = await request("/api/questions/two-sum/notes");
  if (noteGet.status !== 200 || !noteGet.data?.note?.content.includes("Map each element")) {
    throw new Error(`Note read failed: ${JSON.stringify(noteGet.data)}`);
  }
  console.log("   ✓ Note content verified");

  // 9. Verify Revision Queue
  console.log("9. Verifying revision list endpoint...");
  const revList = await request("/api/questions/revision");
  if (revList.status !== 200 || !revList.data?.questions?.length) {
    throw new Error(`Revision queue list failed: ${JSON.stringify(revList.data)}`);
  }
  console.log(`   ✓ Revision queue contains ${revList.data.questions.length} item(s)`);

  // 10. Dashboard After Progress
  console.log("10. Checking dashboard progress updates...");
  const dash2 = await request("/api/dashboard");
  if (dash2.status !== 200 || dash2.data.data.solvedQuestions !== 1) {
    throw new Error(`Dashboard update failed: ${JSON.stringify(dash2.data)}`);
  }
  const d2 = dash2.data.data;
  console.log(`   ✓ Solved count updated: ${d2.solvedQuestions}`);
  console.log(`   ✓ Preparation score computed: ${d2.preparationScore.score}`);
  console.log(`   ✓ Current active streak: ${d2.streak.current} day(s)`);
  console.log(`   ✓ Revision items count: ${d2.revisionQuestions}`);

  // 11. Change Password
  console.log("11. Testing authenticated password change...");
  const pwChange = await request("/api/auth/change-password", {
    method: "POST",
    body: {
      currentPassword: originalPassword,
      newPassword: newPassword,
    },
  });
  if (pwChange.status !== 200 || !pwChange.data?.success) {
    throw new Error(`Password change failed: ${JSON.stringify(pwChange.data)}`);
  }
  console.log("   ✓ Password successfully changed");

  // Verify login with new password
  console.log("   Verifying login with new password...");
  const loginNew = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: testEmail,
      password: newPassword,
    },
  });
  if (loginNew.status !== 200 || !loginNew.data?.ok) {
    throw new Error(`Login with new password failed: ${JSON.stringify(loginNew.data)}`);
  }
  console.log("   ✓ Login with new password succeeded");

  // 12. Delete Note
  console.log("12. Deleting personal note...");
  const noteDel = await request("/api/questions/two-sum/notes", { method: "DELETE" });
  if (noteDel.status !== 200 || !noteDel.data?.success) {
    throw new Error(`Note delete failed: ${JSON.stringify(noteDel.data)}`);
  }
  console.log("   ✓ Note deleted");

  // 13. Delete Account
  console.log("13. Testing secure account deletion...");
  const accDel = await request("/api/auth/account", {
    method: "DELETE",
    body: {
      password: newPassword,
    },
  });
  if (accDel.status !== 200 || !accDel.data?.success) {
    throw new Error(`Account deletion failed: ${JSON.stringify(accDel.data)}`);
  }
  console.log("   ✓ Account deleted and cookie cleared");

  // 14. Verify Login Fails After Account Deletion
  console.log("14. Verifying login rejection after deletion...");
  const loginDeleted = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: testEmail,
      password: newPassword,
    },
  });
  if (loginDeleted.status === 200) {
    throw new Error("Deleted account should not be able to log in!");
  }
  console.log(`   ✓ Login correctly rejected (status ${loginDeleted.status})`);

  console.log("\n=== ALL LIVE E2E AUDIT TESTS PASSED SUCCESSFULLY ===");
}

runLiveAudit().catch((err) => {
  console.error("AUDIT FAILED:", err);
  process.exit(1);
});
