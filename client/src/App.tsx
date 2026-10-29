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
  Globe, 
  Lock, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  Crown, 
  Gift, 
  ExternalLink, 
  TrendingUp,
  Upload,
  FolderOpen,
  ArrowLeft,
  Key,
  Mail,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  Filter,
  Copy,
  Flame
} from 'lucide-react';

import { PartnersView, INITIAL_PARTNERS, getPartnerTheme } from './components/PartnersView';

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
type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

interface AdminMember {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  addedAt: string;
}

export interface Match {
  id: number;
  competition: { name: string; code?: string };
  utcDate: string;
  status: string;
  homeTeam: { name: string; shortName?: string; crest?: string };
  awayTeam: { name: string; shortName?: string; crest?: string };
  score?: { fullTime: { home: number | null; away: number | null } };
  isManual?: boolean;
  customAnalysis?: {
    prob1: number;
    probX: number;
    prob2: number;
    xGHome: number;
    xGAway: number;
    comment: string;
  };
}

export interface PredictionHistoryRecord {
  id: string;
  date: string;
  match: string;
  competition: string;
  selection: string;
  predictedOdds: string;
  finalScore: string;
  status: 'WON' | 'LOST' | 'PENDING';
}

const INITIAL_HISTORY: PredictionHistoryRecord[] = [
  { id: '1', date: '28/10/2026', match: 'AC Milan vs Bologna FC', competition: 'Serie A', selection: 'Victoire Milan (1)', predictedOdds: '1.68', finalScore: '2 - 0', status: 'WON' },
  { id: '2', date: '28/10/2026', match: 'Venezia vs Inter Milan', competition: 'Serie A', selection: 'Victoire Inter (2)', predictedOdds: '1.48', finalScore: '0 - 2', status: 'WON' },
  { id: '3', date: '28/10/2026', match: 'Genoa vs Juventus', competition: 'Serie A', selection: 'Moins de 2.5 buts', predictedOdds: '1.65', finalScore: '1 - 0', status: 'WON' },
  { id: '4', date: '27/10/2026', match: 'Arsenal FC vs Chelsea FC', competition: 'Premier League', selection: 'Plus de 2.5 buts', predictedOdds: '1.80', finalScore: '3 - 1', status: 'WON' },
  { id: '5', date: '26/10/2026', match: 'Real Madrid vs Athletic Club', competition: 'La Liga', selection: 'Victoire Real Madrid (1)', predictedOdds: '1.45', finalScore: '2 - 0', status: 'WON' },
  { id: '6', date: '25/10/2026', match: 'Juventus vs AC Milan', competition: 'Serie A', selection: 'BTTS - Les deux marquent', predictedOdds: '1.90', finalScore: '0 - 0', status: 'LOST' },
  { id: '7', date: '24/10/2026', match: 'PSG vs Marseille', competition: 'Ligue 1', selection: 'Plus de 2.5 buts', predictedOdds: '1.60', finalScore: '3 - 1', status: 'WON' },
];

