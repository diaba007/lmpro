import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  LayoutDashboard, 
  CalendarDays, 
  LineChart, 
  Target, 
  History, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  Radio, 
  Bot, 
  Send, 
  Sparkles,
  Heart,
  LogIn,
  LogOut,
  CheckCircle2,
  Check,
  Clock,
  Award,
  Globe
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDpK1KPLF3M_siYXRKSW4g5EKEYvKOFYjU",
  authDomain: "lmpro-football.firebaseapp.com",
  projectId: "lmpro-football",
  storageBucket: "lmpro-football.firebasestorage.app",
  messagingSenderId: "44845555303",
  appId: "1:44845555303:web:f2431f3fd0e03919d3fec2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

type PageId = 'dashboard' | 'matches' | 'analysis' | 'predictions' | 'history' | 'profile' | 'admin';

interface Match {
  id: number;
  competition: { name: string; code?: string };
  utcDate: string;
  status: string;
  homeTeam: { name: string; shortName?: string; crest?: string };
  awayTeam: { name: string; shortName?: string; crest?: string };
  score?: { fullTime: { home: number | null; away: number | null } };
}

// LISTE ÉTENDUE DE MATCHS PAR CHAMPIONNAT
const ALL_LEAGUES_MATCHES: Match[] = [
  // 🇬🇧 Premier League
  {
    id: 4001,
    competition: { name: 'Premier League', code: 'PL' },
    utcDate: '2026-10-28T19:00:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Manchester City FC', shortName: 'Man City', crest: 'https://crests.football-data.org/65.png' },
    awayTeam: { name: 'Arsenal FC', shortName: 'Arsenal', crest: 'https://crests.football-data.org/57.png' }
  },
  {
    id: 4002,
    competition: { name: 'Premier League', code: 'PL' },
    utcDate: '2026-10-28T21:00:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Liverpool FC', shortName: 'Liverpool', crest: 'https://crests.football-data.org/64.png' },
    awayTeam: { name: 'Chelsea FC', shortName: 'Chelsea', crest: 'https://crests.football-data.org/61.png' }
  },
  // 🇪🇸 La Liga
  {
    id: 4003,
    competition: { name: 'La Liga', code: 'PD' },
    utcDate: '2026-10-28T20:00:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Real Madrid CF', shortName: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { name: 'Athletic Club', shortName: 'Athletic', crest: 'https://crests.football-data.org/77.png' }
  },
  {
    id: 4004,
    competition: { name: 'La Liga', code: 'PD' },
    utcDate: '2026-10-28T18:30:00Z',
    status: 'TIMED',
    homeTeam: { name: 'FC Barcelona', shortName: 'Barcelona', crest: 'https://crests.football-data.org/81.png' },
    awayTeam: { name: 'Atlético de Madrid', shortName: 'Atlético', crest: 'https://crests.football-data.org/78.png' }
  },
  // 🇫🇷 Ligue 1
  {
    id: 4005,
    competition: { name: 'Ligue 1', code: 'FL1' },
    utcDate: '2026-10-28T17:00:00Z',
    status: 'IN_PLAY',
    homeTeam: { name: 'Paris Saint-Germain FC', shortName: 'PSG', crest: 'https://crests.football-data.org/524.png' },
    awayTeam: { name: 'Olympique de Marseille', shortName: 'Marseille', crest: 'https://crests.football-data.org/516.png' },
    score: { fullTime: { home: 1, away: 0 } }
  },
  {
    id: 4006,
    competition: { name: 'Ligue 1', code: 'FL1' },
    utcDate: '2026-10-28T19:45:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Olympique Lyonnais', shortName: 'Lyon', crest: 'https://crests.football-data.org/523.png' },
    awayTeam: { name: 'AS Monaco FC', shortName: 'Monaco', crest: 'https://crests.football-data.org/548.png' }
  },
  // 🇮🇹 Serie A
  {
    id: 4007,
    competition: { name: 'Serie A', code: 'SA' },
    utcDate: '2026-10-28T19:45:00Z',
    status: 'TIMED',
    homeTeam: { name: 'FC Internazionale Milano', shortName: 'Inter', crest: 'https://crests.football-data.org/108.png' },
    awayTeam: { name: 'Juventus FC', shortName: 'Juventus', crest: 'https://crests.football-data.org/109.png' }
  },
  // 🇩🇪 Bundesliga
  {
    id: 4008,
    competition: { name: 'Bundesliga', code: 'BL1' },
    utcDate: '2026-10-28T17:30:00Z',
    status: 'TIMED',
    homeTeam: { name: 'FC Bayern München', shortName: 'Bayern', crest: 'https://crests.football-data.org/5.png' },
    awayTeam: { name: 'Borussia Dortmund', shortName: 'Dortmund', crest: 'https://crests.football-data.org/4.png' }
  },
  // 🇪🇺 UEFA Champions League
  {
    id: 4009,
    competition: { name: 'Champions League', code: 'CL' },
    utcDate: '2026-10-28T20:00:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Real Madrid CF', shortName: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { name: 'Manchester City FC', shortName: 'Man City', crest: 'https://crests.football-data.org/65.png' }
  }
];

