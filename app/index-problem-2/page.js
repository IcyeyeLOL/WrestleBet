export default function IndexPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">WrestleBet</h1>
        <p className="text-xl text-gray-300 mb-8">Welcome to the wrestling betting platform</p>
        <div className="space-y-4">
          <a 
            href="/account" 
            className="block bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Go to Account
          </a>
          <a 
            href="/bets" 
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
          >
            View Bets
          </a>
        </div>
      </div>
    </div>
  );
}
