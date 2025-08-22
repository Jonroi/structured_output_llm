import { Chatbot } from "~/app/_components/chatbot";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Chatbot</h1>
          <p className="text-gray-600">
            Keskustele paikallisen Ollama LLM:n kanssa
          </p>
        </div>

        <div className="flex justify-center">
          <Chatbot />
        </div>
      </div>
    </main>
  );
}
