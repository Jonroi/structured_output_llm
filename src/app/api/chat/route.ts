export const runtime = "edge";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OllamaRequest {
  model: string;
  messages: Message[];
  stream: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    num_gpu?: number; // GPU kerrokset
    num_thread?: number; // CPU säikeet
    batch_size?: number; // Batch koko
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Message[] };

  const ollamaRequest: OllamaRequest = {
    model: "llama3.2",
    messages,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 1000,
      num_gpu: 50, // GPU kerrokset
      num_thread: 8, // CPU säikeet
      batch_size: 512, // Batch koko GPU:lle
    },
  };

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ollamaRequest),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = (await response.json()) as OllamaResponse;

    return Response.json({ text: data.message.content });
  } catch (error) {
    console.error("Error calling Ollama:", error);
    return Response.json(
      {
        error:
          "Failed to connect to Ollama. Make sure it's running on localhost:11434",
      },
      { status: 500 },
    );
  }
}