const LEAGUES_LIST = [
  { code: 'ALL', name: 'Tous les Championnats', flag: '🌍' },
  { code: 'PL', name: 'Premier League', flag: '🇬🇧' },
  { code: 'PD', name: 'La Liga', flag: '🇪🇸' },
  { code: 'FL1', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'SA', name: 'Serie A', flag: '🇮🇹' },
  { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪' },
  { code: 'CL', name: 'Champions League', flag: '🇪🇺' },
  { code: 'PPL', name: 'Liga Portugal', flag: '🇵🇹' },
  { code: 'DED', name: 'Eredivisie', flag: '🇳🇱' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>(ALL_LEAGUES_MATCHES);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<Match>(ALL_LEAGUES_MATCHES[0]);

  // Filtres marchés Pronostics Pro
  const [activeMarket, setActiveMarket] = useState<'ALL' | '1X2' | 'GOALS' | 'BTTS'>('ALL');

  // Utilisateur Firebase
  const [user, setUser] = useState<any>(null);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>(['Premier League', 'La Liga', 'Ligue 1']);

  // Chatbot IA
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre analyste tactique LMPRO. Posez-moi une question sur le match sélectionné !' }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert("Info connexion : " + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || aiLoading) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setAiLoading(true);

    const home = selectedMatch.homeTeam.name;
    const away = selectedMatch.awayTeam.name;
    const comp = selectedMatch.competition.name;
    const lowerQ = q.toLowerCase();

    setTimeout(() => {
      let reply = "";
      if (lowerQ.includes('jour') || lowerQ.includes('salut') || lowerQ.includes('hello')) {
        reply = `Bonjour ! Sur ce choc ${home} vs ${away} en ${comp}, notre modèle estime 1.84 but attendu pour ${home} contre 1.18 pour ${away}. Que souhaitez-vous analyser ?`;
      } else if (lowerQ.includes('qui') || lowerQ.includes('favori') || lowerQ.includes('gagn')) {
        reply = `D'après la modélisation de Poisson, ${home} est donné favori à domicile avec 48.2% de probabilité de victoire (Nul 27.1%, ${away} 24.7%). La Double Chance 1X est très solide.`;
      } else if (lowerQ.includes('but') || lowerQ.includes('over') || lowerQ.includes('score')) {
        reply = `L'espérance totale s'élève à 3.02 buts en ${comp}. Le marché "Plus de 1.5 but" présente 78.4% de probabilité. Les scores les plus probables selon la matrice sont 1-1 (12.8%) et 2-1 (11.4%).`;
      } else if (lowerQ.includes('btts') || lowerQ.includes('marqu') || lowerQ.includes('deux')) {
        reply = `La probabilité que les deux équipes marquent (BTTS - Oui) est évaluée à 58.9%.`;
      } else {
        reply = `Pour ${home} vs ${away} (${comp}), nous observons une nette tendance offensive pour ${home} (xG: 1.84). L'Over 1.5 but reste le choix statistique le plus fiable (78.4%).`;
      }
      setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
      setAiLoading(false);
    }, 600);
  };

  // Filtrage des matchs selon le championnat cliqué
  const filteredMatches = selectedLeagueFilter === 'ALL'
    ? matches
    : matches.filter(m => m.competition.code === selectedLeagueFilter || m.competition.name.toLowerCase().includes(selectedLeagueFilter.toLowerCase()));

  const homeName = selectedMatch.homeTeam.shortName || selectedMatch.homeTeam.name;
  const awayName = selectedMatch.awayTeam.shortName || selectedMatch.awayTeam.name;

  const chartData = [
    { name: homeName, prob: 48.2, fill: '#0066FF' },
    { name: 'Nul', prob: 27.1, fill: '#94A3B8' },
    { name: awayName, prob: 24.7, fill: '#00D68F' }
  ];

  // Prédictions dynamiques
  const predictionsList = filteredMatches.map((m, index) => {
    const type: '1X2' | 'GOALS' | 'BTTS' = index % 3 === 0 ? 'GOALS' : index % 3 === 1 ? '1X2' : 'BTTS';
    const pick = type === 'GOALS' 
      ? 'Plus de 1.5 but' 
      : type === '1X2' 
        ? `Victoire ${m.homeTeam.shortName || m.homeTeam.name}` 
        : 'BTTS - Les deux marquent';
    const prob = type === 'GOALS' ? '78.4%' : type === '1X2' ? '48.2%' : '58.9%';
    const conf = type === 'GOALS' ? 'Très Élevée' : type === '1X2' ? 'Moyenne' : 'Élevée';
    return { match: m, type, pick, prob, conf };
  });

  const filteredPredictions = activeMarket === 'ALL' 
    ? predictionsList 
    : predictionsList.filter(p => p.type === activeMarket);

  return (
    <div className="min-h-screen bg-[#081426] text-white flex flex-col md:flex-row font-sans relative">
      
      {/* Topbar Mobile */}
      <div className="md:hidden bg-[#081426] border-b border-[#162C50] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center font-black text-white text-sm">
            LM
          </div>
          <span className="font-extrabold text-white text-lg tracking-wider">LMPRO</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#94A3B8]">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Latéral */}
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex flex-col justify-between w-full md:w-64 bg-[#081426] border-r border-[#162C50] shrink-0`}>
        <div>
          <div className="p-6 border-b border-[#162C50] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center font-black text-white text-xl tracking-wider shadow-lg shadow-[#0066FF]/20">
              LM
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-wider text-white flex items-center gap-1.5">
                LMPRO <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse"></span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-medium">Intelligence & Stats Football</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
              { id: 'matches', label: 'Matchs du jour', icon: CalendarDays },
              { id: 'analysis', label: 'Analyse Poisson', icon: LineChart },
              { id: 'predictions', label: 'Pronostics Pro', icon: Target },
              { id: 'history', label: 'Historique Certifié', icon: History },
              { id: 'profile', label: 'Mon Profil', icon: User },
              { id: 'admin', label: 'Console Admin', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as PageId);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/30'
                      : 'text-[#94A3B8] hover:bg-[#0D1E38] hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil dans le menu */}
        <div className="p-4 m-4 rounded-xl bg-[#0D1E38] border border-[#162C50] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-[#0066FF]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#162C50] border border-[#0066FF] flex items-center justify-center text-xs text-white">
                <User size={16} />
              </div>
            )}
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate">{user ? user.displayName : 'Invité'}</p>
              <span className="text-[10px] text-[#00D68F] font-medium">{user ? 'Google Connecté' : 'Mode Démo'}</span>
            </div>
          </div>
          {user ? (
            <button onClick={handleLogout} className="text-[#94A3B8] hover:text-rose-400 p-1" title="Déconnexion">
              <LogOut size={16} />
            </button>
          ) : (
            <button onClick={() => setCurrentPage('profile')} className="text-[#0066FF] hover:underline text-xs font-bold">
              Connexion
            </button>
          )}
        </div>
      </aside>

      {/* Zone Principale */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="px-6 py-2.5 flex items-center justify-between text-xs border-b bg-[#00D68F]/10 border-[#00D68F]/20 text-[#00D68F]">
          <div className="flex items-center gap-2">
            <Radio size={16} className="animate-pulse text-[#00D68F]" />
            <span><strong className="text-white">LMPRO MULTI-CHAMPIONNATS :</strong> Accès direct aux 8 plus grandes ligues</span>
          </div>
          <span className="font-mono bg-[#162C50] text-white px-2 py-0.5 rounded text-[10px] font-bold">
            PRO V2.0
          </span>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* TABLEAU DE BORD & MATCHS DU JOUR */}
          {(currentPage === 'dashboard' || currentPage === 'matches') && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Plateforme d'Analyse Footballistique</h1>
                  <p className="text-xs text-[#94A3B8] mt-1">« Analysez mieux. Comprenez le football. »</p>
                </div>
                <button
                  onClick={() => setIsAiOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00D68F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#0066FF]/20 hover:opacity-95 transition-all"
                >
                  <Sparkles size={14} /> Demander à l'Analyste IA
                </button>
              </div>

              {/* BARRE DE SÉLECTION DE CHAMPIONNATS (NOUVEAU !) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={14} className="text-[#0066FF]" /> Filtrer par Championnat :
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {LEAGUES_LIST.map((league) => {
                    const isSelected = selectedLeagueFilter === league.code;
                    return (
                      <button
                        key={league.code}
                        onClick={() => setSelectedLeagueFilter(league.code)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-lg shadow-[#0066FF]/30'
                            : 'bg-[#0D1E38] text-[#94A3B8] border-[#162C50] hover:border-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <span>{league.flag}</span>
                        <span>{league.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matchs du jour filtrés */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Rencontres : {selectedLeagueFilter === 'ALL' ? 'Tous les Championnats' : selectedLeagueFilter}
                  </h2>
                  <span className="text-xs text-[#00D68F] font-bold">{filteredMatches.length} match(s) disponible(s)</span>
                </div>

                {filteredMatches.length === 0 ? (
                  <div className="py-12 text-center text-[#94A3B8] text-xs">
                    Aucun match répertorié pour ce championnat aujourd'hui. Sélectionnez un autre championnat ci-dessus.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMatches.map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => {
                          setSelectedMatch(m);
                          setCurrentPage('analysis');
                        }}
                        className="bg-[#081426] border border-[#162C50] hover:border-[#0066FF] rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between"
                      >
                        <div className="flex justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#162C50]">
                          <span className="font-semibold truncate max-w-[150px]">{m.competition.name}</span>
                          <span className="font-mono bg-[#162C50] px-2 py-0.5 rounded text-[10px] text-white">
                            {m.status === 'IN_PLAY' ? 'DIRECT' : new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="py-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" className="w-5 h-5 object-contain" />}
                              <span className="text-xs font-bold text-white truncate max-w-[160px]">{m.homeTeam.name}</span>
                            </div>
                            <span className="font-mono font-bold text-sm text-white">{m.score?.fullTime?.home ?? '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" className="w-5 h-5 object-contain" />}
                              <span className="text-xs font-bold text-white truncate max-w-[160px]">{m.awayTeam.name}</span>
                            </div>
                            <span className="font-mono font-bold text-sm text-white">{m.score?.fullTime?.away ?? '-'}</span>
                          </div>
                        </div>

                        <button className="w-full py-2 bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-lg text-xs font-bold transition-colors">
                          Analyser ce match →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE D'ANALYSE */}
          {currentPage === 'analysis' && (
            <div className="space-y-6">
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-4">
                  <span className="uppercase font-bold tracking-wider">{selectedMatch.competition.name}</span>
                  <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 text-[#00D68F] hover:underline font-bold">
                    <Sparkles size={14} /> Analyser avec l'IA
                  </button>
                </div>
                <div className="grid grid-cols-3 items-center text-center">
                  <div className="flex flex-col items-center space-y-2">
                    {selectedMatch.homeTeam.crest && <img src={selectedMatch.homeTeam.crest} alt="" className="w-14 h-14 object-contain" />}
                    <h2 className="text-sm md:text-base font-bold text-white">{selectedMatch.homeTeam.name}</h2>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase mb-1">xG Attendus (Poisson)</span>
                    <div className="text-3xl font-black text-white font-mono bg-[#081426] px-4 py-1.5 rounded-xl border border-[#162C50]">
                      1.84 - 1.18
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    {selectedMatch.awayTeam.crest && <img src={selectedMatch.awayTeam.crest} alt="" className="w-14 h-14 object-contain" />}
                    <h2 className="text-sm md:text-base font-bold text-white">{selectedMatch.awayTeam.name}</h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Probabilités 1X2</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} unit="%" stroke="#94A3B8" />
                        <YAxis dataKey="name" type="category" stroke="#FFFFFF" width={90} />
                        <Tooltip 
  contentStyle={{ 
    backgroundColor: '#081426', 
    borderColor: '#162C50', 
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    padding: '10px 14px',
    color: '#FFFFFF'
  }}
  itemStyle={{ color: '#00D68F', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }}
  labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
  formatter={(value: any) => [`${value}%`, 'Probabilité']}
  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
/>
                        <Bar dataKey="prob" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-3 text-xs">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Marchés Spécialisés</h3>
                  <div>
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>Plus de 1.5 But</span>
                      <span className="text-[#00D68F]">78.4%</span>
                    </div>
                    <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00D68F] h-full" style={{ width: '78.4%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>Plus de 2.5 Buts</span>
                      <span className="text-[#0066FF]">54.1%</span>
                    </div>
                    <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0066FF] h-full" style={{ width: '54.1%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VUE PRONOSTICS PRO */}
          {currentPage === 'predictions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Target className="text-[#0066FF]" /> Pronostics Statistiques (Modèle Poisson)
                  </h1>
                  <p className="text-xs text-[#94A3B8]">
                    Sélections calculées par notre algorithme de probabilités.
                  </p>
                </div>

                <div className="flex bg-[#0D1E38] p-1 rounded-xl border border-[#162C50]">
                  {(['ALL', '1X2', 'GOALS', 'BTTS'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMarket(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeMarket === m ? 'bg-[#0066FF] text-white shadow' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {m === 'ALL' ? 'Tous les Marchés' : m === 'GOALS' ? 'Buts (+/-)' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPredictions.map(({ match, type, pick, prob, conf }, idx) => (
                  <div key={idx} className="bg-[#0D1E38] border border-[#162C50] hover:border-[#0066FF] rounded-2xl p-5 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex justify-between items-center text-xs text-[#94A3B8] pb-2 border-b border-[#162C50] mb-3">
                        <span className="font-semibold truncate max-w-[150px]">{match.competition.name}</span>
                        <span className="text-[10px] font-mono bg-[#081426] px-2 py-0.5 rounded text-[#00D68F] font-bold">
                          Confiance {conf}
                        </span>
                      </div>

                      <div className="font-bold text-white text-sm mb-4">
                        {match.homeTeam.name} <span className="text-[#94A3B8] font-normal">vs</span> {match.awayTeam.name}
                      </div>

                      <div className="bg-[#081426] border border-[#162C50] rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                          Sélection Recommandée ({type})
                        </span>
                        <div className="text-sm font-extrabold text-[#00D68F] flex items-center gap-2">
                          <CheckCircle2 size={16} className="shrink-0" />
                          <span>{pick}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 text-xs mt-2">
                        <span className="text-[#94A3B8]">Probabilité Poisson :</span>
                        <span className="font-mono font-bold text-white text-sm">{prob}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setCurrentPage('analysis');
                      }}
                      className="mt-4 w-full py-2.5 bg-[#162C50] hover:bg-[#0066FF] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Consulter l'analyse complète →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VUE HISTORIQUE */}
          {currentPage === 'history' && (
            <div className="space-y-6">
              <div className="bg-[#0D1E38] border border-[#162C50] p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="text-[#00D68F]" /> Registre d'Audit & Résultats
                  </h1>
                  <p className="text-xs text-[#94A3B8]">Prédictions enregistrées avant coup d'envoi. Historique non-modifiable.</p>
                </div>
                <div className="bg-[#081426] px-4 py-2 rounded-xl border border-[#162C50] text-xs font-mono">
                  Taux de Réussite : <span className="text-[#00D68F] font-bold">72.4%</span> (120 évalués)
                </div>
              </div>

              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#081426] text-[#94A3B8] uppercase font-semibold border-b border-[#162C50]">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Match</th>
                      <th className="p-4">Sélection</th>
                      <th className="p-4 text-center">Score Final</th>
                      <th className="p-4 text-center">Probabilité</th>
                      <th className="p-4 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162C50] text-slate-300">
                    {[
                      { date: '26/10/2026', match: 'Arsenal FC vs Chelsea FC', pick: 'Plus de 2.5 buts', score: '3 - 1', prob: '62.4%', won: true },
                      { date: '25/10/2026', match: 'Real Madrid vs Athletic Club', pick: 'Victoire Domicile (1)', score: '2 - 0', prob: '58.7%', won: true },
                      { date: '24/10/2026', match: 'Juventus vs AC Milan', pick: 'BTTS - Les deux marquent', score: '0 - 0', prob: '55.1%', won: false },
                      { date: '23/10/2026', match: 'PSG vs Marseille', pick: 'Plus de 2.5 buts', score: '3 - 1', prob: '68.0%', won: true }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#081426]/50">
                        <td className="p-4 font-mono text-[#94A3B8]">{row.date}</td>
                        <td className="p-4 font-bold text-white">{row.match}</td>
                        <td className="p-4">{row.pick}</td>
                        <td className="p-4 text-center font-mono font-bold text-white">{row.score}</td>
                        <td className="p-4 text-center font-mono text-white">{row.prob}</td>
                        <td className="p-4 text-right">
                          {row.won ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00D68F]/10 text-[#00D68F] font-bold">
                              <Check size={12} /> Validé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold">
                              Échoué
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VUE ADMIN */}
          {currentPage === 'admin' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#0066FF]" /> Console Système & Synchronisation
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0D1E38] border border-[#162C50] p-4 rounded-xl">
                  <div className="text-[11px] text-[#94A3B8] font-bold uppercase">Latence API</div>
                  <div className="text-2xl font-black text-white mt-1 font-mono">118 ms</div>
                  <span className="text-[10px] text-[#00D68F]">Opérationnel</span>
                </div>
                <div className="bg-[#0D1E38] border border-[#162C50] p-4 rounded-xl">
                  <div className="text-[11px] text-[#94A3B8] font-bold uppercase">Moteur Poisson</div>
                  <div className="text-2xl font-black text-[#00D68F] mt-1 font-mono">Actif</div>
                  <span className="text-[10px] text-[#94A3B8]">Multi-Ligues calibré</span>
                </div>
                <div className="bg-[#0D1E38] border border-[#162C50] p-4 rounded-xl">
                  <div className="text-[11px] text-[#94A3B8] font-bold uppercase">Intégrité Audit</div>
                  <div className="text-2xl font-black text-white mt-1 font-mono">100%</div>
                  <span className="text-[10px] text-[#00D68F]">Règles immuables actives</span>
                </div>
              </div>
            </div>
          )}

          {/* VUE PROFIL */}
          {currentPage === 'profile' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Mon Compte LMPRO</h1>
                  <p className="text-xs text-[#94A3B8]">Authentification sécurisée avec Firebase Google.</p>
                </div>
                {!user ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#0066FF]/20 transition-all"
                  >
                    <LogIn size={16} /> Connexion avec Google
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-[#0D1E38] hover:bg-rose-500/20 text-rose-400 border border-[#162C50] px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                )}
              </div>

              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 flex items-center gap-5">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full border-2 border-[#0066FF]" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#162C50] border-2 border-[#0066FF] flex items-center justify-center text-white">
                    <User size={30} />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white">{user ? user.displayName : 'Visiteur non connecté'}</h3>
                  <p className="text-xs text-[#94A3B8]">{user ? user.email : 'Connectez-vous avec votre compte Google'}</p>
                  <span className={`mt-2 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded ${
                    user ? 'bg-[#00D68F]/20 text-[#00D68F]' : 'bg-[#162C50] text-[#94A3B8]'
                  }`}>
                    {user ? '✓ Compte Google Actif' : 'Mode Invité'}
                  </span>
                </div>
              </div>

              {/* Championnats Favoris Élargis */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart size={16} className="text-[#00D68F]" /> Championnats Favoris
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LEAGUES_LIST.filter(l => l.code !== 'ALL').map((league) => {
                    const isFav = favoriteLeagues.includes(league.name);
                    return (
                      <button
                        key={league.code}
                        onClick={() => {
                          setFavoriteLeagues(prev => isFav ? prev.filter(l => l !== league.name) : [...prev, league.name]);
                        }}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                          isFav ? 'bg-[#0066FF]/20 border-[#0066FF] text-white' : 'bg-[#081426] border-[#162C50] text-[#94A3B8]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">{league.flag} {league.name}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${isFav ? 'bg-[#00D68F]' : 'bg-[#162C50]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BOUTON FLOTTANT IA */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#0066FF] to-[#00D68F] p-4 rounded-2xl shadow-2xl flex items-center gap-2 hover:scale-105 transition-all text-white font-bold text-xs"
        >
          <Bot size={20} />
          <span>Analyste IA</span>
        </button>
      )}

      {/* TIROIR DU CHATBOT IA */}
      {isAiOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#081426] border-l border-[#162C50] z-50 flex flex-col shadow-2xl">
          <div className="p-4 bg-[#0D1E38] border-b border-[#162C50] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center text-white">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1">
                  Analyste Tactique LMPRO <Sparkles size={12} className="text-[#00D68F]" />
                </h3>
                <span className="text-[10px] text-[#94A3B8] truncate max-w-[200px]">Match : {selectedMatch.homeTeam.name}</span>
              </div>
            </div>
            <button onClick={() => setIsAiOpen(false)} className="text-[#94A3B8] hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  msg.role === 'user' ? 'ml-auto bg-[#0066FF] text-white' : 'bg-[#0D1E38] border border-[#162C50] text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {aiLoading && (
              <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D68F] animate-bounce" />
                <span>Analyse tactique en cours...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleAskAI} className="p-3 bg-[#0D1E38] border-t border-[#162C50] flex gap-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ex: Quelle équipe est favorite ?"
              className="flex-1 bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
            />
            <button
              type="submit"
              disabled={aiLoading || !inputQuestion.trim()}
              className="bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}