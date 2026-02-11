export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-4">
          Training Simulator
        </h1>

        <p className="text-slate-300 mb-6">
          Generate role-based training scenarios dynamically.
        </p>

        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
          Generate Scenario
        </button>
      </div>
    </main>
  );
}
