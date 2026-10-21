/**
 * Test Admin RBAC & 403 Protection on /api/admin/stats
 */

const BASE_URL = "http://localhost:3000";

async function testAdminRBAC() {
  const timestamp = Date.now();
  const testEmail = `student_rbac_${timestamp}@example.com`;
  const password = "Password123!";

  // 1. Register student
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "RBAC Student", email: testEmail, password }),
  });

  // 2. Login to get token
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: testEmail, password }),
  });

  let cookie = "";
  const cookies = loginRes.headers.getSetCookie();
  for (const c of cookies) {
    const match = c.match(/parakh_token=[^;]+/);
    if (match) cookie = match[0];
  }

  // 3. Try to access /api/admin/stats with student cookie
  const adminRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { cookie },
  });

  console.log("Status code for student accessing /api/admin/stats:", adminRes.status);
  const data = await adminRes.json();
  console.log("Response body:", data);

  if (adminRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for student accessing admin route, got ${adminRes.status}`);
  }

  console.log("✓ RBAC successfully blocked student from admin endpoint with 403 Forbidden");

  // Clean up student account
  await fetch(`${BASE_URL}/api/auth/account`, {
    method: "DELETE",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

testAdminRBAC().catch((err) => {
  console.error("RBAC TEST FAILED:", err);
  process.exit(1);
});