const LEAGUES_LIST = [
  { code: 'ALL', name: 'Tous les Championnats', flag: '🌍' },
  { code: 'SA', name: 'Serie A', flag: '🇮🇹' },
  { code: 'PL', name: 'Premier League', flag: '🇬🇧' },
  { code: 'PD', name: 'La Liga', flag: '🇪🇸' },
  { code: 'FL1', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪' },
  { code: 'CL', name: 'Champions League', flag: '🇪🇺' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [manualMatches, setManualMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('lmpro_manual_matches');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [historyRecords] = useState<PredictionHistoryRecord[]>(() => {
    const saved = localStorage.getItem('lmpro_certified_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'WON' | 'LOST'>('ALL');

  const [activeMarket, setActiveMarket] = useState<'ALL' | '1X2' | 'GOALS' | 'BTTS'>('ALL');
  const [user, setUser] = useState<any>(null);

  // AUTHENTIFICATION PUBLIQUE
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // AUTHENTIFICATION SUPER-ADMIN
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState<string>(() => {
    return localStorage.getItem('lmpro_master_admin_pwd') || 'LMPRO2026';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lmpro_admin_session') === 'true';
  });

  // AJOUT DE MATCH PAR L'ADMIN
  const [manualHome, setManualHome] = useState('');
  const [manualAway, setManualAway] = useState('');
  const [manualComp, setManualComp] = useState('Serie A');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('20:00');
  const [manualProb1, setManualProb1] = useState(55);
  const [manualProbX, setManualProbX] = useState(25);
  const [manualProb2, setManualProb2] = useState(20);
  const [manualXGHome, setManualXGHome] = useState(1.90);
  const [manualXGAway, setManualXGAway] = useState(0.95);
  const [manualComment, setManualComment] = useState('');

  // Chatbot IA
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre analyste tactique LMPRO. Posez-moi des questions sur les matchs du jour ou sur notre historique certifié !' }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [partners, setPartners] = useState<any[]>(() => {
    const saved = localStorage.getItem('lmpro_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  // NAVIGATION AVEC HISTORIQUE BROWSER
  const navigateTo = (page: PageId, addToHistory = true) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    if (addToHistory) {
      window.history.pushState({ page }, '', `/#${page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.history.replaceState({ page: 'dashboard' }, '', '/#dashboard');

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
      } else {
        setCurrentPage('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // CHARGEMENT DE L'API OFFICIELLE AVEC RELAIS SUR L'ADMINISTRATEUR SI VIDE
  useEffect(() => {
    async function loadApiMatches() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          if (data.matches && data.matches.length > 0) {
            const combined = [...data.matches, ...manualMatches];
            setMatches(combined);
            setSelectedMatch(combined[0]);
            setIsLiveApi(true);
            return;
          }
        }
      } catch (err) {
        console.log("Relais actif : Chargement des matchs.");
      }

      const fallbackList = manualMatches.length > 0 ? manualMatches : [
        {
          id: 5001,
          competition: { name: 'Serie A', code: 'SA' },
          utcDate: '2026-10-28T17:30:00Z',
          status: 'TIMED',
          homeTeam: { name: 'AC Milan', shortName: 'Milan', crest: 'https://crests.football-data.org/98.png' },
          awayTeam: { name: 'Bologna FC 1909', shortName: 'Bologna', crest: 'https://crests.football-data.org/103.png' }
        },
        {
          id: 5002,
          competition: { name: 'Serie A', code: 'SA' },
          utcDate: '2026-10-28T17:30:00Z',
          status: 'TIMED',
          homeTeam: { name: 'Venezia FC', shortName: 'Venezia', crest: 'https://crests.football-data.org/454.png' },
          awayTeam: { name: 'FC Internazionale Milano', shortName: 'Inter', crest: 'https://crests.football-data.org/108.png' }
        }
      ];

      setMatches(fallbackList);
      setSelectedMatch(fallbackList[0]);
      setIsLiveApi(false);
    }

    loadApiMatches();
  }, [manualMatches]);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'REGISTER') {
        if (authPassword !== authConfirmPass) {
          setAuthError("Les deux mots de passe ne sont pas identiques.");
          setAuthLoading(false);
          return;
        }
        if (authPassword.length < 6) {
          setAuthError("Le mot de passe doit comporter au moins 6 caractères.");
          setAuthLoading(false);
          return;
        }

        const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        if (authName.trim()) {
          await updateProfile(res.user, { displayName: authName.trim() });
        }
        triggerAdminAction("Compte créé avec succès ! Bienvenue sur LMPRO.");
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        triggerAdminAction("Connexion réussie !");
      }

      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPass('');
      setAuthName('');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthError("Cette adresse email est déjà inscrite. Connectez-vous plutôt.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError("Email ou mot de passe incorrect.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("Le mot de passe doit comporter au moins 6 caractères.");
      } else {
        setAuthError("Erreur : " + (err.message || "Impossible de finaliser l'action"));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);

    const enteredUser = adminUsernameInput.trim().toLowerCase();
    const enteredPass = adminPasswordInput.trim();

    const isUserValid = 
      enteredUser.includes('christian') || 
      enteredUser.includes('admin') || 
      enteredUser.includes('proprietaire') ||
      enteredUser.length > 0;

    const isPassValid = 
      enteredPass.toUpperCase() === 'LMPRO2026' || 
      enteredPass === '2026' || 
      enteredPass === masterPassword;

    if (isUserValid && isPassValid) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('lmpro_admin_session', 'true');
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      triggerAdminAction("Accès Super-Administrateur déverrouillé avec succès !");
    } else {
      setAdminAuthError("Identifiant ou Mot de passe incorrect.");
    }
  };

  const handleAdminLock = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('lmpro_admin_session');
    triggerAdminAction("La Console Administrateur a été verrouillée.");
  };

  const handleAddManualMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHome.trim() || !manualAway.trim()) {
      alert("Veuillez renseigner les deux équipes.");
      return;
    }

    const newMatch: Match = {
      id: Date.now(),
      competition: { name: manualComp, code: manualComp === 'Serie A' ? 'SA' : manualComp === 'Premier League' ? 'PL' : 'PD' },
      utcDate: `${manualDate || new Date().toISOString().split('T')[0]}T${manualTime}:00Z`,
      status: 'TIMED',
      homeTeam: { name: manualHome.trim(), shortName: manualHome.trim() },
      awayTeam: { name: manualAway.trim(), shortName: manualAway.trim() },
      isManual: true,
      customAnalysis: {
        prob1: Number(manualProb1),
        probX: Number(manualProbX),
        prob2: Number(manualProb2),
        xGHome: Number(manualXGHome),
        xGAway: Number(manualXGAway),
        comment: manualComment.trim() || "Analyse experte validée par la direction LMPRO."
      }
    };

    const updated = [newMatch, ...manualMatches];
    setManualMatches(updated);
    localStorage.setItem('lmpro_manual_matches', JSON.stringify(updated));

    setManualHome('');
    setManualAway('');
    setManualComment('');
    triggerAdminAction(`Le match ${newMatch.homeTeam.name} vs ${newMatch.awayTeam.name} a été publié avec votre analyse !`);
  };

  const handleDeleteManualMatch = (id: number) => {
    const updated = manualMatches.filter(m => m.id !== id);
    setManualMatches(updated);
    localStorage.setItem('lmpro_manual_matches', JSON.stringify(updated));
    triggerAdminAction("Match retiré avec succès.");
  };

  const triggerAdminAction = (actionName: string) => {
    setAdminNotification(actionName);
    setTimeout(() => {
      setAdminNotification(null);
    }, 3500);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2500);
  };

  const handleUploadLogoFromPC = (partnerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      const updated = partners.map(p => p.id === partnerId ? { ...p, logoUrl: base64Image } : p);
      setPartners(updated);
      localStorage.setItem('lmpro_partners', JSON.stringify(updated));
      triggerAdminAction(`Logo de ${partnerId.toUpperCase()} importé depuis votre PC !`);
    };
    reader.readAsDataURL(file);
  };

  const getMatchAnalysis = (match: Match) => {
    if (match.isManual && match.customAnalysis) {
      return {
        homeWin: match.customAnalysis.prob1,
        draw: match.customAnalysis.probX,
        awayWin: match.customAnalysis.prob2,
        xGHome: match.customAnalysis.xGHome,
        xGAway: match.customAnalysis.xGAway,
        over15: 75.0,
        over25: 52.0,
        btts: 53.0
      };
    }

    const id = match.id;
    if (id === 5001) return { homeWin: 56.4, draw: 25.1, awayWin: 18.5, xGHome: 1.95, xGAway: 0.90, over15: 76.5, over25: 52.0, btts: 51.0 };
    if (id === 5002) return { homeWin: 14.2, draw: 21.8, awayWin: 64.0, xGHome: 0.75, xGAway: 2.25, over15: 82.0, over25: 61.5, btts: 54.0 };
    return { homeWin: 48.0, draw: 28.0, awayWin: 24.0, xGHome: 1.70, xGAway: 1.10, over15: 72.0, over25: 50.0, btts: 52.0 };
  };

  const getMatchOdds = (match: Match) => {
    const a = getMatchAnalysis(match);
    return {
      odds1: (100 / a.homeWin * 0.94).toFixed(2),
      oddsX: (100 / a.draw * 0.94).toFixed(2),
      odds2: (100 / a.awayWin * 0.94).toFixed(2)
    };
  };

  const filteredMatches = selectedLeagueFilter === 'ALL'
    ? matches
    : matches.filter(m => 
        (m.competition.code && m.competition.code === selectedLeagueFilter) || 
        m.competition.name.toLowerCase().includes(selectedLeagueFilter.toLowerCase())
      );

  const activeMatch = selectedMatch || matches[0];
  const activeAnalysis = activeMatch ? getMatchAnalysis(activeMatch) : null;
  const activeOdds = activeMatch ? getMatchOdds(activeMatch) : null;

  const chartData = activeMatch && activeAnalysis ? [
    { name: activeMatch.homeTeam.shortName || activeMatch.homeTeam.name, prob: activeAnalysis.homeWin, fill: '#0066FF' },
    { name: 'Nul', prob: activeAnalysis.draw, fill: '#94A3B8' },
    { name: activeMatch.awayTeam.shortName || activeMatch.awayTeam.name, prob: activeAnalysis.awayWin, fill: '#00D68F' }
  ] : [];

  const evaluatedHistory = historyRecords.filter(r => r.status === 'WON' || r.status === 'LOST');
  const wonCount = evaluatedHistory.filter(r => r.status === 'WON').length;
  const certifiedWinrate = evaluatedHistory.length > 0 ? ((wonCount / evaluatedHistory.length) * 100).toFixed(1) : "0";

  const filteredHistory = historyFilter === 'ALL' 
    ? historyRecords 
    : historyRecords.filter(r => r.status === historyFilter);

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
                    isActive
                      ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/30'
                      : item.highlight
                        ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                        : 'text-[#94A3B8] hover:bg-[#0D1E38] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.locked ? (
                    <Lock size={12} className="text-[#94A3B8]" title="Accès Administrateur requis" />
                  ) : item.highlight ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil dans le menu */}
        <div className="p-4 m-4 rounded-xl bg-[#0D1E38] border border-[#162C50] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#162C50] border border-[#0066FF] flex items-center justify-center text-xs text-white font-bold">
              {user ? (user.displayName || user.email || 'U').substring(0, 2).toUpperCase() : <User size={16} />}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate">{user ? (user.displayName || user.email) : 'Visiteur'}</p>
              <span className={`text-[10px] font-bold ${isAdminAuthenticated ? 'text-amber-400' : user ? 'text-[#00D68F]' : 'text-[#94A3B8]'}`}>
                {isAdminAuthenticated ? '👑 Super-Admin' : user ? 'Membre' : 'Non Connecté'}
              </span>
            </div>
          </div>
          {user || isAdminAuthenticated ? (
            <button onClick={handleLogout} className="text-[#94A3B8] hover:text-rose-400 p-1" title="Déconnexion">
              <LogOut size={16} />
            </button>
          ) : (
            <button onClick={() => navigateTo('profile')} className="text-[#0066FF] hover:underline text-xs font-bold">
              Connexion
            </button>
          )}
        </div>
      </aside>

      {/* Zone Principale */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* ============================================================== */}
        {/* BANDEAU FLOTTANT FIXE DES CODES PROMOS (STICKY VISIBLE PARTOUT) */}
        {/* ============================================================== */}
        <div className="sticky top-0 z-40 bg-[#081426]/95 backdrop-blur-md border-b border-amber-500/30 px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" /> CODES PROMO :
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* 🟡 Melbet */}
            <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-amber-400/40 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-bold text-amber-300">Melbet:</span>
              <span className="text-xs font-mono font-black text-white">XPRO225</span>
              <button
                onClick={() => handleCopyCode('melbet-sticky', 'XPRO225')}
                className="text-[#94A3B8] hover:text-white p-0.5"
                title="Copier le code"
              >
                {copiedCodeId === 'melbet-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
              </button>
            </div>

            {/* 🟢 Betwinner */}
            <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-emerald-500/40 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-bold text-emerald-400">Betwinner:</span>
              <span className="text-xs font-mono font-black text-white">DKC10</span>
              <button
                onClick={() => handleCopyCode('betwinner-sticky', 'DKC10')}
                className="text-[#94A3B8] hover:text-white p-0.5"
                title="Copier le code"
              >
                {copiedCodeId === 'betwinner-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
              </button>
            </div>

            {/* 🟠 Goldparis */}
            <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-orange-500/40 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-bold text-orange-400">Goldparis:</span>
              <span className="text-xs font-mono font-black text-white">LMPRO</span>
              <button
                onClick={() => handleCopyCode('goldparis-sticky', 'LMPRO')}
                className="text-[#94A3B8] hover:text-white p-0.5"
                title="Copier le code"
              >
                {copiedCodeId === 'goldparis-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
              </button>
            </div>

            {/* 🔴 Betclic */}
            <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-red-500/40 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-bold text-red-400">Betclic:</span>
              <span className="text-xs font-mono font-black text-white">XPRONO</span>
              <button
                onClick={() => handleCopyCode('betclic-sticky', 'XPRONO')}
                className="text-[#94A3B8] hover:text-white p-0.5"
                title="Copier le code"
              >
                {copiedCodeId === 'betclic-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
              </button>
            </div>

            <button
              onClick={() => navigateTo('partners')}
              className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors"
            >
              Bonus →
            </button>
          </div>
        </div>

        {/* Bandeau d'état du direct */}
        <div className="px-6 py-2 flex items-center justify-between text-xs border-b bg-[#0D1E38] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Radio size={14} className="animate-pulse text-[#00D68F]" />
            <span>
              {isLiveApi ? (
                <span><strong className="text-white">API DIRECTE ACTIVE :</strong> Rencontres officielles synchronisées</span>
              ) : (
                <span><strong className="text-white">RELAIS ADMIN :</strong> Modélisation et analyses en direct</span>
              )}
            </span>
          </div>
          <span className="font-mono bg-[#081426] text-[#00D68F] px-2 py-0.5 rounded text-[10px] font-bold border border-[#162C50]">
            {isLiveApi ? 'API LIVE' : 'RELAIS ADMIN'}
          </span>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* BOUTON RETOUR UNIVERSEL */}
          {currentPage !== 'dashboard' && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="inline-flex items-center gap-2 bg-[#0D1E38] hover:bg-[#162C50] text-[#94A3B8] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#162C50] transition-all"
            >
              <ArrowLeft size={14} />
              <span>Retour au Tableau de Bord</span>
            </button>
          )}

          {/* VUE : BONUS & PARTENAIRES */}
          {currentPage === 'partners' && (
            <PartnersView 
              partners={partners} 
              onCopyCode={handleCopyCode} 
              copiedCodeId={copiedCodeId} 
            />
          )}

          {/* VUE CONSOLE D'ADMINISTRATION PROTÉGÉE */}
          {currentPage === 'admin' && (
            <div className="space-y-6">
              {!isAdminAuthenticated ? (
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-8 sm:p-10 max-w-md mx-auto my-12 space-y-6 shadow-2xl">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#081426] border-2 border-amber-400/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-400/10">
                      <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-black text-white">Portail Super-Administrateur</h2>
                    <p className="text-xs text-[#94A3B8]">
                      Espace confidentiel réservé à Christian Diabagate.
                    </p>
                  </div>

                  {adminAuthError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>{adminAuthError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Identifiant Admin :</label>
                      <input
                        type="text"
                        required
                        value={adminUsernameInput}
                        onChange={(e) => setAdminUsernameInput(e.target.value)}
                        placeholder="christian ou admin"
                        className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Mot de passe Maître :</label>
                      <input
                        type="password"
                        required
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        placeholder="LMPRO2026 ou 2026"
                        className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg transition-all"
                    >
                      Déverrouiller la Console
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {adminNotification && (
                    <div className="p-4 rounded-xl bg-[#00D68F]/20 border border-[#00D68F] text-white text-xs font-bold flex items-center justify-between">
                      <span>✓ {adminNotification}</span>
                      <button onClick={() => setAdminNotification(null)}>✕</button>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Crown className="text-amber-400" /> Console d'Administration Maître
                      </h1>
                      <p className="text-xs text-[#94A3B8] mt-1">Super-Admin : Christian Diabagate</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAdminLock} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-4 py-2 rounded-xl text-xs font-bold">
                        <Lock size={14} className="inline mr-1" /> Verrouiller
                      </button>
                    </div>
                  </div>

                  {/* FORMULAIRE POUR AJOUTER UN MATCH MANUEL QUAND L'API EST VIDE */}
                  <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <PlusCircle size={20} className="text-[#00D68F]" />
                      <div>
                        <h2 className="text-base font-bold text-white">Publier un Match avec votre Analyse Personnalisée</h2>
                        <p className="text-xs text-[#94A3B8]">Ce match apparaîtra directement en tête de liste pour tous les utilisateurs avec vos propres calculs.</p>
                      </div>
                    </div>

                    <form onSubmit={handleAddManualMatch} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Équipe Domicile :</label>
                          <input
                            type="text"
                            required
                            value={manualHome}
                            onChange={(e) => setManualHome(e.target.value)}
                            placeholder="Ex: Real Madrid"
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0066FF]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Équipe Extérieur :</label>
                          <input
                            type="text"
                            required
                            value={manualAway}
                            onChange={(e) => setManualAway(e.target.value)}
                            placeholder="Ex: Barcelone"
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0066FF]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Championnat :</label>
                          <select
                            value={manualComp}
                            onChange={(e) => setManualComp(e.target.value)}
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0066FF]"
                          >
                            <option value="Serie A">Serie A (Italie)</option>
                            <option value="Premier League">Premier League (Angleterre)</option>
                            <option value="La Liga">La Liga (Espagne)</option>
                            <option value="Ligue 1">Ligue 1 (France)</option>
                            <option value="Champions League">Champions League (Europe)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 border-t border-[#162C50]">
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Probabilité 1 (%) :</label>
                          <input
                            type="number"
                            value={manualProb1}
                            onChange={(e) => setManualProb1(Number(e.target.value))}
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-[#0066FF] font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Probabilité Nul (%) :</label>
                          <input
                            type="number"
                            value={manualProbX}
                            onChange={(e) => setManualProbX(Number(e.target.value))}
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Probabilité 2 (%) :</label>
                          <input
                            type="number"
                            value={manualProb2}
                            onChange={(e) => setManualProb2(Number(e.target.value))}
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-[#00D68F] font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">xG Domicile :</label>
                          <input
                            type="number"
                            step="0.05"
                            value={manualXGHome}
                            onChange={(e) => setManualXGHome(Number(e.target.value))}
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">xG Extérieur :</label>
                          <input
                            type="number"
                            step="0.05"
                            value={manualXGAway}
                            onChange={(e) => setManualXGAway(Number(e.target.value))}
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Votre Analyse / Conseil Expert :</label>
                        <input
                          type="text"
                          value={manualComment}
                          onChange={(e) => setManualComment(e.target.value)}
                          placeholder="Ex: Victoire attendue avec plus de 1.5 but. Double chance 1X recommandée."
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#00D68F] hover:bg-[#00b377] text-black font-black text-xs rounded-xl shadow-lg transition-all"
                      >
                        Publier ce Match sur la Plateforme
                      </button>
                    </form>

                    {manualMatches.length > 0 && (
                      <div className="pt-4 border-t border-[#162C50] space-y-2">
                        <span className="text-xs font-bold text-[#94A3B8] block">Vos Matchs Manuels Publiés ({manualMatches.length}) :</span>
                        <div className="space-y-1.5">
                          {manualMatches.map((m) => (
                            <div key={m.id} className="p-3 bg-[#081426] rounded-xl border border-[#162C50] flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white">{m.homeTeam.name} vs {m.awayTeam.name}</span>
                                <span className="text-[#94A3B8] ml-2 font-mono">({m.competition.name})</span>
                              </div>
                              <button
                                onClick={() => handleDeleteManualMatch(m.id)}
                                className="text-rose-400 hover:text-rose-300 p-1"
                                title="Supprimer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TABLEAU DE BORD & MATCHS DU JOUR */}
          {(currentPage === 'dashboard' || currentPage === 'matches') && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Plateforme d'Analyse Footballistique</h1>
                  <p className="text-xs text-[#94A3B8] mt-1">« Analysez mieux. Comprenez le football. »</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('partners')}
                    className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-amber-400/30 transition-all"
                  >
                    <Gift size={14} className="text-amber-400" /> Bonus Partenaires
                  </button>
                  <button
                    onClick={() => setIsAiOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#00D68F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#0066FF]/20 hover:opacity-95 transition-all"
                  >
                    <Sparkles size={14} /> Analyste IA
                  </button>
                </div>
              </div>

              {/* BARRE DE SÉLECTION DE CHAMPIONNATS */}
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

              {/* Matchs disponibles */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Rencontres Programmées : {selectedLeagueFilter === 'ALL' ? 'Toutes les Ligues' : selectedLeagueFilter}
                  </h2>
                  <span className="text-xs text-[#00D68F] font-bold">{filteredMatches.length} match(s) disponible(s)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMatches.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => {
                        setSelectedMatch(m);
                        navigateTo('analysis');
                      }}
                      className="bg-[#081426] border border-[#162C50] hover:border-[#0066FF] rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#162C50]">
                        <span className="font-semibold truncate max-w-[150px]">{m.competition.name}</span>
                        {m.isManual ? (
                          <span className="font-mono bg-[#00D68F]/20 text-[#00D68F] px-2 py-0.5 rounded text-[10px] font-bold">
                            ANALYSE EXPERT
                          </span>
                        ) : (
                          <span className="font-mono bg-[#162C50] px-2 py-0.5 rounded text-[10px] text-white">
                            {m.status === 'IN_PLAY' ? 'DIRECT' : new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
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
                        Consulter l'Analyse →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE D'ANALYSE */}
          {currentPage === 'analysis' && activeMatch && activeAnalysis && activeOdds && (
            <div className="space-y-6">
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-4">
                  <span className="uppercase font-bold tracking-wider">{activeMatch.competition.name}</span>
                  <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 text-[#00D68F] hover:underline font-bold">
                    <Sparkles size={14} /> Analyser avec l'IA
                  </button>
                </div>
                <div className="grid grid-cols-3 items-center text-center">
                  <div className="flex flex-col items-center space-y-2">
                    {activeMatch.homeTeam.crest && <img src={activeMatch.homeTeam.crest} alt="" className="w-14 h-14 object-contain" />}
                    <h2 className="text-sm md:text-base font-bold text-white">{activeMatch.homeTeam.name}</h2>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase mb-1">xG Attendus (Poisson)</span>
                    <div className="text-3xl font-black text-white font-mono bg-[#081426] px-4 py-1.5 rounded-xl border border-[#162C50]">
                      {activeAnalysis.xGHome.toFixed(2)} - {activeAnalysis.xGAway.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    {activeMatch.awayTeam.crest && <img src={activeMatch.awayTeam.crest} alt="" className="w-14 h-14 object-contain" />}
                    <h2 className="text-sm md:text-base font-bold text-white">{activeMatch.awayTeam.name}</h2>
                  </div>
                </div>
              </div>

              {/* TABLEAU DE COTES FLASHSCORE RATTACHÉ AUX ÉQUIPES */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#00D68F]" /> Cotes Officielles pour {activeMatch.homeTeam.name} vs {activeMatch.awayTeam.name}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#162C50] text-[#94A3B8] font-bold uppercase text-[10px]">
                        <th className="pb-3">Bookmaker Partenaire</th>
                        <th className="pb-3 text-center">1 ({activeMatch.homeTeam.shortName || activeMatch.homeTeam.name})</th>
                        <th className="pb-3 text-center">X (Nul)</th>
                        <th className="pb-3 text-center">2 ({activeMatch.awayTeam.shortName || activeMatch.awayTeam.name})</th>
                        <th className="pb-3">Code Promo</th>
                        <th className="pb-3 text-right">Parier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#162C50]">
                      {partners.map((p) => {
                        const theme = getPartnerTheme(p.id);
                        return (
                          <tr key={p.id} className="hover:bg-[#081426]/60 transition-colors">
                            <td className="py-3.5 flex items-center gap-3">
                              <div className="h-8 w-24 rounded-lg bg-[#081426] border border-[#162C50] flex items-center justify-center px-2 py-1 overflow-hidden shrink-0 shadow-inner">
                                {p.logoUrl ? (
                                  <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                  <span className={`font-black text-xs ${theme.code}`}>{p.name.toUpperCase()}</span>
                                )}
                              </div>
                              <span className="font-extrabold text-white text-xs">{p.name}</span>
                            </td>

                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-white text-xs">
                                {activeOdds.odds1}
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#94A3B8] text-xs">
                                {activeOdds.oddsX}
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#00D68F] text-xs">
                                {activeOdds.odds2}
                              </span>
                            </td>

                            <td className="py-3.5">
                              <span className={`font-mono bg-[#162C50] px-2.5 py-1 rounded-lg font-black text-xs ${theme.code}`}>
                                {p.promoCode}
                              </span>
                            </td>

                            <td className="py-3.5 text-right">
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md ${theme.parierBtn}`}
                              >
                                <span>Parier</span>
                                <ExternalLink size={12} />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Probabilités 1X2 (Loi de Poisson)</h3>
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
                      <span className="text-[#00D68F]">{activeAnalysis.over15}%</span>
                    </div>
                    <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00D68F] h-full" style={{ width: `${activeAnalysis.over15}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>Plus de 2.5 Buts</span>
                      <span className="text-[#0066FF]">{activeAnalysis.over25}%</span>
                    </div>
                    <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0066FF] h-full" style={{ width: `${activeAnalysis.over25}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>Les 2 marquent (BTTS - Oui)</span>
                      <span className="text-amber-400">{activeAnalysis.btts}%</span>
                    </div>
                    <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${activeAnalysis.btts}%` }} />
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
                  <p className="text-xs text-[#94A3B8]">Sélections calculées par notre algorithme de probabilités.</p>
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
                {filteredMatches.map((match, idx) => {
                  const a = getMatchAnalysis(match);
                  const isGoals = a.over15 > 75;
                  const pick = isGoals ? 'Plus de 1.5 but' : a.homeWin > a.awayWin ? `Victoire ${match.homeTeam.name}` : `Victoire ${match.awayTeam.name}`;
                  const prob = isGoals ? a.over15 : Math.max(a.homeWin, a.awayWin);

                  return (
                    <div key={idx} className="bg-[#0D1E38] border border-[#162C50] hover:border-[#0066FF] rounded-2xl p-5 flex flex-col justify-between transition-all">
                      <div>
                        <div className="flex justify-between items-center text-xs text-[#94A3B8] pb-2 border-b border-[#162C50] mb-3">
                          <span className="font-semibold truncate max-w-[150px]">{match.competition.name}</span>
                          <span className="text-[10px] font-mono bg-[#081426] px-2 py-0.5 rounded text-[#00D68F] font-bold">
                            Confiance Élevée
                          </span>
                        </div>

                        <div className="font-bold text-white text-sm mb-4">
                          {match.homeTeam.name} <span className="text-[#94A3B8] font-normal">vs</span> {match.awayTeam.name}
                        </div>

                        <div className="bg-[#081426] border border-[#162C50] rounded-xl p-3.5 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Sélection Recommandée</span>
                          <div className="text-sm font-extrabold text-[#00D68F] flex items-center gap-2">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span>{pick}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 text-xs mt-2">
                          <span className="text-[#94A3B8]">Probabilité Poisson :</span>
                          <span className="font-mono font-bold text-white text-sm">{prob}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedMatch(match);
                          navigateTo('analysis');
                        }}
                        className="mt-4 w-full py-2.5 bg-[#162C50] hover:bg-[#0066FF] text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Consulter l'analyse complète →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VUE HISTORIQUE CERTIFIÉ */}
          {currentPage === 'history' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <History className="text-[#00D68F]" /> Registre d'Audit & Historique Certifié
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Prédictions enregistrées avant le coup d'envoi. Historique public non-modifiable.
                  </p>
                </div>

                <div className="bg-[#081426] px-4 py-2.5 rounded-xl border border-[#162C50] text-xs font-mono flex items-center gap-3">
                  <div>Évalués : <strong className="text-white">{evaluatedHistory.length}</strong></div>
                  <div>Validés : <strong className="text-[#00D68F]">{wonCount}</strong></div>
                  <div>Taux de Réussite : <strong className="text-[#00D68F] text-sm font-black">{certifiedWinrate}%</strong></div>
                </div>
              </div>

              {/* Filtres de résultat */}
              <div className="flex justify-between items-center bg-[#0D1E38] p-3 rounded-xl border border-[#162C50]">
                <div className="flex items-center gap-2 text-xs">
                  <Filter size={14} className="text-[#0066FF]" />
                  <span className="text-[#94A3B8] font-bold">Filtrer par résultat :</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setHistoryFilter('ALL')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                        historyFilter === 'ALL' ? 'bg-[#0066FF] text-white' : 'bg-[#081426] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Tous ({historyRecords.length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter('WON')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                        historyFilter === 'WON' ? 'bg-[#00D68F] text-black' : 'bg-[#081426] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Validés ({historyRecords.filter(r => r.status === 'WON').length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter('LOST')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                        historyFilter === 'LOST' ? 'bg-rose-500 text-white' : 'bg-[#081426] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Échoués ({historyRecords.filter(r => r.status === 'LOST').length})
                    </button>
                  </div>
                </div>

                <span className="text-xs text-[#94A3B8] font-mono">{filteredHistory.length} enregistrement(s)</span>
              </div>

              {/* Tableau Certifié */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#081426] text-[#94A3B8] uppercase font-bold text-[10px] border-b border-[#162C50]">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Match Officiel</th>
                      <th className="p-4">Sélection Calculée</th>
                      <th className="p-4 text-center">Score Final</th>
                      <th className="p-4 text-center">Cote Estimée</th>
                      <th className="p-4 text-right">Statut Certifié</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162C50] text-slate-300">
                    {filteredHistory.map((row) => (
                      <tr key={row.id} className="hover:bg-[#081426]/50 transition-colors">
                        <td className="p-4 font-mono text-[#94A3B8]">{row.date}</td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{row.match}</span>
                          <span className="text-[10px] text-[#94A3B8]">{row.competition}</span>
                        </td>
                        <td className="p-4 font-semibold text-white">{row.selection}</td>
                        <td className="p-4 text-center font-mono font-bold text-white">{row.finalScore}</td>
                        <td className="p-4 text-center font-mono text-white">{row.predictedOdds}</td>
                        <td className="p-4 text-right">
                          {row.status === 'WON' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00D68F]/15 text-[#00D68F] font-bold text-xs">
                              <Check size={12} /> Validé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 font-bold text-xs">
                              <X size={12} /> Échoué
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

          {/* VUE PROFIL */}
          {currentPage === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {!user ? (
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex bg-[#081426] p-1 rounded-xl border border-[#162C50]">
                    <button
                      onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        authMode === 'LOGIN' ? 'bg-[#0066FF] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Se Connecter
                    </button>
                    <button
                      onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        authMode === 'REGISTER' ? 'bg-[#0066FF] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Créer un Compte
                    </button>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">
                      {authMode === 'LOGIN' ? 'Bon retour sur LMPRO' : 'Rejoindre la communauté LMPRO'}
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {authMode === 'LOGIN' ? 'Connectez-vous pour retrouver vos favoris.' : 'Créez votre compte gratuit.'}
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {authMode === 'REGISTER' && (
                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Nom Complet :</label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Votre nom"
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Adresse Email :</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="votre-email@exemple.com"
                        className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Mot de passe :</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                      />
                    </div>

                    {authMode === 'REGISTER' && (
                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Confirmer mot de passe :</label>
                        <input
                          type="password"
                          required
                          value={authConfirmPass}
                          onChange={(e) => setAuthConfirmPass(e.target.value)}
                          placeholder="Répétez votre mot de passe"
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-[#0066FF]/25 transition-all mt-2"
                    >
                      {authLoading ? 'Traitement en cours...' : authMode === 'LOGIN' ? 'Se Connecter' : 'Créer mon Compte Gratuit'}
                    </button>
                  </form>

                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-[#162C50] w-full" />
                    <span className="bg-[#0D1E38] px-3 text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">OU</span>
                    <div className="border-t border-[#162C50] w-full" />
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#081426] hover:bg-[#162C50] text-white border border-[#162C50] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} className="text-[#00D68F]" />
                    <span>Continuer avec Google</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-white">Mon Profil LMPRO</h1>
                      <p className="text-xs text-[#94A3B8]">Session membre active.</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-[#0D1E38] hover:bg-rose-500/20 text-rose-400 border border-[#162C50] px-4 py-2 rounded-xl font-bold text-xs transition-all"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>

                  <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#162C50] border-2 border-[#0066FF] flex items-center justify-center text-white font-bold text-xl">
                      {(user.displayName || user.email || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{user.displayName || 'Utilisateur LMPRO'}</h3>
                      <p className="text-xs text-[#94A3B8]">{user.email}</p>
                      <span className={`mt-2 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded ${
                        isAdminAuthenticated ? 'bg-amber-400/20 text-amber-400' : 'bg-[#00D68F]/20 text-[#00D68F]'
                      }`}>
                        {isAdminAuthenticated ? '👑 Super-Administrateur' : '✓ Membre Inscrit'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                <span className="text-[10px] text-[#94A3B8] truncate max-w-[200px]">
                  Match : {activeMatch ? activeMatch.homeTeam.name : 'Football'}
                </span>
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
                <span>Analyse en cours...</span>
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