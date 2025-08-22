# AI Chatbot with Ollama

Tämä on kevyt AI chatbot, joka käyttää Vercel AI SDK:tä ja Ollama paikallista LLM:ää.

## Asennus

1. Asenna riippuvuudet:

   ```bash
   npm install
   ```

2. **Ollama Setup**: Katso yksityiskohtaiset ohjeet
   [OLLAMA_SETUP.md](./OLLAMA_SETUP.md)

   Lyhyt versio:
   - Lataa ja asenna [Ollama](https://ollama.ai/)
   - Käynnistä Ollama palvelin: `ollama serve`
   - Lataa malli: `ollama pull llama3.2`

3. Käynnistä kehityspalvelin:

   ```bash
   npm run dev
   ```

## Käyttö

- Avaa selain osoitteessa `http://localhost:3000`
- Aloita keskustelu chatbotin kanssa
- Chatbot käyttää paikallista Ollama LLM:ää vastauksien generointiin

## Teknologiat

- **Next.js 15** - React framework
- **Vercel AI SDK** - AI integraatiot
- **Ollama** - Paikallinen LLM
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Muutokset

- Puhdistettu etusivu
- Lisätty kevyt chatbot komponentti
- Integroitu Ollama paikallinen LLM
- Moderni ja responsiivinen UI
