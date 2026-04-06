import { db } from "@/lib/db";
import { dbConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function DbTestPage() {
  let status = "Testing...";
  let error = null;
  let userCount = 0;

  try {
    // 1. Try a simple ping
    const res = await db.query<any>("SELECT 1 as connected");
    if (res[0]?.connected === 1) {
      status = "Connected ✅";
      
      // 2. Try to count users
      const users = await db.query<any>("SELECT COUNT(*) as count FROM User");
      userCount = users[0]?.count || 0;
    }
  } catch (err: any) {
    status = "Failed ❌";
    error = err.message;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Database Diagnosis</h1>
      <div style={{ padding: '1rem', background: error ? '#fee' : '#efe', borderRadius: '8px' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Database Host:</strong> {dbConfig.host}</p>
        <p><strong>Database User:</strong> {dbConfig.user}</p>
        {userCount > 0 && <p><strong>Users in Database:</strong> {userCount}</p>}
        {error && (
          <div style={{ marginTop: '1rem', color: 'red' }}>
            <strong>Error Details:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
          </div>
        )}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <a href="/auth/login" style={{ color: 'blue' }}>Back to Login</a>
      </div>
    </div>
  );
}
