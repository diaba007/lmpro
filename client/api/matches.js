export default async function handler(req, res) {
  // Clés des différentes APIs (lues depuis l'environnement ou configurables)
  const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY || '';
  const ODDS_API_KEY = process.env.THE_ODDS_API_KEY || ''; // Optionnel : The Odds API
  const RAPIDAPI_KEY = process.env.RAPIDAPI_FOOTBALL_KEY || ''; // Optionnel : API-Football

  let aggregatedMatches = [];

  // ==============================================================
  // SOURCE 1 : football-data.org v4 (Europe : PL, SA, PD, FL1, CL)
  // ==============================================================
  if (FOOTBALL_DATA_KEY) {
    try {
      const fbResponse = await fetch('https://api.football-data.org/v4/matches', {
        headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
      });
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        if (fbData.matches && Array.isArray(fbData.matches)) {
          aggregatedMatches.push(...fbData.matches);
        }
      }
    } catch (err) {
      console.log('Erreur Source 1 (football-data) :', err.message);
    }
  }

  // ==============================================================
  // SOURCE 2 : TheSportsDB / API-Football (Afrique & Coupes)
  // ==============================================================
  // Si peu de matchs trouvés ou pour compléter avec les coupes et l'Afrique
  try {
    // Appel gratuit TheSportsDB (Open-Source) pour récupérer les matchs du jour
    const todayStr = new Date().toISOString().split('T')[0];
    const tsdbResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${todayStr}&s=Soccer`);
    
    if (tsdbResponse.ok) {
      const tsdbData = await tsdbResponse.json();
      if (tsdbData.events && Array.isArray(tsdbData.events)) {
        // Normalisation au format standard LMPRO
        const formattedTsdb = tsdbData.events.slice(0, 15).map(ev => ({
          id: Number(ev.idEvent) || Date.now() + Math.random(),
          competition: { 
            name: ev.strLeague || 'Coupe / International', 
            code: ev.strLeague?.includes('CAF') || ev.strLeague?.includes('Africa') ? 'CAF' : 'CUP' 
          },
          utcDate: `${ev.dateEvent}T${ev.strTime || '18:00:00'}Z`,
          status: ev.strStatus === 'Match Finished' ? 'FINISHED' : 'TIMED',
          homeTeam: { name: ev.strHomeTeam, shortName: ev.strHomeTeam, crest: ev.strHomeTeamBadge || '' },
          awayTeam: { name: ev.strAwayTeam, shortName: ev.strAwayTeam, crest: ev.strAwayTeamBadge || '' },
          score: {
            fullTime: {
              home: ev.intHomeScore !== null ? Number(ev.intHomeScore) : null,
              away: ev.intAwayScore !== null ? Number(ev.intAwayScore) : null
            }
          }
        }));

        // Ajout sans doublons
        formattedTsdb.forEach(m => {
          if (!aggregatedMatches.some(existing => existing.homeTeam.name.toLowerCase() === m.homeTeam.name.toLowerCase())) {
            aggregatedMatches.push(m);
          }
        });
      }
    }
  } catch (err) {
    console.log('Erreur Source 2 (TheSportsDB) :', err.message);
  }

  // ==============================================================
  // SOURCE 3 : The Odds API (Injection des Cotes Réelles de Marché)
  // ==============================================================
  let liveOddsMap = {};
  if (ODDS_API_KEY) {
    try {
      const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h`);
      if (oddsRes.ok) {
        const oddsData = await oddsRes.json();
        if (Array.isArray(oddsData)) {
          oddsData.forEach(game => {
            const bookie = game.bookmakers?.[0];
            const market = bookie?.markets?.find(m => m.key === 'h2h');
            if (market?.outcomes) {
              const h = market.outcomes.find(o => o.name === game.home_team)?.price;
              const a = market.outcomes.find(o => o.name === game.away_team)?.price;
              const d = market.outcomes.find(o => o.name === 'Draw')?.price;
              if (h && a) {
                liveOddsMap[`${game.home_team.toLowerCase()}_${game.away_team.toLowerCase()}`] = {
                  odds1: h.toFixed(2),
                  oddsX: d ? d.toFixed(2) : '3.40',
                  odds2: a.toFixed(2)
                };
              }
            }
          });
        }
      }
    } catch (err) {
      console.log('Erreur Source 3 (The Odds API) :', err.message);
    }
  }

  // Renvoie le flux combiné propre au frontend
  return res.status(200).json({
    source: 'MULTI_API_AGGREGATOR',
    totalFound: aggregatedMatches.length,
    matches: aggregatedMatches,
    liveOdds: liveOddsMap
  });
}