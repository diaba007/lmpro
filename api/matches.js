export default async function handler(req, res) {
  // Récupération des clés secrètes depuis le coffre-fort Vercel
  const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY || '';
  const ODDS_API_KEY = process.env.THE_ODDS_API_KEY || '';
  const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY || '091298ff702ba3e403cba3d598a668e5';

  let aggregatedMatches = [];
  let liveOddsMap = {};
  let debugLogs = [];

  // Date du jour au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // 1. APPEL FOOTBALL-DATA.ORG (Top Ligues Européennes)
  if (FOOTBALL_DATA_KEY) {
    try {
      // On interroge les matchs du jour
      const fbRes = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`, {
        headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
      });
      
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (Array.isArray(fbData.matches) && fbData.matches.length > 0) {
          aggregatedMatches.push(...fbData.matches);
          debugLogs.push(`football-data: ${fbData.matches.length} matchs trouvés`);
        } else {
          debugLogs.push('football-data: 0 match aujourd’hui');
        }
      } else {
        debugLogs.push(`football-data: Erreur HTTP ${fbRes.status}`);
      }
    } catch (e) {
      debugLogs.push(`football-data: ${e.message}`);
    }
  } else {
    debugLogs.push('football-data: Clé manquante dans Vercel');
  }

  // 2. APPEL THESPORTSDB (Coupes, Afrique & Matchs Internationaux)
  try {
    const tsdbRes = await fetch(`https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsday.php?d=${today}&s=Soccer`);
    if (tsdbRes.ok) {
      const tsdbData = await tsdbRes.json();
      if (Array.isArray(tsdbData.events) && tsdbData.events.length > 0) {
        const formatted = tsdbData.events.slice(0, 25).map(ev => ({
          id: Number(ev.idEvent) || Date.now() + Math.floor(Math.random() * 10000),
          competition: {
            name: ev.strLeague || 'Compétition',
            code: (ev.strLeague && (ev.strLeague.includes('CAF') || ev.strLeague.includes('Africa'))) ? 'CAF' : 'CUP'
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

        formatted.forEach(m => {
          if (!aggregatedMatches.some(ex => ex.homeTeam?.name?.toLowerCase() === m.homeTeam?.name?.toLowerCase())) {
            aggregatedMatches.push(m);
          }
        });
        debugLogs.push(`TheSportsDB: ${formatted.length} matchs ajoutés`);
      }
    }
  } catch (e) {
    debugLogs.push(`TheSportsDB: ${e.message}`);
  }

  // 3. APPEL THE ODDS API (Cotes réelles du marché)
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
                const key = `${game.home_team.toLowerCase()}_${game.away_team.toLowerCase()}`;
                liveOddsMap[key] = {
                  odds1: h.toFixed(2),
                  oddsX: d ? d.toFixed(2) : '3.40',
                  odds2: a.toFixed(2)
                };
              }
            }
          });
        }
      }
    } catch (e) {
      debugLogs.push(`The Odds API: ${e.message}`);
    }
  }

  return res.status(200).json({
    source: 'MULTI_API_AGGREGATOR',
    date: today,
    totalFound: aggregatedMatches.length,
    matches: aggregatedMatches,
    liveOdds: liveOddsMap,
    debug: debugLogs
  });
}