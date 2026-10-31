export default async function handler(req, res) {
  const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY || '5e979fe1a7884c7a8d5b30c04587438e';
  const ODDS_API_KEY = process.env.THE_ODDS_API_KEY || '3f463f2465a3d64783606ca538ce0f2d';
  const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY || '091298ff702ba3e403cba3d598a668e5';

  let aggregatedMatches = [];
  let liveOddsMap = {};
  let debugLogs = [];

  // ==============================================================
  // 1. THE ODDS API (Fournit les vrais matchs d'aujourd'hui + cotes)
  // ==============================================================
  if (ODDS_API_KEY) {
    try {
      const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h`);
      if (oddsRes.ok) {
        const oddsData = await oddsRes.json();
        if (Array.isArray(oddsData) && oddsData.length > 0) {
          oddsData.forEach((game, idx) => {
            // A. Détection automatique du Championnat (Serie A, Bundesliga, Premier League, etc.)
            const title = (game.sport_title || '').toLowerCase();
            const key = (game.sport_key || '').toLowerCase();
            let compName = game.sport_title || 'Football';
            let compCode = 'OTHER';

            if (key.includes('italy') || title.includes('serie a')) {
              compCode = 'SA';
              compName = 'Serie A';
            } else if (key.includes('epl') || title.includes('premier league')) {
              compCode = 'PL';
              compName = 'Premier League';
            } else if (key.includes('spain') || title.includes('la liga')) {
              compCode = 'PD';
              compName = 'La Liga';
            } else if (key.includes('germany') || title.includes('bundesliga')) {
              compCode = 'BL1';
              compName = 'Bundesliga';
            } else if (key.includes('france') || title.includes('ligue 1')) {
              compCode = 'FL1';
              compName = 'Ligue 1';
            } else if (key.includes('uefa') || title.includes('champions league')) {
              compCode = 'CL';
              compName = 'Champions League';
            } else if (key.includes('africa') || title.includes('caf')) {
              compCode = 'CAF';
              compName = 'Afrique & CAF';
            }

            // B. Extraction des Cotes 1X2 réelles
            const bookie = game.bookmakers?.[0];
            const market = bookie?.markets?.find(m => m.key === 'h2h');
            let hOdds = '2.10', aOdds = '3.20', dOdds = '3.30';

            if (market?.outcomes) {
              const h = market.outcomes.find(o => o.name === game.home_team)?.price;
              const a = market.outcomes.find(o => o.name === game.away_team)?.price;
              const d = market.outcomes.find(o => o.name === 'Draw')?.price;
              if (h) hOdds = h.toFixed(2);
              if (a) aOdds = a.toFixed(2);
              if (d) dOdds = d.toFixed(2);
            }

            const matchKey = `${game.home_team.toLowerCase()}_${game.away_team.toLowerCase()}`;
            liveOddsMap[matchKey] = {
              odds1: hOdds,
              oddsX: dOdds,
              odds2: aOdds
            };

            // C. CRÉATION DU VRAI MATCH DANS LA LISTE LMPRO
            const matchObj = {
              id: Number(game.id.replace(/\D/g, '').slice(0, 8)) || (Date.now() + idx),
              competition: {
                name: compName,
                code: compCode
              },
              utcDate: game.commence_time,
              status: new Date(game.commence_time) < new Date() ? 'IN_PLAY' : 'TIMED',
              homeTeam: {
                name: game.home_team,
                shortName: game.home_team
              },
              awayTeam: {
                name: game.away_team,
                shortName: game.away_team
              },
              score: {
                fullTime: { home: null, away: null }
              }
            };

            aggregatedMatches.push(matchObj);
          });

          debugLogs.push(`The Odds API: ${aggregatedMatches.length} vrais matchs chargés`);
        }
      }
    } catch (e) {
      debugLogs.push(`The Odds API: ${e.message}`);
    }
  }

  // ==============================================================
  // 2. FOOTBALL-DATA.ORG (Complément si disponible)
  // ==============================================================
  if (FOOTBALL_DATA_KEY) {
    try {
      const fbRes = await fetch('https://api.football-data.org/v4/matches', {
        headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
      });
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (Array.isArray(fbData.matches)) {
          fbData.matches.forEach(m => {
            if (!aggregatedMatches.some(ex => ex.homeTeam.name.toLowerCase() === m.homeTeam.name.toLowerCase())) {
              aggregatedMatches.push(m);
            }
          });
        }
      }
    } catch (e) {
      debugLogs.push(`football-data: ${e.message}`);
    }
  }

  return res.status(200).json({
    source: 'MULTI_API_AGGREGATOR',
    totalFound: aggregatedMatches.length,
    matches: aggregatedMatches,
    liveOdds: liveOddsMap,
    debug: debugLogs
  });
}