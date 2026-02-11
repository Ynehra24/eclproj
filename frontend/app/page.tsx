export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 px-8 py-12 flex items-center justify-center">
      <div className="bg-neutral-900 text-neutral-100 p-8 rounded-2xl shadow-xl w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4 text-center">
          Training Simulator
        </h1>

        <p className="text-neutral-400 mb-6 text-center">
          Generate role-based training scenarios dynamically.
        </p>

        <button className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg transition transform hover:scale-105 block mx-auto font-medium">
          Generate Scenario
        </button>
      </div>
    </main>
  );
}
