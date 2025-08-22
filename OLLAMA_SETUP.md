# Ollama Setup Guide

Tämä opas auttaa sinua asentamaan ja konfiguroimaan Ollama paikallisen LLM:n
käyttöä varten.

## 1. Ollama Asennus

### Windows

1. Lataa Ollama Windows-installer: [ollama.ai/download/windows](https://ollama.ai/download/windows)
2. Suorita installer ja seuraa ohjeita
3. Käynnistä Ollama palvelin

### macOS

```bash
# Homebrew:lla
brew install ollama

# Tai lataa installer: [ollama.ai/download/macos](https://ollama.ai/download/macos)
```

### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## 2. Ollama Palvelimen Käynnistys

### Windows Palvelin

Ollama käynnistyy automaattisesti asennuksen jälkeen. Jos ei:

```bash
ollama serve
```

### macOS/Linux

```bash
ollama serve
```

## 3. Mallin Lataus

Lataa Llama 3.2 malli (suosittelemme tätä kevyt mallia)

```bash
ollama pull llama3.2
```

### Vaihtoehtoiset mallit

**Nopeampi, kevyempi:**

```bash
ollama pull llama3.2:3b
```

**Suurempi, tarkempi:**

```bash
ollama pull llama3.2:70b
```

**Suomenkielinen malli:**

```bash
ollama pull finnish-llama
```

## 4. Mallin Testaus

Testaa että malli toimii:

```bash
ollama run llama3.2 "Hei, mitä kuuluu?"
```

## 5. Kehityspalvelimen Käynnistys

```bash
npm run dev
```

## 6. Chatbotin Testaus

1. Avaa selain osoitteessa: [localhost:3000](http://localhost:3000)
2. Aloita keskustelu chatbotin kanssa
3. Chatbot käyttää nyt paikallista Ollama LLM:ää

## 7. Ongelmatilanteet

### Ollama ei vastaa

```bash
# Tarkista että palvelin on käynnissä
ollama list

# Käynnistä palvelin uudelleen
ollama serve
```

### Malli ei lataudu

```bash
# Tarkista internet-yhteys
# Kokeile uudelleen
ollama pull llama3.2
```

### Chatbot ei vastaa

1. Tarkista että Ollama palvelin on käynnissä
2. Tarkista että malli on ladattu: `ollama list`
3. Tarkista selaimen developer tools (F12) virheiden varalta

## 8. Suorituskyky

### RAM Vaatimukset

- **llama3.2:3b**: ~4GB RAM
- **llama3.2**: ~8GB RAM
- **llama3.2:70b**: ~40GB RAM

### GPU Tuki

Jos sinulla on GPU, Ollama käyttää sitä automaattisesti nopeuttaakseen mallia.

#### GPU Konfiguraatio

**NVIDIA GPU:**

```bash
# Tarkista CUDA asennus
nvidia-smi

# Ollama käyttää GPU:ta automaattisesti
ollama run llama3.2 --gpu-layers 50
```

**AMD GPU:**

```bash
# Asenna ROCm
sudo apt install rocm-hip-sdk

# Käynnistä ROCm:llä
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

**Apple Silicon:**

```bash
# Ei erillistä konfiguraatiota tarvita
# Metal Performance Shaders toimii automaattisesti
```

#### GPU Optimointi

```bash
# GPU kerrokset (0-50)
ollama run llama3.2 --gpu-layers 50

# CPU säikeet
ollama run llama3.2 --num-thread 8

# Batch koko
ollama run llama3.2 --batch-size 512
```

Katso yksityiskohtaiset ohjeet: [ollama-gpu-config.md](./ollama-gpu-config.md)

## 9. Konfiguraatio

### Ollama Konfiguraatio

Luo `~/.ollama/config.json`:

```json
{
  "host": "127.0.0.1:11434",
  "gpu_layers": 50,
  "models": {
    "llama3.2": {
      "temperature": 0.7,
      "top_p": 0.9,
      "gpu_layers": 50,
      "num_thread": 8,
      "batch_size": 512
    }
  }
}
```

**GPU Optimointi:**

- `gpu_layers: 50` - Käytä GPU:ta 50 kerrokselle
- `num_thread: 8` - Käytä 8 CPU säiettä
- `batch_size: 512` - Optimoi GPU batch koko

### API Route Konfiguraatio

Muokkaa `src/app/api/chat/route.ts`:

```typescript
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
  const { messages } = await req.json();

  const ollamaRequest: OllamaRequest = {
    model: "llama3.2",
    messages,
    stream: false,
    options: {
      temperature: 0.7, // Kreatiivisuus (0.0-1.0)
      num_predict: 1000, // Maksimi vastauksen pituus
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

    const data: OllamaResponse = await response.json();

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
```

**Huomio**: Vercel AI SDK v5 ei tue Ollamaa suoraan, joten käytämme Ollama REST API:a.

## 10. Käytännön Vinkkejä

1. **Aloita kevyellä mallilla** (3B) nopean testauksen vuoksi
2. **Käytä GPU:tä** jos mahdollista nopeuttaaksesi mallia
3. **Säätää temperature-parametria** vastauksen luovuuden mukaan
4. **Tarkkaile RAM-käyttöä** suurempien mallien kanssa

## 11. Hyödyllisiä Komentoja

```bash
# Listaa ladatut mallit
ollama list

# Poista malli
ollama rm llama3.2

# Näytä mallin tiedot
ollama show llama3.2

# Käynnistä interaktiivinen chat
ollama run llama3.2

# Pysäytä palvelin
ollama stop
```

## 12. Vercel AI SDK v5.0.22

Tämä projekti käyttää Vercel AI SDK:n uusinta versiota (5.0.22), joka tarjoaa:

- Parannellun streaming-tuen
- Paremman virheenkäsittelyn
- Optimoidun suorituskyvyn
- Uusia AI provider -integraatioita

### Uudet ominaisuudet

- `generateText()` funktio tekstin generointiin
- Parempi TypeScript-tuki
- Optimoidut React-hookit
- Yksinkertaistetut import-polut (kaikki `ai` paketista)

### Ollama Integraatio

Vercel AI SDK v5 ei tue Ollamaa suoraan, joten käytämme Ollama REST API:a:

- Suora HTTP-kutsu Ollama API:in
- TypeScript-tyypit Ollama request/response:lle
- Virheenkäsittely ja fallback-viestit
