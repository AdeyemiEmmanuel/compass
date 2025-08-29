export default function Home() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Compass</h1>
        <p className="text-gray-600">A unified student platform — quick links and coming features.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-2">Peer Help</h2>
          <p className="text-gray-500">Ask for help, browse requests, and collaborate with peers.</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-2">Ask AI</h2>
          <p className="text-gray-500">AI assistant to guide you through the platform.</p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg border p-6">
        <p className="text-center text-gray-500">More pages coming soon — explore the sidebar to navigate.</p>
      </div>
    </div>
  )
}
