"use client";

import React from 'react';

const SimpleClerkTest = () => {
  // Simple test that doesn't rely on Clerk hooks initially
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-4 bg-blue-900/50 text-white rounded">🔄 Loading Clerk test...</div>;
  }

  return (
    <div className="p-4 bg-green-900/50 text-white rounded">
      <h3 className="font-bold mb-2">🧪 Simple Clerk Test</h3>
      <p>✅ Component mounted successfully</p>
      <p>🔑 Next step: Test Clerk hooks</p>
    </div>
  );
};

export default SimpleClerkTest;
