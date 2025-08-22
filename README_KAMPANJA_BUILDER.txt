KAMPANJA BUILDER - KÄYTTÖOHJE JA TOIMINTA
==========================================

MITÄ OHJELMA TEKEE:
------------------
Kampanja Builder on visuaalinen työkalu verkkosivujen muokkaamiseen kampanjoita varten.
Sovellus lataa verkkosivuja iframe:en ja mahdollistaa elementtien valinnan ja muokkaamisen.
AI-integraatio mahdollistaa sisällön automaattisen parantamisen Ollama:n avulla.

TEKNINEN TOTEUTUS:
-----------------
1. PROXY-JÄRJESTELMÄ
   - API route (/api/proxy) hakee ulkoisia verkkosivuja
   - Injektoi JavaScript-koodin elementtien valintaa varten
   - Kiertää CORS-rajoitukset
   - Korjaa suhteelliset URL:t absoluuttisiksi

2. ELEMENTTIEN VALINTA
   - Hiiren hover -> elementti korostuu sinisellä kehyksellä
   - Klikkaus -> elementti valitaan ja näkyy sivupaneelissa
   - CSS-selektori ja sisältö tallennetaan automaattisesti
   - ESC-näppäin poistaa valintatilan

3. AI-INTEGRAATIO (OLLAMA)
   - Paikallinen Ollama-yhteys (http://localhost:11434)
   - Generoi parannettu sisältö valituille elementeille
   - Tukee rajoituksia ja ohjeita AI-generoinnille
   - Fallback mock-vastaukset jos Ollama ei ole käytettävissä
   - Structured JSON-output Zod-validoinnilla

KOMPONENTIT:
-----------
- Campaign Builder: Pääkomponentti (src/components/campaign/campaign-builder.tsx)
- AI Status: Näyttää Ollama:n tilan ja käytettävissä olevat mallit
- Proxy API: Hakee ja muokkaa verkkosivuja (src/app/api/proxy/route.ts)
- Test Page: Testiympäristö (/api/test-page)
- UI-komponentit: Puhtaat React-komponentit ilman Radix-riippuvuuksia

KÄYTTÖ:
------
1. Käynnistä ohjelma: npm run dev
2. Käynnistä Ollama: ollama serve (valinnainen, mutta suositeltu)
3. Avaa http://localhost:3001 (tai mikä portti on käytössä)
4. Lataa verkkosivu URL-kentästä tai käytä testisivua
5. Klikkaa "Load Website" 
6. Hover hiirellä -> elementit korostuvat sinisellä
7. Klikkaa elementtiä -> se valitaan sivupaneeliin
8. Muokkaa "Restrictions" ja "Guidance" kentät AI:lle
9. Klikkaa "Generate with AI" -> Ollama generoi parannetun sisällön
10. Näe tulokset reaaliajassa sivupaneelissa

AI-TOIMINNOT:
------------
- **Rajoitukset**: Esim. "Ei emoji, ammatillinen sävy"
- **Ohjeet**: Esim. "Tee siitä jännittävä ja toimintaorientoitunut"
- **Generointi**: Klikkaa "Generate with AI" -nappia
- **Tulokset**: Näet alkuperäisen ja parannetun sisällön
- **Vaihtoehdot**: AI tarjoaa useita vaihtoehtoja

TEKNISET YKSITYISKOHDAT:
-----------------------
- Next.js 15.5.0 (App Router, Turbopack)
- TypeScript (tiukat tyyppitarkistukset)
- Tailwind CSS + shadcn/ui
- tRPC API (type-safe API-kutsut)
- Zod-skeemojen validointi (structured AI output)
- Ollama API -integraatio (paikallinen AI)
- CORS-kiertävä proxy-järjestelmä

TIEDOSTOT:
---------
- src/components/campaign/campaign-builder.tsx - Pääkomponentti
- src/components/campaign/ai-status.tsx - AI-tilan näyttö
- src/app/api/proxy/route.ts - Proxy-palvelin
- src/app/api/test-page/route.ts - Testiympäristö
- src/lib/ollama-client.ts - Ollama API -client
- src/lib/ai-functions.ts - AI-funktiot
- src/lib/types/ai-output.ts - TypeScript-tyypit
- src/components/ui/ - Puhtaat React-komponentit

VAATIMUKSET:
-----------
- Node.js 18+
- Ollama (valinnainen, mutta suositeltu AI-toimintoja varten)
- Moderni selain (Chrome, Firefox, Safari, Edge)

KÄYNNISTYS:
----------
```bash
npm install
npm run dev
# Avaa http://localhost:3001
```

HUOMIOITA:
---------
- Toimii parhaiten paikallisessa kehitysympäristössä
- Ulkoisten sivujen lataus riippuu CORS-käytännöistä
- Testiympäristö (/api/test-page) on luotettavin testikohde
- Sovellus käynnistyy automaattisesti testisivulla
- Kaikki TypeScript-virheet ja lint-ongelmat on korjattu
- Prettier-muotoilu on ajettu kaikille tiedostoille

TUNNISTETUT OMINAISUUDET:
-------------------------
✅ Elementtien visuaalinen valinta ja korostus
✅ AI-generoitu sisällön parannus
✅ CORS-kiertävä proxy-järjestelmä
✅ Type-safe API-kutsut tRPC:llä
✅ Puhtaat React-komponentit ilman ulkoisia riippuvuuksia
✅ Reaaliaikainen sisällön muokkaus
✅ Fallback-toiminnallisuus AI:n puuttuessa
✅ Responsive design Tailwind CSS:llä
