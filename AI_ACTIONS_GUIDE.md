# AI Actions - Käyttöopas

## Yleiskatsaus

Tämä projekti käyttää **structured output** -tekniikkaa AI-toiminnallisuuden kanssa. Kaikki AI-vastaukset ovat type-safe ja validoitu Zod-skeemojen avulla.

## Arkkitehtuuri

### 1. **Zod-skeemat** (`src/lib/types/ai-output.ts`)

- Määrittelevät AI-vastauksien rakenteen
- Varmistavat type-safety:n
- Validoivat kaikki AI-vastaukset

### 2. **Ollama Client** (`src/lib/ollama-client.ts`)

- Käsittelee AI-kutsut Ollama API:in kanssa
- Luo strukturoidut promptit
- Parsii JSON-vastaukset

### 3. **AI-funktiot** (`src/lib/ai-functions.ts`)

- Pääfunktiot AI-toiminnallisuudelle
- Fallback-toiminnallisuus virhetilanteissa
- Type-safe palautusarvoja

## AI Actions - Toiminnallisuudet

### 1. **Sisällön Generointi** (`aiGeneratePageContent`)

```typescript
import { aiGeneratePageContent } from "~/lib/ai-functions";

const result = await aiGeneratePageContent(
  "Alkuperäinen teksti", // originalContent
  {
    campaignName: "Summer Sale 2025",
    targetAudience: "Young professionals",
    restrictions: ["Ei emoji", "Ammatillinen sävy"],
    guidance: "Tee siitä jännittävä",
  },
);

console.log(result.generatedContent); // AI:n parantama sisältö
console.log(result.confidence); // AI:n luottamus (0-1)
console.log(result.alternatives); // Vaihtoehtoiset versiot
```

**Palautusarvo:**

```typescript
{
  originalContent: string;
  generatedContent: string;
  reasoning: string;
  confidence: number; // 0-1
  alternatives?: string[];
}
```

### 2. **IPC-komentojen Generointi** (`aiGenerateIpc`)

```typescript
import { aiGenerateIpc } from "~/lib/ai-functions";

const result = await aiGenerateIpc(
  "update_element", // action
  {
    selector: ".hero-title",
    campaignId: "campaign-123",
    variantId: "variant-a",
  }, // target
  {
    content: "Uusi otsikko",
    styles: { color: "red" },
    attributes: { "data-campaign": "summer-sale" },
  }, // changes
  "session-456", // sessionId
);
```

**Palautusarvo:**

```typescript
{
  action: "update_element" | "add_element" | "remove_element" | "modify_style";
  target: {
    selector: string;
    campaignId: string;
    variantId?: string;
  };
  changes: {
    content?: string;
    styles?: Record<string, string>;
    attributes?: Record<string, string>;
  };
  metadata: {
    timestamp: string;
    userId?: string;
    sessionId: string;
  };
}
```

### 3. **Kampanjan Personalisointi** (`aiGenerateCampaignPersonalization`)

```typescript
import { aiGenerateCampaignPersonalization } from "~/lib/ai-functions";

const result = await aiGenerateCampaignPersonalization(
  "campaign-123", // campaignId
  [
    {
      selector: ".hero-title",
      originalContent: "Tervetuloa",
      aiGenerated: false,
      restrictions: ["Ei emoji"],
      guidance: "Tee siitä jännittävä",
    },
    {
      selector: ".cta-button",
      originalContent: "Osta nyt",
      aiGenerated: true,
      guidance: "Keskity konversioon",
    },
  ], // elements
);
```

**Palautusarvo:**

```typescript
{
  campaignId: string;
  elements: Array<{
    selector: string;
    originalContent: string;
    personalizedContent: string;
    aiGenerated: boolean;
    restrictions?: string[];
    guidance?: string;
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  }
}
```

## tRPC API -endpointit

### Sisällön Generointi

```typescript
// Frontend
const generateContent = api.personalization.generateContent.useMutation();

const result = await generateContent.mutateAsync({
  originalContent: "Alkuperäinen teksti",
  campaignName: "Summer Sale 2025",
  targetAudience: "Young professionals",
  restrictions: ["Ei emoji"],
  guidance: "Tee siitä jännittävä",
});
```

### IPC-komentojen Generointi

```typescript
// Frontend
const generateIpc = api.personalization.generateIpc.useMutation();

const result = await generateIpc.mutateAsync({
  action: "update_element",
  target: {
    selector: ".hero-title",
    campaignId: "campaign-123",
  },
  changes: {
    content: "Uusi otsikko",
  },
  sessionId: "session-456",
});
```

## Ollama-konfiguraatio

### 1. **Ollama asennus**

```bash
# Asenna Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Käynnistä Ollama
ollama serve

# Lataa malli
ollama pull llama3.2
```

### 2. **Mallin vaihtaminen**

