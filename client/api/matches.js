export default async function handler(req, res) {
  // Votre clé API football-data.org (configurée sur Vercel ou à coller ici)
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY || 'VOTRE_CLE_FOOTBALL_DATA_ICI';

  try {
    // Appel direct vers football-data.org v4 pour les matchs d'aujourd'hui
    // Compétitions ciblées : Serie A (SA), Premier League (PL), La Liga (PD), Ligue 1 (FL1), Champions League (CL)
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    
    // Renvoie les vrais matchs officiels du jour (Serie A, etc.)
    return res.status(200).json({ 
      source: 'LIVE_API_VERCEL',
      matches: data.matches || [] 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}