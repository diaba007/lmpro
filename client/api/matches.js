export default async function handler(req, res) {
  // LECTURE STRICTE ET SÉCURISÉE DEPUIS LE COFFRE-FORT VERCEL (AUCUNE CLÉ VISIBLE DANS LE CODE)
  const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY;
  const ODDS_API_KEY = process.env.THE_ODDS_API_KEY;
  const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY;

  let aggregatedMatches = [];
  let liveOddsMap = {};

  // 1. SOURCE : football-data.org (Top Ligues Européennes)
  if (FOOTBALL_DATA_KEY) {
    try {
      const fbRes = await fetch('https://api.football-data.org/v4/matches', {
        headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
      });
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (Array.isArray(fbData.matches)) {
          aggregatedMatches.push(...fbData.matches);
        }
      }
    } catch (e) {
      console.log('football-data.org temporairement indisponible');
    }
  }

  // 2. SOURCE : TheSportsDB (Coupes & Afrique)
  if (THESPORTSDB_KEY) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const tsdbRes = await fetch(`https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsday.php?d=${todayStr}&s=Soccer`);
      
      if (tsdbRes.ok) {
        const tsdbData = await tsdbRes.json();
        if (Array.isArray(tsdbData.events)) {
          const tsdbFormatted = tsdbData.events.slice(0, 20).map(ev => ({
            id: Number(ev.idEvent) || Date.now() + Math.floor(Math.random() * 10000),
            competition: {
              name: ev.strLeague || 'International',
              code: (ev.strLeague && (ev.strLeague.includes('CAF') || ev.strLeague.includes('Africa'))) ? 'CAF' : 'CUP'
            },
            utcDate: `${ev.dateEvent}T${ev.strTime || '18:00:00'}Z`,
            status: ev.strStatus === 'Match Finished' ? 'FINISHED' : 'TIMED',
            homeTeam: {
              name: ev.strHomeTeam,
              shortName: ev.strHomeTeam,
              crest: ev.strHomeTeamBadge || ''
            },
            awayTeam: {
              name: ev.strAwayTeam,
              shortName: ev.strAwayTeam,
              crest: ev.strAwayTeamBadge || ''
            },
            score: {
              fullTime: {
                home: ev.intHomeScore !== null ? Number(ev.intHomeScore) : null,
                away: ev.intAwayScore !== null ? Number(ev.intAwayScore) : null
              }
            }
          }));

          tsdbFormatted.forEach(m => {
            if (!aggregatedMatches.some(ex => ex.homeTeam?.name?.toLowerCase() === m.homeTeam?.name?.toLowerCase())) {
              aggregatedMatches.push(m);
            }
          });
        }
      }
    } catch (e) {
      console.log('TheSportsDB temporairement indisponible');
    }
  }

  // 3. SOURCE : The Odds API (Cotes réelles des bookmakers)
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
      console.log('The Odds API temporairement indisponible');
    }
  }

  return res.status(200).json({
    source: 'MULTI_API_AGGREGATOR_SECURE',
    totalFound: aggregatedMatches.length,
    matches: aggregatedMatches,
    liveOdds: liveOddsMap
  });
}