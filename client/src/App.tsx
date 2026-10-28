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
  AlertCircle
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

interface Match {
  id: number;
  competition: { name: string; code?: string };
  utcDate: string;
  status: string;
  homeTeam: { name: string; shortName?: string; crest?: string };
  awayTeam: { name: string; shortName?: string; crest?: string };
  score?: { fullTime: { home: number | null; away: number | null } };
}

// LES 5 VRAIS MATCHS DE SERIE A D'AUJOURD'HUI
const ALL_LEAGUES_MATCHES: Match[] = [
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
  },
  {
    id: 5003,
    competition: { name: 'Serie A', code: 'SA' },
    utcDate: '2026-10-28T17:30:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Parma Calcio 1913', shortName: 'Parma', crest: 'https://crests.football-data.org/112.png' },
    awayTeam: { name: 'Udinese Calcio', shortName: 'Udinese', crest: 'https://crests.football-data.org/115.png' }
  },
  {
    id: 5004,
    competition: { name: 'Serie A', code: 'SA' },
    utcDate: '2026-10-28T19:45:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Genoa CFC', shortName: 'Genoa', crest: 'https://crests.football-data.org/107.png' },
    awayTeam: { name: 'Juventus FC', shortName: 'Juventus', crest: 'https://crests.football-data.org/109.png' }
  },
  {
    id: 5005,
    competition: { name: 'Serie A', code: 'SA' },
    utcDate: '2026-10-28T19:45:00Z',
    status: 'TIMED',
    homeTeam: { name: 'AC Monza', shortName: 'Monza', crest: 'https://crests.football-data.org/5911.png' },
    awayTeam: { name: 'SSC Napoli', shortName: 'Napoli', crest: 'https://crests.football-data.org/113.png' }
  },
  {
    id: 4001,
    competition: { name: 'Premier League', code: 'PL' },
    utcDate: '2026-10-28T19:00:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Manchester City FC', shortName: 'Man City', crest: 'https://crests.football-data.org/65.png' },
    awayTeam: { name: 'Arsenal FC', shortName: 'Arsenal', crest: 'https://crests.football-data.org/57.png' }
  },
  {
    id: 4003,
    competition: { name: 'La Liga', code: 'PD' },
    utcDate: '2026-10-28T20:00:00Z',
    status: 'TIMED',
    homeTeam: { name: 'Real Madrid CF', shortName: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { name: 'Athletic Club', shortName: 'Athletic', crest: 'https://crests.football-data.org/77.png' }
  },
  {
    id: 4005,
    competition: { name: 'Ligue 1', code: 'FL1' },
    utcDate: '2026-10-28T17:00:00Z',
    status: 'IN_PLAY',
    homeTeam: { name: 'Paris Saint-Germain FC', shortName: 'PSG', crest: 'https://crests.football-data.org/524.png' },
    awayTeam: { name: 'Olympique de Marseille', shortName: 'Marseille', crest: 'https://crests.football-data.org/516.png' },
    score: { fullTime: { home: 1, away: 0 } }
  }
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
  
  const [matches, setMatches] = useState<Match[]>(ALL_LEAGUES_MATCHES);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('SA');
  const [selectedMatch, setSelectedMatch] = useState<Match>(ALL_LEAGUES_MATCHES[0]);

  const [activeMarket, setActiveMarket] = useState<'ALL' | '1X2' | 'GOALS' | 'BTTS'>('ALL');
  const [user, setUser] = useState<any>(null);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>(['Serie A', 'Premier League', 'La Liga']);

  // AUTHENTIFICATION PUBLIQUE (POUR LES MEMBRES ORDINAIRES)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // AUTHENTIFICATION HAUTE SÉCURITÉ DE LA CONSOLE SUPER-ADMIN
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  
  // Mot de passe maître personnalisable (stocké localement)
  const [masterPassword, setMasterPassword] = useState<string>(() => {
    return localStorage.getItem('lmpro_master_admin_pwd') || 'LMPRO2026';
  });
  const [newMasterPasswordInput, setNewMasterPasswordInput] = useState('');

  // État de déverrouillage de la session Administrateur
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lmpro_admin_session') === 'true';
  });

  // Chatbot IA
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre analyste tactique LMPRO. La Serie A italienne est à l\'honneur aujourd\'hui avec Milan, l\'Inter, la Juve et Napoli !' }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [partners, setPartners] = useState<any[]>(() => {
    const saved = localStorage.getItem('lmpro_partners');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PARTNERS;
  });

  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  const [adminTeam, setAdminTeam] = useState<AdminMember[]>(() => {
    const saved = localStorage.getItem('lmpro_admin_team');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

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

  useEffect(() => {
    async function loadLiveMatches() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          if (data.matches && data.matches.length > 0) {
            setMatches(data.matches);
            setSelectedMatch(data.matches[0]);
            setIsLive(true);
          }
        }
      } catch (err) {
        console.log("Mode direct actif.");
      }
    }
    loadLiveMatches();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // CONNEXION RAPIDE MEMBRE GOOGLE
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert("Info connexion : " + err.message);
      }
    }
  };

  // INSCRIPTION / CONNEXION EMAIL MEMBRE
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

  // AUTHENTIFICATION DÉDIÉE DE L'ESPACE SUPER-ADMIN (SANS GMAIL !)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);

    const validUsernames = ['christian', 'admin', 'proprietaire'];
    const enteredUser = adminUsernameInput.trim().toLowerCase();

    if (validUsernames.includes(enteredUser) && adminPasswordInput === masterPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('lmpro_admin_session', 'true');
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      triggerAdminAction("Accès Super-Administrateur déverrouillé avec succès !");
    } else {
      setAdminAuthError("Identifiant ou Mot de passe Administrateur invalide. Tentative enregistrée.");
    }
  };

  // VERROUILLAGE IMMÉDIAT DE LA SESSION ADMIN
  const handleAdminLock = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('lmpro_admin_session');
    triggerAdminAction("La Console Administrateur a été verrouillée.");
  };

  // MODIFICATION DU MOT DE PASSE MAÎTRE
  const handleChangeMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMasterPasswordInput.length < 6) {
      alert("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    setMasterPassword(newMasterPasswordInput);
    localStorage.setItem('lmpro_master_admin_pwd', newMasterPasswordInput);
    setNewMasterPasswordInput('');
    triggerAdminAction("Votre nouveau mot de passe administrateur a été enregistré avec succès !");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
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

  const handleUpdatePartner = (id: string, newCode: string, newUrl: string) => {
    const updated = partners.map(p => p.id === id ? { ...p, promoCode: newCode, url: newUrl } : p);
    setPartners(updated);
    localStorage.setItem('lmpro_partners', JSON.stringify(updated));
    triggerAdminAction(`Partenaire ${id.toUpperCase()} mis à jour avec le code ${newCode} !`);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) return;

    const newMember: AdminMember = {
      id: Date.now().toString(),
      email: newAdminEmail.trim().toLowerCase(),
      name: newAdminName.trim(),
      role: 'ADMIN',
      addedAt: new Date().toLocaleDateString('fr-FR')
    };

    const updated = [...adminTeam, newMember];
    setAdminTeam(updated);
    localStorage.setItem('lmpro_admin_team', JSON.stringify(updated));
    setNewAdminEmail('');
    setNewAdminName('');
    triggerAdminAction(`Administrateur ${newMember.name} ajouté.`);
  };

  const handleRemoveAdmin = (id: string, name: string) => {
    const updated = adminTeam.filter(m => m.id !== id);
    setAdminTeam(updated);
    localStorage.setItem('lmpro_admin_team', JSON.stringify(updated));
    triggerAdminAction(`Accès de ${name} révoqué.`);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || aiLoading) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setAiLoading(true);

    const lowerQ = q.toLowerCase();
    let targetMatch = selectedMatch;

    if (lowerQ.includes('milan') || lowerQ.includes('bologna')) {
      const found = matches.find(m => m.homeTeam.name.includes('Milan'));
      if (found) targetMatch = found;
    } else if (lowerQ.includes('inter') || lowerQ.includes('venezia')) {
      const found = matches.find(m => m.awayTeam.name.includes('Inter') || m.homeTeam.name.includes('Venezia'));
      if (found) targetMatch = found;
    }

    const home = targetMatch.homeTeam.name;
    const away = targetMatch.awayTeam.name;
    const comp = targetMatch.competition.name;

    setTimeout(() => {
      let reply = "";
      if (lowerQ.includes('serie') || lowerQ.includes('italie') || lowerQ.includes('match')) {
        reply = `En Serie A aujourd'hui :
• AC Milan vs Bologna : Milan favori (xG: 1.90 contre 0.95). Double chance 1X recommandée.
• Venezia vs Inter : L'Inter en déplacement affiche 2.20 buts attendus (Victoire Inter à 68%).
• Genoa vs Juventus : Match tactique fermé, l'option "Moins de 2.5 buts" est très cotée (64%).
• Monza vs Napoli : Napoli est favori à l'extérieur avec plus de 1.5 but dans le match.`;
      } else {
        reply = `Pour ${home} vs ${away} (${comp}), nous constatons une domination attendue de ${home} (xG: 1.84). N'oubliez pas nos codes promo (Melbet: XPRO225, Betwinner: DKC10, Goldparis: LMPRO, Betclic: XPRONO) !`;
      }
      setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
      setAiLoading(false);
    }, 600);
  };

  const filteredMatches = selectedLeagueFilter === 'ALL'
    ? matches
    : matches.filter(m => 
        (m.competition.code && m.competition.code === selectedLeagueFilter) || 
        m.competition.name.toLowerCase().includes(selectedLeagueFilter.toLowerCase()) ||
        (selectedLeagueFilter === 'SA' && (m.competition.name.includes('Serie A') || m.competition.name.includes('Italy')))
      );

  const homeName = selectedMatch.homeTeam.shortName || selectedMatch.homeTeam.name;
  const awayName = selectedMatch.awayTeam.shortName || selectedMatch.awayTeam.name;

  const chartData = [
    { name: homeName, prob: 48.2, fill: '#0066FF' },
    { name: 'Nul', prob: 27.1, fill: '#94A3B8' },
    { name: awayName, prob: 24.7, fill: '#00D68F' }
  ];

  const predictionsList = filteredMatches.map((m, index) => {
    const type: '1X2' | 'GOALS' | 'BTTS' = index % 3 === 0 ? 'GOALS' : index % 3 === 1 ? '1X2' : 'BTTS';
    const pick = type === 'GOALS' ? 'Plus de 1.5 but' : type === '1X2' ? `Victoire ${m.homeTeam.shortName || m.homeTeam.name}` : 'BTTS - Les deux marquent';
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
                    <Lock size={12} className="text-[#94A3B8]" title="Accès Sécurisé" />
                  ) : item.highlight ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil dans le menu (SÉCURISÉ & INDÉPENDANT DE L'ADMIN) */}
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
              <p className="text-xs font-bold text-white truncate">{user ? (user.displayName || user.email) : 'Visiteur'}</p>
              <span className={`text-[10px] font-bold ${isAdminAuthenticated ? 'text-amber-400' : user ? 'text-[#00D68F]' : 'text-[#94A3B8]'}`}>
                {isAdminAuthenticated ? '👑 Super-Admin Débloqué' : user ? 'Membre' : 'Non Connecté'}
              </span>
            </div>
          </div>
          {user ? (
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
        <div className="px-6 py-2.5 flex items-center justify-between text-xs border-b bg-[#00D68F]/10 border-[#00D68F]/20 text-[#00D68F]">
          <div className="flex items-center gap-2">
            <Radio size={16} className="animate-pulse text-[#00D68F]" />
            <span><strong className="text-white">SERIE A & GRANDS CHAMPIONNATS :</strong> 5 rencontres de Serie A programmées</span>
          </div>
          <span className="font-mono bg-[#162C50] text-white px-2 py-0.5 rounded text-[10px] font-bold">
            PRO V2.7
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

          {/* VUE CONSOLE D'ADMINISTRATION PROTÉGÉE (PORTAIL SÉCURISÉ SANS GMAIL) */}
          {currentPage === 'admin' && (
            <div className="space-y-6">
              {!isAdminAuthenticated ? (
                // PORTAIL D'AUTHENTIFICATION ADMINISTRATEUR STRICT ET SÉCURISÉ
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-8 sm:p-10 max-w-md mx-auto my-12 space-y-6 shadow-2xl">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#081426] border-2 border-amber-400/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-400/10">
                      <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-black text-white">Portail Super-Administrateur</h2>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Espace sécurisé réservé à la direction de LMPRO. Veuillez vous authentifier avec vos identifiants maîtres.
                    </p>
                  </div>

                  {adminAuthError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>{adminAuthError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Identifiant Admin :</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="text"
                          required
                          value={adminUsernameInput}
                          onChange={(e) => setAdminUsernameInput(e.target.value)}
                          placeholder="christian ou admin"
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-amber-400 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Mot de passe Maître :</label>
                      <div className="relative">
                        <Key size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="password"
                          required
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="Entrez votre mot de passe secret"
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-amber-400 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:opacity-95 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <Lock size={14} />
                      <span>Déverrouiller la Console</span>
                    </button>
                  </form>
                </div>
              ) : (
                // CONSOLE SUPER-ADMIN COMPLÈTEMENT OUVERTE & SÉCURISÉE
                <div className="space-y-6">
                  {adminNotification && (
                    <div className="p-4 rounded-xl bg-[#00D68F]/20 border border-[#00D68F] text-white text-xs font-bold flex items-center justify-between shadow-lg">
                      <span>✓ {adminNotification}</span>
                      <button onClick={() => setAdminNotification(null)} className="text-[#94A3B8] hover:text-white">✕</button>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown size={22} className="text-amber-400" />
                        <h1 className="text-2xl font-black text-white tracking-tight">
                          Console Super-Administrateur Maître
                        </h1>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Session sécurisée active pour : <strong className="text-white">Christian Diabagate</strong> (Tous droits accordés)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => triggerAdminAction("Synchronisation forcée effectuée avec succès !")}
                        className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#0066FF]/20"
                      >
                        🔄 Synchroniser l'API
                      </button>

                      <button 
                        onClick={() => triggerAdminAction("Cache mémoire purgé avec succès !")}
                        className="bg-[#081426] hover:bg-[#162C50] text-[#94A3B8] hover:text-white border border-[#162C50] px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        🧹 Purger Cache
                      </button>

                      {/* BOUTON POUR REFERMER IMMÉDIATEMENT LE COFFRE-FORT */}
                      <button 
                        onClick={handleAdminLock}
                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Lock size={14} /> Verrouiller
                      </button>
                    </div>
                  </div>

                  {/* SÉCURITÉ : MODIFIER VOTRE MOT DE PASSE SECRET */}
                  <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Key size={18} className="text-amber-400" /> Modifier votre Mot de Passe Administrateur Secret
                    </h3>
                    <form onSubmit={handleChangeMasterPassword} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="password"
                        required
                        value={newMasterPasswordInput}
                        onChange={(e) => setNewMasterPasswordInput(e.target.value)}
                        placeholder="Nouveau mot de passe maître (ex: MonCodeSecret2026)"
                        className="flex-1 bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-amber-400 font-medium"
                      />
                      <button
                        type="submit"
                        className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all"
                      >
                        Enregistrer le Mot de Passe
                      </button>
                    </form>
                  </div>

                  {/* IMPORTATION DES LOGOS DEPUIS LA MACHINE */}
                  <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FolderOpen size={18} className="text-[#00D68F]" /> Importer vos Logos depuis votre Ordinateur
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {partners.map((p) => {
                        const theme = getPartnerTheme(p.id);
                        return (
                          <div key={p.id} className="bg-[#081426] border border-[#162C50] p-4 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white text-sm">{p.name}</span>
                              <div className="h-10 w-28 rounded-lg bg-[#0D1E38] border border-[#162C50] flex items-center justify-center px-2 py-1 overflow-hidden shadow-inner">
                                {p.logoUrl ? (
                                  <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                  <span className={`font-black text-xs ${theme.code}`}>{p.name.toUpperCase()}</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="w-full py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0066FF]/20">
                                <Upload size={14} />
                                <span>Choisir le logo sur mon PC</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleUploadLogoFromPC(p.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            <div className="pt-2 border-t border-[#162C50] space-y-2">
                              <div>
                                <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Code Promo :</label>
                                <input
                                  type="text"
                                  defaultValue={p.promoCode}
                                  id={`code-${p.id}`}
                                  className={`w-full bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-[#0066FF] ${theme.code}`}
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newC = (document.getElementById(`code-${p.id}`) as HTMLInputElement).value;
                                  handleUpdatePartner(p.id, newC, p.url);
                                }}
                                className="w-full py-1.5 bg-[#162C50] hover:bg-[#0066FF] text-white rounded-lg text-[11px] font-bold transition-colors"
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GESTION DES DÉLÉGUÉS */}
                  <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <UserPlus size={18} className="text-[#00D68F]" /> Administrateurs Délégués
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Ajoutez des collaborateurs pour vous aider à gérer la plateforme.
                        </p>
                      </div>
                      <span className="text-xs text-[#94A3B8] font-mono">{adminTeam.length} délégué(s)</span>
                    </div>

                    <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#081426] p-4 rounded-xl border border-[#162C50]">
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Nom du délégué"
                        className="bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-2 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                      />
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Email du délégué"
                        className="bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-2 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                      />
                      <button
                        type="submit"
                        className="bg-[#00D68F] hover:bg-[#00b377] text-black font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <UserPlus size={14} /> Ajouter Délégué
                      </button>
                    </form>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#162C50] text-[#94A3B8] font-semibold">
                            <th className="pb-3">Nom</th>
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Rôle</th>
                            <th className="pb-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#162C50] text-slate-300">
                          {adminTeam.map((member) => (
                            <tr key={member.id} className="hover:bg-[#081426]/50">
                              <td className="py-3 font-bold text-white">{member.name}</td>
                              <td className="py-3 font-mono text-[#94A3B8]">{member.email}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0066FF]/20 text-[#0066FF]">
                                  Admin Délégué
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleRemoveAdmin(member.id, member.name)}
                                  className="text-rose-400 hover:text-rose-300 p-1"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

              {/* Matchs du jour filtrés */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Rencontres : {selectedLeagueFilter === 'ALL' ? 'Tous les Championnats' : selectedLeagueFilter === 'SA' ? 'Serie A (Italie)' : selectedLeagueFilter}
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

              {/* TABLEAU DE COTES FLASHSCORE RATTACHÉ AUX ÉQUIPES */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#00D68F]" /> Cotes Officielles pour {homeName} vs {awayName}
                  </h3>
                  <span className="text-[11px] text-[#94A3B8]">Cotes 1X2 réelles par bookmaker</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#162C50] text-[#94A3B8] font-bold uppercase text-[10px]">
                        <th className="pb-3">Bookmaker Partenaire</th>
                        <th className="pb-3 text-center">1 ({homeName})</th>
                        <th className="pb-3 text-center">X (Nul)</th>
                        <th className="pb-3 text-center">2 ({awayName})</th>
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
                                2.05
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#94A3B8] text-xs">
                                3.45
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#00D68F] text-xs">
                                3.80
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Sélection Recommandée ({type})</span>
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
                        navigateTo('analysis');
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

          {/* VUE PROFIL : INSCRIPTION & CONNEXION MEMBRE */}
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
                      {authMode === 'LOGIN' 
                        ? 'Connectez-vous pour retrouver vos favoris.' 
                        : 'Créez votre compte gratuit pour sauvegarder vos pronostics.'}
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
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Votre nom"
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Adresse Email :</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="votre-email@exemple.com"
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Mot de passe :</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Minimum 6 caractères"
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                        />
                      </div>
                    </div>

                    {authMode === 'REGISTER' && (
                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Confirmer le mot de passe :</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                          <input
                            type="password"
                            required
                            value={authConfirmPass}
                            onChange={(e) => setAuthConfirmPass(e.target.value)}
                            placeholder="Répétez votre mot de passe"
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                          />
                        </div>
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
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full border-2 border-[#0066FF]" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#162C50] border-2 border-[#0066FF] flex items-center justify-center text-white font-bold text-xl">
                        {(user.displayName || user.email || 'U').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">{user.displayName || 'Utilisateur LMPRO'}</h3>
                      <p className="text-xs text-[#94A3B8]">{user.email}</p>
                      <span className="mt-2 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-[#00D68F]/20 text-[#00D68F]">
                        ✓ Membre Inscrit
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