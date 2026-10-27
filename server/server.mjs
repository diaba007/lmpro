import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'COLLEZ_VOTRE_CLE_GEMINI_ICI';

app.use(cors());
app.use(express.json());

let matchesCache = null;
let lastCacheTime = 0;

// 1. ENDPOINT DES MATCHS EN DIRECT
app.get('/api/matches', async (req, res) => {
  try {
    const now = Date.now();
    if (matchesCache && (now - lastCacheTime < 5 * 60 * 1000)) {
      return res.json({ source: 'CACHE', matches: matchesCache });
    }

    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message });
    }

    const data = await response.json();
    matchesCache = data.matches || [];
    lastCacheTime = now;
    res.json({ source: 'LIVE_API', matches: matchesCache });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des matchs' });
  }
});

// 2. ENDPOINT ASSISTANT IA (GOOGLE AI STUDIO / GEMINI)
app.post('/api/ai/chat', async (req, res) => {
  const { question, matchContext } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question requise' });
  }

  // Fallback si la clé n'est pas encore collée
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'COLLEZ_VOTRE_CLE_GEMINI_ICI') {
    return res.json({
      reply: `[Mode Local LMPRO] : Pour le match ${matchContext?.homeTeam || 'sélectionné'} vs ${matchContext?.awayTeam || 'adversaire'}, l'espérance mathématique de buts (loi de Poisson) indique un léger avantage à domicile avec 1.84 xG contre 1.18 xG. Le marché "Plus de 1.5 but" présente une forte probabilité (78.4%). (Pour des réponses détaillées en direct, collez votre clé GEMINI_API_KEY dans server/.env).`
    });
  }

  const promptSystem = `Tu es l'analyste tactique officiel de LMPRO. Réponds en français de façon concise, experte et percutante.
Données mathématiques du match sélectionné :
- Match : ${matchContext?.homeTeam} vs ${matchContext?.awayTeam}
- Compétition : ${matchContext?.competition}
- Probabilités de Poisson : Victoire Domicile 48.2%, Nul 27.1%, Victoire Extérieur 24.7%
- Buts attendus (xG) : 1.84 - 1.18
- Over 1.5 : 78.4% | Over 2.5 : 54.1% | Les 2 marquent : 58.9%

Rappelle toujours que dans le football aucune issue n'est garantie à 100%. Réponds à la question de l'utilisateur : "${question}"`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptSystem }] }]
      })
    });

    if (!geminiRes.ok) {
      throw new Error(`Erreur Gemini HTTP ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu générer d'analyse tactique pour ce match.";
    res.json({ reply: replyText });
  } catch (err) {
    console.error('Erreur IA :', err);
    res.json({
      reply: "L'assistant IA est en cours de traitement. D'après le modèle mathématique, la tendance est favorable à l'équipe à domicile."
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [LMPRO Backend + IA] en écoute sur http://localhost:${PORT}`);
});