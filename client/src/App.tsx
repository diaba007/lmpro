import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
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
  Gift, 
  Globe, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  LogIn, 
  LogOut 
} from 'lucide-react';

// IMPORTATION DES COMPOSANTS MODULAIRES
import { StickyPromoBar } from './components/StickyPromoBar';
import { PartnersView, INITIAL_PARTNERS } from './components/PartnersView';
import { MatchAnalysisView } from './components/MatchAnalysisView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { HistoryView, INITIAL_HISTORY } from './components/HistoryView';

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

type PageId = 'dashboard' | 'matches' | 'analysis' | 'predictions' | 'history' | 'partners' | 'profile' | 'admin';

const ALL_LEAGUES_MATCHES = [
  { id: 5001, competition: { name: 'Serie A', code: 'SA' }, utcDate: '2026-10-28T17:30:00Z', status: 'TIMED', homeTeam: { name: 'AC Milan', shortName: 'Milan', crest: 'https://crests.football-data.org/98.png' }, awayTeam: { name: 'Bologna FC 1909', shortName: 'Bologna', crest: 'https://crests.football-data.org/103.png' } },
  { id: 5002, competition: { name: 'Serie A', code: 'SA' }, utcDate: '2026-10-28T17:30:00Z', status: 'TIMED', homeTeam: { name: 'Venezia FC', shortName: 'Venezia', crest: 'https://crests.football-data.org/454.png' }, awayTeam: { name: 'FC Internazionale Milano', shortName: 'Inter', crest: 'https://crests.football-data.org/108.png' } },
  { id: 5003, competition: { name: 'Serie A', code: 'SA' }, utcDate: '2026-10-28T17:30:00Z', status: 'TIMED', homeTeam: { name: 'Parma Calcio 1913', shortName: 'Parma', crest: 'https://crests.football-data.org/112.png' }, awayTeam: { name: 'Udinese Calcio', shortName: 'Udinese', crest: 'https://crests.football-data.org/115.png' } },
  { id: 5004, competition: { name: 'Serie A', code: 'SA' }, utcDate: '2026-10-28T19:45:00Z', status: 'TIMED', homeTeam: { name: 'Genoa CFC', shortName: 'Genoa', crest: 'https://crests.football-data.org/107.png' }, awayTeam: { name: 'Juventus FC', shortName: 'Juventus', crest: 'https://crests.football-data.org/109.png' } },
  { id: 5005, competition: { name: 'Serie A', code: 'SA' }, utcDate: '2026-10-28T19:45:00Z', status: 'TIMED', homeTeam: { name: 'AC Monza', shortName: 'Monza', crest: 'https://crests.football-data.org/5911.png' }, awayTeam: { name: 'SSC Napoli', shortName: 'Napoli', crest: 'https://crests.football-data.org/113.png' } },
  { id: 4001, competition: { name: 'Premier League', code: 'PL' }, utcDate: '2026-10-28T19:00:00Z', status: 'TIMED', homeTeam: { name: 'Manchester City FC', shortName: 'Man City', crest: 'https://crests.football-data.org/65.png' }, awayTeam: { name: 'Arsenal FC', shortName: 'Arsenal', crest: 'https://crests.football-data.org/57.png' } },
  { id: 4003, competition: { name: 'La Liga', code: 'PD' }, utcDate: '2026-10-28T20:00:00Z', status: 'TIMED', homeTeam: { name: 'Real Madrid CF', shortName: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' }, awayTeam: { name: 'Athletic Club', shortName: 'Athletic', crest: 'https://crests.football-data.org/77.png' } },
  { id: 4005, competition: { name: 'Ligue 1', code: 'FL1' }, utcDate: '2026-10-28T17:00:00Z', status: 'IN_PLAY', homeTeam: { name: 'Paris Saint-Germain FC', shortName: 'PSG', crest: 'https://crests.football-data.org/524.png' }, awayTeam: { name: 'Olympique de Marseille', shortName: 'Marseille', crest: 'https://crests.football-data.org/516.png' }, score: { fullTime: { home: 1, away: 0 } } }
];

const LEAGUES_LIST = [
  { code: 'ALL', name: 'Tous les Championnats', flag: '🌍' },
  { code: 'SA', name: 'Serie A (5 Matchs)', flag: '🇮🇹' },
  { code: 'PL', name: 'Premier League', flag: '🇬🇧' },
  { code: 'PD', name: 'La Liga', flag: '🇪🇸' },
  { code: 'FL1', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪' },
  { code: 'CL', name: 'Champions League', flag: '🇪🇺' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [matches, setMatches] = useState<any[]>(ALL_LEAGUES_MATCHES);
  const [manualMatches, setManualMatches] = useState<any[]>(() => {
    const s = localStorage.getItem('lmpro_manual_matches'); return s ? JSON.parse(s) : [];
  });
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('SA');
  const [selectedMatch, setSelectedMatch] = useState<any>(ALL_LEAGUES_MATCHES[0]);
  const [activeMarket, setActiveMarket] = useState<'ALL' | '1X2' | 'GOALS' | 'BTTS'>('ALL');
  const [user, setUser] = useState<any>(null);

  // Authentification Membre
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Super-Admin
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lmpro_admin_session') === 'true';
  });
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  // Partenaires et codes promos
  const [partners, setPartners] = useState<any[]>(() => {
    const s = localStorage.getItem('lmpro_partners'); return s ? JSON.parse(s) : INITIAL_PARTNERS;
  });
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // IA Chatbot
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre analyste tactique LMPRO. Posez-moi vos questions sur les matchs ou les pronostics !' }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  // Navigation avec historique
  const navigateTo = (page: PageId, addToHistory = true) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    if (addToHistory) window.history.pushState({ page }, '', `/#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.history.replaceState({ page: 'dashboard' }, '', '/#dashboard');
    const onPop = (e: any) => setCurrentPage(e.state?.page || 'dashboard');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleAdminLogin = (username: string, pass: string) => {
    const u = username.trim().toLowerCase();
    const p = pass.trim();
    const master = localStorage.getItem('lmpro_master_admin_pwd') || 'LMPRO2026';
    if ((u.includes('christian') || u.includes('admin') || u.length > 0) && (p.toUpperCase() === 'LMPRO2026' || p === '2026' || p === master)) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('lmpro_admin_session', 'true');
      setAdminAuthError(null);
    } else {
      setAdminAuthError("Identifiant ou Mot de passe incorrect.");
    }
  };

  const handleAdminLock = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('lmpro_admin_session');
  };

  const handleUploadLogo = (partnerId: string, e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const updated = partners.map(p => p.id === partnerId ? { ...p, logoUrl: ev.target?.result } : p);
      setPartners(updated);
      localStorage.setItem('lmpro_partners', JSON.stringify(updated));
    };
    r.readAsDataURL(file);
  };

  // Analyse et cotes dynamiques
  const getMatchAnalysis = (m: any) => {
    if (m.isManual && m.customAnalysis) {
      return { homeWin: m.customAnalysis.prob1, draw: m.customAnalysis.probX, awayWin: m.customAnalysis.prob2, xGHome: m.customAnalysis.xGHome, xGAway: m.customAnalysis.xGAway, over15: 75, over25: 52, btts: 53 };
    }
    if (m.id === 5001) return { homeWin: 56.4, draw: 25.1, awayWin: 18.5, xGHome: 1.95, xGAway: 0.90, over15: 76.5, over25: 52.0, btts: 51.0 };
    if (m.id === 5002) return { homeWin: 14.2, draw: 21.8, awayWin: 64.0, xGHome: 0.75, xGAway: 2.25, over15: 82.0, over25: 61.5, btts: 54.0 };
    return { homeWin: 48, draw: 28, awayWin: 24, xGHome: 1.7, xGAway: 1.1, over15: 72, over25: 50, btts: 52 };
  };

  const getMatchOdds = (m: any) => {
    const a = getMatchAnalysis(m);
    return { odds1: (100 / a.homeWin * 0.94).toFixed(2), oddsX: (100 / a.draw * 0.94).toFixed(2), odds2: (100 / a.awayWin * 0.94).toFixed(2) };
  };

  const allMatchesList = [...manualMatches, ...matches];
  const filteredMatches = selectedLeagueFilter === 'ALL'
    ? allMatchesList
    : allMatchesList.filter(m => (m.competition.code && m.competition.code === selectedLeagueFilter) || m.competition.name.includes('Serie A'));

  const activeMatch = selectedMatch || allMatchesList[0];
  const activeAnalysis = activeMatch ? getMatchAnalysis(activeMatch) : null;
  const activeOdds = activeMatch ? getMatchOdds(activeMatch) : null;

  return (
    <div className="min-h-screen bg-[#081426] text-white flex flex-col md:flex-row font-sans relative">
      {/* Topbar Mobile */}
      <div className="md:hidden bg-[#081426] border-b border-[#162C50] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center font-black text-white text-sm">LM</div>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center font-black text-white text-xl shadow-lg">LM</div>
            <div>
              <div className="text-xl font-extrabold text-white flex items-center gap-1.5">LMPRO <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" /></div>
              <p className="text-[10px] text-[#94A3B8]">Intelligence & Stats Football</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
              { id: 'matches', label: 'Matchs du jour', icon: CalendarDays },
              { id: 'analysis', label: 'Analyse Poisson', icon: LineChart },
              { id: 'predictions', label: 'Pronostics Pro', icon: Target },
              { id: 'partners', label: 'Bonus & Partenaires', icon: Gift, highlight: true },
              { id: 'history', label: 'Historique Certifié', icon: History },
              { id: 'profile', label: 'Mon Profil', icon: User },
              { id: 'admin', label: 'Console Admin', icon: ShieldCheck, locked: !isAdminAuthenticated },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as PageId)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#0066FF] text-white' : item.highlight ? 'text-amber-400 bg-amber-400/10' : 'text-[#94A3B8] hover:bg-[#0D1E38] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3"><Icon size={18} /><span>{item.label}</span></div>
                  {item.locked && <Lock size={12} className="text-[#94A3B8]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil Menu */}
        <div className="p-4 m-4 rounded-xl bg-[#0D1E38] border border-[#162C50] flex items-center justify-between">
          <div className="truncate text-left">
            <p className="text-xs font-bold text-white truncate">{user ? (user.displayName || user.email) : 'Visiteur'}</p>
            <span className={`text-[10px] font-bold ${isAdminAuthenticated ? 'text-amber-400' : user ? 'text-[#00D68F]' : 'text-[#94A3B8]'}`}>
              {isAdminAuthenticated ? '👑 Super-Admin' : user ? 'Membre' : 'Non Connecté'}
            </span>
          </div>
          {user || isAdminAuthenticated ? (
            <button onClick={() => { signOut(auth); setUser(null); setIsAdminAuthenticated(false); }} className="text-[#94A3B8] hover:text-rose-400 p-1"><LogOut size={16} /></button>
          ) : (
            <button onClick={() => navigateTo('profile')} className="text-[#0066FF] text-xs font-bold">Connexion</button>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* BANDEAU FLOTTANT FIXE (STICKY PROMO) */}
        <StickyPromoBar 
          onCopyCode={handleCopyCode} 
          copiedCodeId={copiedCodeId} 
          onNavigateToPartners={() => navigateTo('partners')} 
        />

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Bouton retour */}
          {currentPage !== 'dashboard' && (
            <button onClick={() => navigateTo('dashboard')} className="inline-flex items-center gap-2 bg-[#0D1E38] text-[#94A3B8] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#162C50]">
              <ArrowLeft size={14} /><span>Retour au Tableau de Bord</span>
            </button>
          )}

          {/* PAGE BONUS & PARTENAIRES */}
          {currentPage === 'partners' && (
            <PartnersView partners={partners} onCopyCode={handleCopyCode} copiedCodeId={copiedCodeId} />
          )}

          {/* PAGE ANALYSE */}
          {currentPage === 'analysis' && activeMatch && activeAnalysis && activeOdds && (
            <MatchAnalysisView match={activeMatch} analysis={activeAnalysis} odds={activeOdds} partners={partners} onOpenAI={() => setIsAiOpen(true)} />
          )}

          {/* PAGE HISTORIQUE CERTIFIÉ */}
          {currentPage === 'history' && <HistoryView records={INITIAL_HISTORY} />}

          {/* PAGE CONSOLE ADMIN */}
          {currentPage === 'admin' && (
            <AdminConsoleView
              isAdminAuthenticated={isAdminAuthenticated}
              isSuperAdmin={true}
              adminNotification={adminNotification}
              onAdminLogin={handleAdminLogin}
              onAdminLock={handleAdminLock}
              adminAuthError={adminAuthError}
              partners={partners}
              onUploadLogo={handleUploadLogo}
              onUpdatePartner={(id, code, url) => {
                const updated = partners.map(p => p.id === id ? { ...p, promoCode: code, url } : p);
                setPartners(updated);
                localStorage.setItem('lmpro_partners', JSON.stringify(updated));
              }}
              manualMatches={manualMatches}
              onAddManualMatch={(data) => {
                const newM = { id: Date.now(), competition: { name: data.comp, code: 'SA' }, utcDate: new Date().toISOString(), status: 'TIMED', homeTeam: { name: data.home }, awayTeam: { name: data.away }, isManual: true, customAnalysis: data };
                setManualMatches([newM, ...manualMatches]);
                localStorage.setItem('lmpro_manual_matches', JSON.stringify([newM, ...manualMatches]));
              }}
              onDeleteManualMatch={(id) => {
                const updated = manualMatches.filter(m => m.id !== id);
                setManualMatches(updated);
                localStorage.setItem('lmpro_manual_matches', JSON.stringify(updated));
              }}
              adminTeam={[]}
              onAddAdmin={() => {}}
              onRemoveAdmin={() => {}}
              onChangeMasterPassword={(newP) => localStorage.setItem('lmpro_master_admin_pwd', newP)}
              onSyncApi={() => {}}
              onPurgeCache={() => {}}
            />
          )}

          {/* TABLEAU DE BORD / MATCHS DU JOUR */}
          {(currentPage === 'dashboard' || currentPage === 'matches') && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-white">Plateforme d'Analyse Footballistique</h1>
                  <p className="text-xs text-[#94A3B8] mt-1">« Analysez mieux. Comprenez le football. »</p>
                </div>
                <button onClick={() => setIsAiOpen(true)} className="bg-gradient-to-r from-[#0066FF] to-[#00D68F] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Sparkles size={14} /> Analyste IA
                </button>
              </div>

              {/* Filtres Championnats */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {LEAGUES_LIST.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLeagueFilter(l.code)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap border ${
                      selectedLeagueFilter === l.code ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-[#0D1E38] text-[#94A3B8] border-[#162C50]'
                    }`}
                  >
                    <span>{l.flag}</span><span>{l.name}</span>
                  </button>
                ))}
              </div>

              {/* Matchs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((m) => (
                  <div key={m.id} onClick={() => { setSelectedMatch(m); navigateTo('analysis'); }} className="bg-[#081426] border border-[#162C50] hover:border-[#0066FF] rounded-xl p-5 cursor-pointer flex flex-col justify-between">
                    <div className="flex justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#162C50]">
                      <span className="font-semibold">{m.competition.name}</span>
                      <span className="font-mono text-[10px] text-white">{m.isManual ? 'ANALYSE EXPERT' : '17:30'}</span>
                    </div>
                    <div className="py-4 space-y-3">
                      <div className="flex items-center justify-between text-sm font-bold text-white"><span>{m.homeTeam.name}</span><span>-</span></div>
                      <div className="flex items-center justify-between text-sm font-bold text-white"><span>{m.awayTeam.name}</span><span>-</span></div>
                    </div>
                    <button className="w-full py-2 bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-lg text-xs font-bold">
                      Analyser ce match →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE PRONOSTICS PRO */}
          {currentPage === 'predictions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-white flex items-center gap-2"><Target className="text-[#0066FF]" /> Pronostics Statistiques (Modèle Poisson)</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMatches.map((m, idx) => {
                  const a = getMatchAnalysis(m);
                  return (
                    <div key={idx} className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#00D68F] font-bold">{m.competition.name}</span>
                        <div className="font-bold text-white text-sm my-2">{m.homeTeam.name} vs {m.awayTeam.name}</div>
                        <div className="bg-[#081426] border border-[#162C50] p-3 rounded-xl text-xs text-[#00D68F] font-extrabold">
                          ✓ Sélection : {a.homeWin > a.awayWin ? `Victoire ${m.homeTeam.name}` : `Victoire ${m.awayTeam.name}`} ({Math.max(a.homeWin, a.awayWin)}%)
                        </div>
                      </div>
                      <button onClick={() => { setSelectedMatch(m); navigateTo('analysis'); }} className="mt-4 w-full py-2 bg-[#162C50] hover:bg-[#0066FF] text-white rounded-xl text-xs font-bold">
                        Analyse complète →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE PROFIL */}
          {currentPage === 'profile' && (
            <div className="max-w-xl mx-auto space-y-6">
              {!user ? (
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                  <div className="flex bg-[#081426] p-1 rounded-xl">
                    <button onClick={() => setAuthMode('LOGIN')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${authMode === 'LOGIN' ? 'bg-[#0066FF] text-white' : 'text-[#94A3B8]'}`}>Se Connecter</button>
                    <button onClick={() => setAuthMode('REGISTER')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${authMode === 'REGISTER' ? 'bg-[#0066FF] text-white' : 'text-[#94A3B8]'}`}>Créer un Compte</button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (authMode === 'REGISTER') {
                      const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                      if (authName) await updateProfile(res.user, { displayName: authName });
                    } else {
                      await signInWithEmailAndPassword(auth, authEmail, authPassword);
                    }
                  }} className="space-y-3">
                    {authMode === 'REGISTER' && <input type="text" placeholder="Nom complet" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white" />}
                    <input type="email" placeholder="Adresse email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white" />
                    <input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white" />
                    <button type="submit" className="w-full py-3 bg-[#0066FF] text-white rounded-xl font-bold text-xs">Valider</button>
                  </form>
                  <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-[#081426] border border-[#162C50] py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                    <LogIn size={14} /> Continuer avec Google
                  </button>
                </div>
              ) : (
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">{user.displayName || user.email}</h2>
                    <p className="text-xs text-[#94A3B8]">{user.email}</p>
                    <span className="text-[10px] bg-[#00D68F]/20 text-[#00D68F] font-bold px-2 py-0.5 rounded mt-1 inline-block">✓ Membre Inscrit</span>
                  </div>
                  <button onClick={() => signOut(auth)} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-4 py-2 rounded-xl text-xs font-bold">Déconnexion</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bouton IA */}
      {!isAiOpen && (
        <button onClick={() => setIsAiOpen(true)} className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#0066FF] to-[#00D68F] p-4 rounded-2xl shadow-2xl flex items-center gap-2 text-white font-bold text-xs">
          <Bot size={20} /><span>Analyste IA</span>
        </button>
      )}

      {/* Tiroir IA */}
      {isAiOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#081426] border-l border-[#162C50] z-50 flex flex-col shadow-2xl">
          <div className="p-4 bg-[#0D1E38] border-b border-[#162C50] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1"><Bot size={16} /> Analyste Tactique LMPRO</h3>
            <button onClick={() => setIsAiOpen(false)} className="text-[#94A3B8]"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((m, i) => (
              <div key={i} className={`p-3 rounded-xl max-w-[85%] ${m.role === 'user' ? 'ml-auto bg-[#0066FF] text-white' : 'bg-[#0D1E38] text-slate-200'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!inputQuestion.trim()) return;
            const q = inputQuestion;
            setInputQuestion('');
            setChatMessages(prev => [...prev, { role: 'user', text: q }, { role: 'bot', text: `Sur le match ${activeMatch ? activeMatch.homeTeam.name : 'actuel'}, notre modèle Poisson calcule une espérance offensive solide. N'hésitez pas à profiter des bonus Melbet (XPRO225) et Betwinner (DKC10) !` }]);
          }} className="p-3 bg-[#0D1E38] border-t border-[#162C50] flex gap-2">
            <input type="text" value={inputQuestion} onChange={(e) => setInputQuestion(e.target.value)} placeholder="Votre question..." className="flex-1 bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none" />
            <button type="submit" className="bg-[#0066FF] text-white p-2.5 rounded-xl"><Send size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
}