Muokkaa `src/lib/ai-functions.ts` tiedostoa:

```typescript
const response = await ollamaClient.generate({
  model: "llama3.2", // Vaihda tähän haluamasi malli
  prompt,
  options: {
    temperature: 0.7, // Luovuuden taso (0-1)
    top_p: 0.9,
    num_predict: 500, // Maksimimäärä tokenia
  },
});
```

## Fallback-toiminnallisuus

Jos Ollama ei ole saatavilla, järjestelmä käyttää automaattisesti mock-vastauksia:

```typescript
// Jos Ollama ei ole saatavilla
const isAvailable = await ollamaClient.isAvailable();
if (!isAvailable) {
  // Käytä mock-vastauksia
  console.warn("Ollama is not available, using mock response");
  // ...
}
```

## Virheenkäsittely

Kaikki AI-funktiot sisältävät kattavan virheenkäsittelyn:

```typescript
try {
  const result = await aiGeneratePageContent(content, context);
  return result;
} catch (error) {
  console.error("AI generation failed:", error);
  // Fallback mock-vastaus
  return fallbackResponse;
}
```

## Kehitys

### Uuden AI-actionin lisääminen

1. **Lisää Zod-skeema** (`src/lib/types/ai-output.ts`):

```typescript
export const NewActionSchema = z.object({
  // Määrittele skeema
});

export type NewAction = z.infer<typeof NewActionSchema>;
```

**Lisää AI-funktio** (`src/lib/ai-functions.ts`):

```typescript
export async function aiNewAction(): Promise<NewAction> {
  // parametrit
  // Toteutus
}
```

1. **Lisää tRPC-endpoint** (`src/server/api/routers/personalization.ts`):

```typescript
newAction: publicProcedure
  .input(/* input schema */)
  .mutation(async ({ input }) => {
    return await aiNewAction(/* parametrit */);
  }),
```

## Best Practices

### 1. **Strukturoidut Promptit**

- Käytä aina tarkkoja JSON-formaatteja
- Määrittele selkeät ohjeet AI:lle
- Sisällytä esimerkit vastauksista

### 2. **Type Safety**

- Käytä Zod-skeemoja validointiin
- Varmista että kaikki tyypit ovat oikein
- Käytä TypeScript-tyyppejä

### 3. **Virheenkäsittely**

- Sisällytä fallback-toiminnallisuus
- Loggaa virheet selkeästi
- Palauta järkeviä oletusarvoja

### 4. **Suorituskyky**

- Käytä sopivia temperature-arvoja
- Rajoita token-määrää tarpeen mukaan
- Optimoi promptit

## Esimerkkejä

### Kampanjan luonti

```typescript
// 1. Luo kampanja
const campaign = {
  id: "summer-sale-2025",
  name: "Summer Sale 2025",
  targetAudience: "Young professionals",
};

// 2. Valitse elementit
const elements = [
  { selector: ".hero-title", content: "Tervetuloa" },
  { selector: ".cta-button", content: "Osta nyt" },
];

// 3. Generoi personalisointi
const personalization = await aiGenerateCampaignPersonalization(
  campaign.id,
  elements.map((el) => ({
    selector: el.selector,
    originalContent: el.content,
    aiGenerated: false,
    guidance: "Tee siitä jännittävä ja konversio-orientoitu",
  })),
);

// 4. Käytä tuloksia
personalization.elements.forEach((element) => {
  console.log(`${element.selector}: ${element.personalizedContent}`);
});
```

### Reaaliaikainen muokkaus

```typescript
// 1. Käyttäjä valitsee elementin
const selectedElement = {
  selector: ".hero-title",
  content: "Alkuperäinen otsikko",
};

// 2. Generoi parannettu sisältö
const improved = await aiGeneratePageContent(selectedElement.content, {
  campaignName: "Summer Sale 2025",
  targetAudience: "Young professionals",
  guidance: "Tee siitä jännittävä",
});

// 3. Luo IPC-komento
const ipc = await aiGenerateIpc(
  "update_element",
  {
    selector: selectedElement.selector,
    campaignId: "summer-sale-2025",
  },
  {
    content: improved.generatedContent,
  },
  "session-123",
);

// 4. Suorita muutos
executeIpcCommand(ipc);
```

## Yhteenveto

AI Actions -järjestelmä tarjoaa:

✅ **Type-safe AI-kutsut** Zod-skeemojen avulla  
✅ **Strukturoidut vastaukset** JSON-muodossa  
✅ **Fallback-toiminnallisuus** virhetilanteissa  
✅ **tRPC-integrointi** type-safe API:lle  
✅ **Ollama-tuki** paikallisille AI-malleille  
✅ **Kattava virheenkäsittely**

Järjestelmä on valmis tuotantokäyttöön ja tukee kaikki tärkeimmät AI-toiminnallisuudet kampanjan rakentamiseen.
