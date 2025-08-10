export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>🔥 Test Page Working!</h1>
      <p>If you can see this, the Next.js server is running correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <a href="/admin" style={{ color: '#4ade80', textDecoration: 'underline' }}>
        Go to Admin Page
      </a>
    </div>
  );
}
