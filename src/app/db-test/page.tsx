import { db } from "@/lib/db";
import { dbConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function DbTestPage() {
  let status = "Testing...";
  let error = null;
  let userCount = 0;
  let usersList: any[] = [];

  try {
    // 1. Try a simple ping
    const res = await db.query<any>("SELECT 1 as connected");
    if (res[0]?.connected === 1) {
      status = "Connected ✅";
      
      // 2. Fetch users summary
      const users = await db.query<any>("SELECT email, role FROM User LIMIT 10");
      userCount = users.length;
      usersList = users;
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
        <p><strong>Connected as:</strong> {dbConfig.user}</p>
        
        {userCount > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Registered Users ({userCount}):</strong>
            <ul style={{ fontSize: '14px', marginTop: '0.5rem' }}>
              {usersList.map((u, i) => (
                <li key={i}>{u.email} - <span style={{ fontWeight: 'bold', color: '#666' }}>[{u.role}]</span></li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <div style={{ marginTop: '1rem', color: 'red' }}>
            <strong>Error Details:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
          </div>
        )}
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <a href="/auth/login" style={{ color: 'blue' }}>Back to Login</a>
        <a href="/auth/register" style={{ color: 'green', fontWeight: 'bold' }}>Go to Admin Registration Form</a>
      </div>
    </div>
  );
}
