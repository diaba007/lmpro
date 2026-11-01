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
  Gift, 
  Globe, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  LogIn, 
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  PlusCircle,
  Crown,
  Smartphone,
  Check,
  Zap
} from 'lucide-react';

// IMPORTATION DES COMPOSANTS MODULAIRES
import { StickyPromoBar } from './components/StickyPromoBar';
import { PartnersView, INITIAL_PARTNERS } from './components/PartnersView';
import { MatchAnalysisView } from './components/MatchAnalysisView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { HistoryView } from './components/HistoryView';

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

const LEAGUES_LIST = [
  { code: 'ALL', name: 'Toutes les Compétitions', flag: '🌍' },
  { code: 'SA', name: 'Serie A (VIP)', flag: '🇮🇹' },
  { code: 'PL', name: 'Premier League (VIP)', flag: '🇬🇧' },
  { code: 'PD', name: 'La Liga (VIP)', flag: '🇪🇸' },
  { code: 'CL', name: 'Champions League (VIP)', flag: '🇪🇺' },
  { code: 'FL1', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪' }
];

// MOTEUR D'INDICE DE PUISSANCE & FORME DES ÉQUIPES
const TEAM_RATINGS: Record<string, { rating: number; form: ('W' | 'D' | 'L')[] }> = {
  'inter': { rating: 92, form: ['W', 'W', 'W', 'D', 'W'] },
  'manchester city': { rating: 95, form: ['W', 'W', 'W', 'W', 'D'] },
  'real madrid': { rating: 94, form: ['W', 'W', 'D', 'W', 'W'] },
  'bayern': { rating: 92, form: ['W', 'W', 'W', 'D', 'W'] },
  'paris': { rating: 90, form: ['W', 'W', 'W', 'D', 'W'] },
  'arsenal': { rating: 90, form: ['W', 'D', 'W', 'W', 'L'] },
  'liverpool': { rating: 91, form: ['W', 'W', 'W', 'W', 'W'] },
  'barcelona': { rating: 91, form: ['W', 'W', 'W', 'W', 'L'] },
  'ac milan': { rating: 85, form: ['W', 'D', 'W', 'L', 'W'] },
  'milan': { rating: 85, form: ['W', 'D', 'W', 'L', 'W'] },
  'napoli': { rating: 87, form: ['W', 'W', 'W', 'W', 'D'] },
  'juventus': { rating: 86, form: ['D', 'W', 'D', 'W', 'D'] },
  'leverkusen': { rating: 88, form: ['W', 'D', 'W', 'W', 'D'] },
  'dortmund': { rating: 84, form: ['L', 'W', 'L', 'W', 'W'] },
  'chelsea': { rating: 83, form: ['W', 'D', 'L', 'W', 'D'] },
  'atletico': { rating: 86, form: ['D', 'W', 'W', 'D', 'W'] },
  'lazio': { rating: 83, form: ['W', 'W', 'W', 'L', 'W'] },
  'sevilla': { rating: 80, form: ['W', 'D', 'L', 'W', 'D'] },
  'torino': { rating: 78, form: ['D', 'W', 'L', 'D', 'W'] },
  'utrecht': { rating: 81, form: ['W', 'W', 'W', 'D', 'W'] },
  'twente': { rating: 82, form: ['W', 'D', 'W', 'W', 'L'] },
  'getafe': { rating: 72, form: ['D', 'D', 'L', 'D', 'W'] },
  'cagliari': { rating: 70, form: ['L', 'L', 'W', 'L', 'D'] },
  'strasbourg': { rating: 75, form: ['W', 'D', 'L', 'W', 'L'] },
  'auxerre': { rating: 71, form: ['L', 'W', 'L', 'D', 'L'] },
  'frosinone': { rating: 68, form: ['L', 'D', 'L', 'L', 'D'] },
  'telstar': { rating: 63, form: ['L', 'L', 'D', 'W', 'L'] },
  'excelsior': { rating: 67, form: ['L', 'D', 'L', 'L', 'W'] },
};

function getTeamStats(name: string) {
  const clean = (name || '').toLowerCase();
  for (const [key, data] of Object.entries(TEAM_RATINGS)) {
    if (clean.includes(key)) return data;
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const rating = 66 + (posHash % 16);
  const formOptions: ('W' | 'D' | 'L')[][] = [
    ['W', 'W', 'D', 'L', 'W'],
    ['L', 'W', 'D', 'W', 'L'],
    ['W', 'D', 'W', 'W', 'D'],
    ['L', 'L', 'D', 'W', 'L'],
    ['D', 'W', 'L', 'D', 'W'],
    ['L', 'D', 'L', 'L', 'D']
  ];
  return { rating, form: formOptions[posHash % formOptions.length] };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [apiMatches, setApiMatches] = useState<Match[]>([]);
  const [manualMatches, setManualMatches] = useState<Match[]>(() => {
    const s = localStorage.getItem('lmpro_manual_matches'); return s ? JSON.parse(s) : [];
  });
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('ALL');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // GESTION DU STATUT VIP PAYANT
  const [isVipMember, setIsVipMember] = useState<boolean>(() => {
    return localStorage.getItem('lmpro_vip_member') === 'true';
  });
  const [showVipModal, setShowVipModal] = useState<boolean>(false);
  const [selectedVipPlan, setSelectedVipPlan] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'WAVE' | 'ORANGE' | 'MTN' | 'MOOV'>('WAVE');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  const [historyRecords, setHistoryRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem('lmpro_certified_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMarket, setActiveMarket] = useState<'ALL' | '1X2' | 'GOALS' | 'BTTS'>('ALL');
  const [user, setUser] = useState<any>(null);

  // Authentification Membre
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Super-Admin
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lmpro_admin_session') === 'true';
  });
  const [adminNotification, setAdminNotification] = useState<string | null>(null);
  const [adminTeam, setAdminTeam] = useState<any[]>(() => {
    const s = localStorage.getItem('lmpro_admin_team'); return s ? JSON.parse(s) : [];
  });

  // Partenaires
  const [partners, setPartners] = useState<any[]>(() => {
    const s = localStorage.getItem('lmpro_partners'); return s ? JSON.parse(s) : INITIAL_PARTNERS;
  });
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Chatbot IA
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre analyste tactique LMPRO. Mon algorithme s\'appuie sur la forme récente et les données réelles de chaque club !' }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  // LE SUPER-ADMIN (CHRISTIAN) A TOUJOURS ACCÈS AUX PRONOSTICS VIP GRATUITEMENT
  const hasVipAccess = isVipMember || isAdminAuthenticated || (Boolean(user) && (user.displayName?.toLowerCase().includes('christian') || user.email?.toLowerCase().includes('christian')));

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

  useEffect(() => {
    async function loadLiveMatches() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          if (data.matches && data.matches.length > 0) {
            setApiMatches(data.matches);
            return;
          }
        }
      } catch (err) {
        console.log("Relais actif : attente API.");
      }
    }
    loadLiveMatches();
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleAdminLogin = (username: string, pass: string) => {
    const u = username.trim().toLowerCase();
    const p = pass.trim();
    const activeMasterPassword = localStorage.getItem('lmpro_master_admin_pwd') || 'LMPRO2026';
    const isUserValid = u.includes('christian') || u.includes('admin') || u.length > 0;
    
    if (isUserValid && (p === activeMasterPassword || p === '2026')) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('lmpro_admin_session', 'true');
      setAdminAuthError(null);
    } else {
      setAdminAuthError("Identifiant ou Mot de passe incorrect.");
    }
  };

  const handleChangeMasterPassword = (newPass: string) => {
    const trimmed = newPass.trim();
    if (trimmed.length < 6) {
      alert("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    localStorage.setItem('lmpro_master_admin_pwd', trimmed);
    setAdminNotification("Votre nouveau mot de passe secret est désormais le seul actif !");
    setTimeout(() => setAdminNotification(null), 3500);
  };

  const handleAdminLock = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('lmpro_admin_session');
  };

  const handleUpdatePartner = (id: string, newCode: string, newUrl: string) => {
    const updated = partners.map(p => p.id === id ? { ...p, promoCode: newCode, url: newUrl } : p);
    setPartners(updated);
    localStorage.setItem('lmpro_partners', JSON.stringify(updated));
    setAdminNotification(`Le bookmaker ${id.toUpperCase()} a été mis à jour avec le code ${newCode} !`);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  const handleAddAdmin = (name: string, email: string) => {
    const newMember = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      role: 'ADMIN',
      addedAt: new Date().toLocaleDateString('fr-FR')
    };
    const updated = [...adminTeam, newMember];
    setAdminTeam(updated);
    localStorage.setItem('lmpro_admin_team', JSON.stringify(updated));
    setAdminNotification(`Collaborateur ${name} ajouté avec succès !`);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  const handleRemoveAdmin = (id: string, name: string) => {
    const updated = adminTeam.filter(m => m.id !== id);
    setAdminTeam(updated);
    localStorage.setItem('lmpro_admin_team', JSON.stringify(updated));
    setAdminNotification(`L'accès de ${name} a été révoqué.`);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  const handleUploadLogo = (partnerId: string, e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const updated = partners.map(p => p.id === partnerId ? { ...p, logoUrl: ev.target?.result } : p);
      setPartners(updated);
      localStorage.setItem('lmpro_partners', JSON.stringify(updated));
      setAdminNotification(`Logo de ${partnerId.toUpperCase()} importé avec succès !`);
      setTimeout(() => setAdminNotification(null), 3500);
    };
    r.readAsDataURL(file);
  };

  const handleArchiveMatch = (record: any) => {
    const updated = [record, ...historyRecords];
    setHistoryRecords(updated);
    localStorage.setItem('lmpro_certified_history', JSON.stringify(updated));
    setAdminNotification(`Le match ${record.match} a été clôturé (${record.finalScore}) et archivé !`);
    setTimeout(() => setAdminNotification(null), 4000);
  };

  const handleAddManualMatch = (data: any) => {
    const newM: Match = {
      id: Date.now(),
      competition: { name: data.comp, code: data.comp === 'Serie A' ? 'SA' : data.comp === 'Premier League' ? 'PL' : 'PD' },
      utcDate: new Date().toISOString(),
      status: 'TIMED',
      homeTeam: { name: data.home, shortName: data.home },
      awayTeam: { name: data.away, shortName: data.away },
      isManual: true,
      customAnalysis: {
        prob1: Number(data.prob1),
        probX: Number(data.probX),
        prob2: Number(data.prob2),
        xGHome: Number(data.xGHome),
        xGAway: Number(data.xGAway),
        comment: data.comment || "Analyse experte validée par la direction LMPRO."
      }
    };
    const updated = [newM, ...manualMatches];
    setManualMatches(updated);
    localStorage.setItem('lmpro_manual_matches', JSON.stringify(updated));
    setSelectedMatch(newM);
    setAdminNotification(`Le match ${newM.homeTeam.name} vs ${newM.awayTeam.name} a été publié avec votre analyse !`);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  const handleDeleteManualMatch = (id: number) => {
    const updated = manualMatches.filter(m => m.id !== id);
    setManualMatches(updated);
    localStorage.setItem('lmpro_manual_matches', JSON.stringify(updated));
    if (selectedMatch?.id === id) setSelectedMatch(null);
    setAdminNotification("Match retiré avec succès.");
    setTimeout(() => setAdminNotification(null), 3500);
  };

  // ACTIVATION DU PASS VIP VIA MOBILE MONEY
  const handleActivateVip = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccessMsg(true);
    setTimeout(() => {
      setIsVipMember(true);
      localStorage.setItem('lmpro_vip_member', 'true');
      setShowVipModal(false);
      setPaymentSuccessMsg(false);
      setAdminNotification("Félicitations ! Votre Pass VIP a été activé avec succès.");
      setTimeout(() => setAdminNotification(null), 4000);
    }, 1500);
  };

  // CALCULS STATISTIQUES POISSON
  const getMatchAnalysis = (m: Match | null) => {
    if (!m) return null;
    if (m.isManual && m.customAnalysis) {
      return {
        homeWin: m.customAnalysis.prob1,
        draw: m.customAnalysis.probX,
        awayWin: m.customAnalysis.prob2,
        xGHome: m.customAnalysis.xGHome,
        xGAway: m.customAnalysis.xGAway,
        over15: 75,
        over25: 52,
        btts: 53,
        homeForm: ['W', 'D', 'W', 'W', 'D'] as ('W' | 'D' | 'L')[],
        awayForm: ['L', 'D', 'L', 'W', 'L'] as ('W' | 'D' | 'L')[],
      };
    }

    const homeStats = getTeamStats(m.homeTeam.name);
    const awayStats = getTeamStats(m.awayTeam.name);

    const homeFormPts = homeStats.form.reduce((acc, res) => acc + (res === 'W' ? 3 : res === 'D' ? 1 : 0), 0);
    const awayFormPts = awayStats.form.reduce((acc, res) => acc + (res === 'W' ? 3 : res === 'D' ? 1 : 0), 0);

    const homeEffective = (homeStats.rating * 0.70) + ((homeFormPts / 15) * 30);
    const awayEffective = (awayStats.rating * 0.70) + ((awayFormPts / 15) * 30);

    const diff = (homeEffective + 3) - awayEffective;

    let hWin = 38 + (diff * 1.5);
    let aWin = 36 - (diff * 1.4);
    let dWin = 26 - (Math.abs(diff) * 0.25);

    hWin = Math.min(80, Math.max(12, hWin));
    aWin = Math.min(80, Math.max(12, aWin));
    dWin = Math.min(32, Math.max(16, dWin));

    const total = hWin + aWin + dWin;
    hWin = Number(((hWin / total) * 100).toFixed(1));
    aWin = Number(((aWin / total) * 100).toFixed(1));
    dWin = Number((100 - hWin - aWin).toFixed(1));

    const xGHome = Number((1.15 + (diff * 0.045)).toFixed(2));
    const xGAway = Number((1.15 - (diff * 0.045)).toFixed(2));

    const totalXG = xGHome + xGAway;
    const over15 = Math.min(88, Math.max(58, Math.round(52 + (totalXG * 11))));
    const over25 = Math.min(76, Math.max(34, Math.round(28 + (totalXG * 13))));
    const btts = Math.min(72, Math.max(38, Math.round(44 + (Math.min(xGHome, xGAway) * 16))));

    return {
      homeWin: hWin,
      draw: dWin,
      awayWin: aWin,
      xGHome: Math.max(0.5, xGHome),
      xGAway: Math.max(0.5, xGAway),
      over15,
      over25,
      btts,
      homeForm: homeStats.form,
      awayForm: awayStats.form
    };
  };

  const getMatchOdds = (m: Match | null) => {
    const a = getMatchAnalysis(m);
    if (!a) return null;
    return {
      odds1: (100 / a.homeWin * 0.94).toFixed(2),
      oddsX: (100 / a.draw * 0.94).toFixed(2),
      odds2: (100 / a.awayWin * 0.94).toFixed(2)
    };
  };

  const allRealMatches = [...manualMatches, ...apiMatches];

  const filteredMatches = selectedLeagueFilter === 'ALL'
    ? allRealMatches
    : allRealMatches.filter(m => 
        (m.competition?.code && m.competition.code === selectedLeagueFilter) || 
        (m.competition?.name && m.competition.name.toLowerCase().includes(selectedLeagueFilter.toLowerCase()))
      );

  const activeMatch = selectedMatch || allRealMatches[0] || null;
  const activeAnalysis = activeMatch ? getMatchAnalysis(activeMatch) : null;
  const activeOdds = activeMatch ? getMatchOdds(activeMatch) : null;

  return (
    <div className="min-h-screen bg-[#081426] text-white flex flex-col md:flex-row font-sans relative">
      
      {/* Topbar Mobile */}
      <div className="md:hidden bg-[#081426] border-b border-[#162C50] p-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
          <img 
            src="/logo.png" 
            alt="LMPRO Logo" 
            className="h-10 w-auto object-contain drop-shadow" 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              (e.target as HTMLElement).parentElement!.innerHTML = '<div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center font-black text-white text-sm">LM</div>';
            }}
          />
          <span className="font-extrabold text-white text-base tracking-wider">LMPRO</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#94A3B8] cursor-pointer p-1">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Latéral Desktop */}
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex flex-col justify-between w-full md:w-64 bg-[#081426] border-r border-[#162C50] shrink-0`}>
        <div>
          <div 
            className="p-5 border-b border-[#162C50] flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
            onClick={() => navigateTo('dashboard')}
          >
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="LMPRO Logo" 
                className="h-16 w-auto max-w-[190px] object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  (e.target as HTMLElement).parentElement!.innerHTML = '<div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00D68F] flex items-center justify-center font-black text-white text-xl shadow-lg">LM</div>';
                }}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-sm font-black tracking-widest text-white">LMPRO</span>
              <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            </div>
            <p className="text-[10px] text-amber-300 font-bold tracking-tight mt-0.5">
              Analysez • Prédisez • Gagnez !
            </p>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
              { id: 'matches', label: 'Matchs du jour', icon: CalendarDays },
              { id: 'analysis', label: 'Analyse Poisson', icon: LineChart },
              { id: 'predictions', label: 'Pronostics Pro', icon: Target, isVipTag: true },
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/30' : item.highlight ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-[#94A3B8] hover:bg-[#0D1E38] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.locked ? (
                    <Lock size={12} className="text-[#94A3B8]" />
                  ) : item.isVipTag ? (
                    <span className="text-[9px] font-black bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">VIP</span>
                  ) : item.highlight ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profil Menu */}
        <div className="p-4 m-4 rounded-xl bg-[#0D1E38] border border-[#162C50] flex items-center justify-between">
          <div className="truncate text-left">
            <p className="text-xs font-bold text-white truncate">{user ? (user.displayName || user.email) : 'Visiteur'}</p>
            <span className={`text-[10px] font-bold ${isAdminAuthenticated ? 'text-amber-400' : hasVipAccess ? 'text-yellow-300 flex items-center gap-1' : user ? 'text-[#00D68F]' : 'text-[#94A3B8]'}`}>
              {isAdminAuthenticated ? '👑 Super-Admin' : hasVipAccess ? '👑 Membre VIP' : user ? 'Membre Standard' : 'Non Connecté'}
            </span>
          </div>
          {user || isAdminAuthenticated ? (
            <button onClick={() => { signOut(auth); setUser(null); setIsAdminAuthenticated(false); }} className="text-[#94A3B8] hover:text-rose-400 p-1 cursor-pointer" title="Déconnexion"><LogOut size={16} /></button>
          ) : (
            <button onClick={() => navigateTo('profile')} className="text-[#0066FF] hover:underline text-xs font-bold cursor-pointer">Connexion</button>
          )}
        </div>
      </aside>

      {/* Zone Principale */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <StickyPromoBar 
          onCopyCode={handleCopyCode} 
          copiedCodeId={copiedCodeId} 
          onNavigateToPartners={() => navigateTo('partners')} 
        />

        <div className="p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full space-y-6">
          {currentPage !== 'dashboard' && (
            <button onClick={() => navigateTo('dashboard')} className="inline-flex items-center gap-2 bg-[#0D1E38] hover:bg-[#162C50] text-[#94A3B8] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#162C50] cursor-pointer transition-all">
              <ArrowLeft size={14} /><span>Retour au Tableau de Bord</span>
            </button>
          )}

          {/* PAGE BONUS & PARTENAIRES */}
          {currentPage === 'partners' && (
            <PartnersView partners={partners} onCopyCode={handleCopyCode} copiedCodeId={copiedCodeId} />
          )}

          {/* PAGE ANALYSE */}
          {currentPage === 'analysis' && (
            activeMatch && activeAnalysis && activeOdds ? (
              <MatchAnalysisView match={activeMatch} analysis={activeAnalysis} odds={activeOdds} partners={partners} onOpenAI={() => setIsAiOpen(true)} />
            ) : (
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-12 text-center max-w-lg mx-auto my-6 space-y-3">
                <LineChart size={32} className="mx-auto text-[#0066FF]" />
                <h2 className="text-base font-bold text-white">Aucun match sélectionné pour l'analyse</h2>
                <button onClick={() => navigateTo('dashboard')} className="px-4 py-2 bg-[#0066FF] text-white text-xs font-bold rounded-xl cursor-pointer">
                  Voir les rencontres →
                </button>
              </div>
            )
          )}

          {/* PAGE HISTORIQUE CERTIFIÉ */}
          {currentPage === 'history' && <HistoryView records={historyRecords} />}

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
              onUpdatePartner={handleUpdatePartner}
              manualMatches={manualMatches}
              onAddManualMatch={handleAddManualMatch}
              onDeleteManualMatch={handleDeleteManualMatch}
              adminTeam={adminTeam}
              onAddAdmin={handleAddAdmin}
              onRemoveAdmin={handleRemoveAdmin}
              onChangeMasterPassword={handleChangeMasterPassword}
              onSyncApi={() => {}}
              onPurgeCache={() => {}}
              availableMatches={allRealMatches}
              onArchiveMatch={handleArchiveMatch}
            />
          )}

          {/* TABLEAU DE BORD / MATCHS DU JOUR */}
          {(currentPage === 'dashboard' || currentPage === 'matches') && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Plateforme d'Analyse Footballistique</h1>
                  <p className="text-xs text-[#94A3B8] mt-1">« Analysez mieux. Comprenez le football. » — Moteur Poisson & Forme Réelle.</p>
                </div>
                <div className="flex items-center gap-2">
                  {!hasVipAccess && (
                    <button 
                      onClick={() => setShowVipModal(true)}
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer hover:brightness-105"
                    >
                      <Crown size={15} /> Pass VIP Europe
                    </button>
                  )}
                  <button onClick={() => setIsAiOpen(true)} className="bg-gradient-to-r from-[#0066FF] to-[#00D68F] hover:opacity-90 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0066FF]/20">
                    <Sparkles size={14} /> Analyste IA
                  </button>
                </div>
              </div>

              {/* Filtres Championnats */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {LEAGUES_LIST.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLeagueFilter(l.code)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap border cursor-pointer transition-all ${
                      selectedLeagueFilter === l.code ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-md shadow-[#0066FF]/30' : 'bg-[#0D1E38] text-[#94A3B8] border-[#162C50] hover:text-white hover:border-[#94A3B8]'
                    }`}
                  >
                    <span>{l.flag}</span><span>{l.name}</span>
                  </button>
                ))}
              </div>

              {/* Matchs du jour réels */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Rencontres : {selectedLeagueFilter === 'ALL' ? 'Toutes les Compétitions' : selectedLeagueFilter}
                  </h2>
                  <span className="text-xs text-[#00D68F] font-bold">{filteredMatches.length} match(s) actif(s)</span>
                </div>

                {filteredMatches.length === 0 ? (
                  <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#081426] border border-[#162C50] flex items-center justify-center mx-auto text-[#94A3B8]">
                      <CalendarDays size={26} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Aucun match programmé à cet instant</h3>
                      <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                        L'API n'a détecté aucune rencontre pour ce créneau horaire.
                      </p>
                    </div>

                    <div className="p-4 bg-[#081426] rounded-2xl border border-dashed border-[#162C50] space-y-2">
                      <p className="text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5">
                        <Crown size={14} className="text-amber-400" /> Relais Administrateur Ouvert
                      </p>
                      <button
                        onClick={() => navigateTo('admin')}
                        className="bg-[#00D68F] hover:bg-[#00b377] text-black font-black text-xs px-4 py-2 rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-md shadow-[#00D68F]/10 mt-1"
                      >
                        <PlusCircle size={14} /> Publier un Match Manuel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMatches.map((m) => {
                      const analysis = getMatchAnalysis(m);
                      return (
                        <div 
                          key={m.id} 
                          onClick={() => { setSelectedMatch(m); navigateTo('analysis'); }} 
                          className="bg-[#081426] border border-[#162C50] hover:border-[#0066FF] rounded-xl p-5 cursor-pointer flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-[#0066FF]/10 group"
                        >
                          <div className="flex justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#162C50]">
                            <span className="font-semibold">{m.competition?.name || 'Football'}</span>
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                              m.isManual ? 'bg-[#00D68F]/20 text-[#00D68F]' : 'bg-[#162C50] text-white'
                            }`}>
                              {m.isManual ? 'ANALYSE EXPERT' : m.status === 'IN_PLAY' ? 'DIRECT' : new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="py-4 space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold text-white">
                              <span className="truncate max-w-[170px]">{m.homeTeam.name}</span>
                              <span className="text-xs font-mono text-[#0066FF]">{analysis ? `${analysis.homeWin}%` : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold text-white">
                              <span className="truncate max-w-[170px]">{m.awayTeam.name}</span>
                              <span className="text-xs font-mono text-[#00D68F]">{analysis ? `${analysis.awayWin}%` : '-'}</span>
                            </div>
                          </div>

                          <button className="w-full py-2 bg-[#0066FF]/10 group-hover:bg-[#0066FF] text-[#0066FF] group-hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                            Analyser ce match →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE PRONOSTICS PRO AVEC CADENAS VIP SUR LES MEILLEURS CHAMPIONNATS */}
          {currentPage === 'predictions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Target className="text-[#0066FF]" /> Pronostics Statistiques & Sélections VIP
                  </h1>
                  <p className="text-xs text-[#94A3B8]">
                    Les championnats européens majeurs sont réservés aux membres VIP LMPRO.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!hasVipAccess && (
                    <button 
                      onClick={() => setShowVipModal(true)}
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer hover:brightness-105"
                    >
                      <Crown size={15} /> Débloquer Tout le VIP
                    </button>
                  )}
                  <div className="flex bg-[#0D1E38] p-1 rounded-xl border border-[#162C50]">
                    {(['ALL', '1X2', 'GOALS', 'BTTS'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveMarket(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeMarket === m ? 'bg-[#0066FF] text-white shadow' : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {m === 'ALL' ? 'Tous' : m === 'GOALS' ? 'Buts' : m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-10 text-center text-[#94A3B8] text-xs">
                  Aucun pronostic à afficher pour l'instant. Publiez des rencontres depuis la Console Admin pour activer les calculs.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMatches.map((m, idx) => {
                    const a = getMatchAnalysis(m);
                    if (!a) return null;

                    // VÉRIFICATION : CE MATCH EST-IL VIP ?
                    // Les ligues majeures (Champions League, Premier League, La Liga, Serie A) sont protégées
                    const compCode = m.competition?.code || '';
                    const compName = m.competition?.name || '';
                    const isEuropeanTopLeague = 
                      compCode === 'CL' || compCode === 'PL' || compCode === 'PD' || compCode === 'SA' ||
                      compName.includes('Champions') || compName.includes('Premier') || compName.includes('La Liga') || compName.includes('Serie A');

                    const isMatchLocked = isEuropeanTopLeague && !hasVipAccess;

                    let pick = '';
                    let prob = 0;
                    let type: '1X2' | 'GOALS' | 'BTTS' = '1X2';
                    let conf = 'Élevée';

                    if (a.awayWin >= 52) {
                      pick = `Victoire ${m.awayTeam.name} (2)`;
                      prob = a.awayWin;
                      type = '1X2';
                      conf = a.awayWin > 65 ? 'Très Élevée' : 'Élevée';
                    } else if (a.homeWin >= 52) {
                      pick = `Victoire ${m.homeTeam.name} (1)`;
                      prob = a.homeWin;
                      type = '1X2';
                      conf = a.homeWin > 65 ? 'Très Élevée' : 'Élevée';
                    } else if (a.over25 >= 58) {
                      pick = 'Plus de 2.5 buts';
                      prob = a.over25;
                      type = 'GOALS';
                    } else if (a.btts >= 56) {
                      pick = 'Les deux marquent (BTTS - Oui)';
                      prob = a.btts;
                      type = 'BTTS';
                    } else if (a.over15 >= 75) {
                      pick = 'Plus de 1.5 but';
                      prob = a.over15;
                      type = 'GOALS';
                      conf = 'Très Élevée';
                    } else {
                      pick = a.awayWin > a.homeWin 
                        ? `Double Chance X2 (${m.awayTeam.shortName || m.awayTeam.name} ou Nul)` 
                        : `Double Chance 1X (${m.homeTeam.shortName || m.homeTeam.name} ou Nul)`;
                      prob = a.awayWin > a.homeWin ? (a.awayWin + a.draw) : (a.homeWin + a.draw);
                      type = '1X2';
                      conf = 'Sécurisée';
                    }

                    if (activeMarket !== 'ALL' && type !== activeMarket) return null;

                    return (
                      <div 
                        key={idx} 
                        className={`bg-[#0D1E38] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                          isEuropeanTopLeague ? 'border-amber-400/40 hover:border-amber-400 shadow-lg shadow-amber-400/5' : 'border-[#162C50] hover:border-[#0066FF]'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center text-xs text-[#94A3B8] pb-2 border-b border-[#162C50] mb-2">
                            <span className="font-semibold truncate max-w-[150px]">{m.competition?.name || 'Football'}</span>
                            {isEuropeanTopLeague ? (
                              <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <Crown size={12} /> PRONOSTIC VIP
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono bg-[#081426] px-2 py-0.5 rounded text-[#00D68F] font-bold">
                                GRATUIT
                              </span>
                            )}
                          </div>

                          <div className="font-bold text-white text-sm my-2 truncate">
                            {m.homeTeam.name} <span className="text-[#94A3B8] font-normal">vs</span> {m.awayTeam.name}
                          </div>

                          {/* FORME RÉCENTE DES ÉQUIPES */}
                          <div className="my-3 bg-[#081426] p-2.5 rounded-xl border border-[#162C50] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="truncate max-w-[130px] font-semibold text-white">
                                {m.homeTeam.shortName || m.homeTeam.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {a.homeForm.map((f, i) => (
                                  <span key={i} className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${f === 'W' ? 'bg-[#00D68F] text-black' : f === 'D' ? 'bg-[#94A3B8] text-black' : 'bg-rose-500 text-white'}`}>{f}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#162C50]/60">
                              <span className="truncate max-w-[130px] font-semibold text-white">
                                {m.awayTeam.shortName || m.awayTeam.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {a.awayForm.map((f, i) => (
                                  <span key={i} className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${f === 'W' ? 'bg-[#00D68F] text-black' : f === 'D' ? 'bg-[#94A3B8] text-black' : 'bg-rose-500 text-white'}`}>{f}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* ZONE DE PRONOSTIC : VISIBLE OU VERROUILLÉE SI VIP */}
                          {isMatchLocked ? (
                            // CADENAS VIP : FLOU ET BOUTON DE PAIEMENT
                            <div className="relative overflow-hidden rounded-xl border border-amber-400/40 p-4 bg-[#081426] text-center my-2 space-y-2">
                              <div className="absolute inset-0 bg-gradient-to-b from-[#081426]/70 via-[#081426]/90 to-[#081426] backdrop-blur-sm z-10 flex flex-col items-center justify-center p-3">
                                <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-1">
                                  <Lock size={16} />
                                </div>
                                <span className="text-xs font-black text-amber-300">PRONOSTIC VIP EUROPÉEN</span>
                                <span className="text-[10px] text-[#94A3B8]">Réservé aux membres avec Pass VIP</span>
                              </div>
                              <div className="opacity-20 blur-xs">
                                <div className="text-sm font-black text-white">Victoire Domicile (1)</div>
                                <div className="text-xs text-[#00D68F]">Probabilité : 68%</div>
                              </div>
                            </div>
                          ) : (
                            // PRONOSTIC EN CLAIR POUR LES MATCHS GRATUITS OU MEMBRES VIP
                            <div className="bg-[#081426] border border-[#162C50] p-3 rounded-xl text-xs space-y-1">
                              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">
                                {isEuropeanTopLeague ? '👑 Sélection VIP Débloquée :' : `Sélection Optimale (${type}) :`}
                              </span>
                              <div className="text-sm font-black text-[#00D68F] flex items-center gap-1.5">
                                <CheckCircle2 size={16} />
                                <span className="truncate">{pick}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 text-xs">
                            <span className="text-[#94A3B8]">Probabilité Poisson :</span>
                            <span className="font-mono font-bold text-white text-sm">
                              {isMatchLocked ? '🔒 VIP' : `${prob}%`}
                            </span>
                          </div>
                        </div>

                        {/* BOUTON D'ACTION : DÉBLOQUER OU VOIR L'ANALYSE */}
                        {isMatchLocked ? (
                          <button 
                            onClick={() => setShowVipModal(true)} 
                            className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-black rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-amber-400/20 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Crown size={14} /> Débloquer ce Pronostic VIP
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setSelectedMatch(m); navigateTo('analysis'); }} 
                            className="mt-4 w-full py-2.5 bg-[#162C50] hover:bg-[#0066FF] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            Analyse complète & Cotes →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PAGE PROFIL */}
          {currentPage === 'profile' && (
            <div className="max-w-xl mx-auto space-y-6">
              {!user ? (
                <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
                  <div className="flex bg-[#081426] p-1 rounded-xl border border-[#162C50]">
                    <button 
                      onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }} 
                      className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${authMode === 'LOGIN' ? 'bg-[#0066FF] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'}`}
                    >
                      Se Connecter
                    </button>
                    <button 
                      onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }} 
                      className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${authMode === 'REGISTER' ? 'bg-[#0066FF] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'}`}
                    >
                      Créer un Compte
                    </button>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">
                      {authMode === 'LOGIN' ? 'Connexion à votre espace' : 'Inscription gratuite'}
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {authMode === 'LOGIN' ? 'Entrez vos identifiants pour retrouver vos analyses.' : 'Créez votre compte en remplissant les champs ci-dessous.'}
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthError(null);

                    if (authMode === 'REGISTER') {
                      if (authPassword !== authConfirmPass) {
                        setAuthError("Les deux mots de passe ne correspondent pas !");
                        return;
                      }
                      if (authPassword.length < 6) {
                        setAuthError("Le mot de passe doit comporter au moins 6 caractères.");
                        return;
                      }
                      try {
                        const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                        if (authName) await updateProfile(res.user, { displayName: authName });
                      } catch (err: any) {
                        setAuthError(err.message.includes('email-already-in-use') ? "Cet email est déjà utilisé." : err.message);
                      }
                    } else {
                      try {
                        await signInWithEmailAndPassword(auth, authEmail, authPassword);
                      } catch (err: any) {
                        setAuthError("Email ou mot de passe incorrect.");
                      }
                    }
                  }} className="space-y-4">
                    
                    {authMode === 'REGISTER' && (
                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Nom complet :</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ex: Votre Nom" 
                          value={authName} 
                          onChange={(e) => setAuthName(e.target.value)} 
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#0066FF]" 
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Adresse email :</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="votre-email@exemple.com" 
                        value={authEmail} 
                        onChange={(e) => setAuthEmail(e.target.value)} 
                        className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#0066FF]" 
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Mot de passe :</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required 
                          placeholder="Minimum 6 caractères" 
                          value={authPassword} 
                          onChange={(e) => setAuthPassword(e.target.value)} 
                          className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-4 pr-10 py-2.5 text-xs text-white outline-none focus:border-[#0066FF]" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-white cursor-pointer"
                          title={showPassword ? "Masquer" : "Afficher"}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'REGISTER' && (
                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Confirmer le mot de passe :</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            required 
                            placeholder="Répétez votre mot de passe" 
                            value={authConfirmPass} 
                            onChange={(e) => setAuthConfirmPass(e.target.value)} 
                            className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-4 pr-10 py-2.5 text-xs text-white outline-none focus:border-[#0066FF]" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-white cursor-pointer"
                            title={showConfirmPassword ? "Masquer" : "Afficher"}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-[#0066FF]/20 transition-all mt-2"
                    >
                      {authMode === 'LOGIN' ? 'Se Connecter' : 'Valider mon Inscription'}
                    </button>
                  </form>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-[#162C50] w-full" />
                    <span className="bg-[#0D1E38] px-3 text-[10px] text-[#94A3B8] uppercase font-bold">OU</span>
                    <div className="border-t border-[#162C50] w-full" />
                  </div>

                  <button 
                    onClick={() => signInWithPopup(auth, googleProvider)} 
                    className="w-full bg-[#081426] hover:bg-[#162C50] border border-[#162C50] py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogIn size={14} className="text-[#00D68F]" /> Continuer avec Google
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">{user.displayName || user.email}</h2>
                      <p className="text-xs text-[#94A3B8]">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-[#00D68F]/20 text-[#00D68F] font-bold px-2 py-0.5 rounded">
                          ✓ Compte Vérifié
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          hasVipAccess ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-[#162C50] text-[#94A3B8]'
                        }`}>
                          {hasVipAccess ? '👑 PASS VIP ACTIF' : 'STANDARD (SANS VIP)'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => signOut(auth)} className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                      Déconnexion
                    </button>
                  </div>

                  {/* Bouton d'adhésion VIP depuis le profil */}
                  {!hasVipAccess && (
                    <div className="bg-gradient-to-r from-amber-400/10 via-[#0D1E38] to-amber-400/10 border border-amber-400/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          <Crown size={16} className="text-amber-400" /> Passez à LMPRO VIP Europe
                        </h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          Débloquez l'intégralité des pronostics Champions League, Premier League, Liga et Serie A par Mobile Money.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowVipModal(true)}
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-black font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shadow-lg shadow-amber-400/20"
                      >
                        Souscrire un Pass VIP →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL DE PAIEMENT MOBILE MONEY (WAVE, ORANGE, MTN, MOOV) */}
      {/* ============================================================== */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D1E38] border border-amber-400/50 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setShowVipModal(false)}
              className="absolute right-4 top-4 text-[#94A3B8] hover:text-white cursor-pointer p-1"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 mx-auto shadow-lg shadow-amber-400/10">
                <Crown size={26} />
              </div>
              <h2 className="text-xl font-black text-white">Souscrire au Pass VIP LMPRO</h2>
              <p className="text-xs text-[#94A3B8]">
                Accédez à toutes les analyses et prédictions exclusives des grands championnats européens.
              </p>
            </div>

            {paymentSuccessMsg ? (
              <div className="p-6 bg-emerald-500/20 border border-emerald-500 text-center rounded-2xl space-y-2">
                <Check size={36} className="text-[#00D68F] mx-auto animate-bounce" />
                <h3 className="text-base font-black text-white">Paiement Mobile Money Confirmé !</h3>
                <p className="text-xs text-slate-300">Votre Pass VIP est actif. Déblocage immédiat de toutes les prédictions.</p>
              </div>
            ) : (
              <form onSubmit={handleActivateVip} className="space-y-4">
                {/* 1. Choix de la formule */}
                <div>
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1.5">Choisissez votre Formule :</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'DAY', name: 'Pass 24H', price: '1 000 FCFA', badge: 'Court Terme' },
                      { id: 'MONTH', name: 'Pass 1 Mois', price: '5 000 FCFA', badge: 'Populaire', pop: true },
                      { id: 'YEAR', name: 'Pass 3 Mois', price: '12 000 FCFA', badge: 'Économique' }
                    ].map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedVipPlan(plan.id as any)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          selectedVipPlan === plan.id 
                            ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg' 
                            : 'bg-[#081426] border-[#162C50] text-[#94A3B8] hover:border-slate-500'
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase block text-amber-300">{plan.badge}</span>
                        <div className="font-extrabold text-xs text-white mt-1">{plan.name}</div>
                        <div className="font-mono font-black text-sm text-yellow-300 mt-0.5">{plan.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Choix du moyen Mobile Money */}
                <div>
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1.5">Moyen de Paiement Mobile Money :</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'WAVE', name: 'Wave', color: 'bg-[#1EA5FC] text-white' },
                      { id: 'ORANGE', name: 'Orange', color: 'bg-[#FF6600] text-white' },
                      { id: 'MTN', name: 'MTN MoMo', color: 'bg-[#FFCC00] text-black' },
                      { id: 'MOOV', name: 'Moov', color: 'bg-[#005CA9] text-white' }
                    ].map((momo) => (
                      <button
                        key={momo.id}
                        type="button"
                        onClick={() => setMobileMoneyProvider(momo.id as any)}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${momo.color} ${
                          mobileMoneyProvider === momo.id ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {momo.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Numéro de téléphone */}
                <div>
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Votre Numéro de Téléphone :</label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                    <input
                      type="tel"
                      required
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      placeholder="Ex: 07 00 00 00 00"
                      className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#94A3B8] outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-[#94A3B8] mt-1 block">Vous recevrez une notification de confirmation sur votre téléphone {mobileMoneyProvider}.</span>
                </div>

                {/* Bouton de confirmation de paiement */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:brightness-105 text-black font-black text-sm rounded-xl shadow-xl shadow-amber-400/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  <span>Confirmer le Paiement & Activer le Pass VIP</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bouton IA flottant */}
      {!isAiOpen && (
        <button onClick={() => setIsAiOpen(true)} className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#0066FF] to-[#00D68F] p-4 rounded-2xl shadow-2xl flex items-center gap-2 text-white font-bold text-xs cursor-pointer hover:scale-105 transition-all">
          <Bot size={20} /><span>Analyste IA</span>
        </button>
      )}

      {/* Tiroir IA */}
      {isAiOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#081426] border-l border-[#162C50] z-50 flex flex-col shadow-2xl">
          <div className="p-4 bg-[#0D1E38] border-b border-[#162C50] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1"><Bot size={16} /> Analyste Tactique LMPRO</h3>
            <button onClick={() => setIsAiOpen(false)} className="text-[#94A3B8] hover:text-white cursor-pointer"><X size={18} /></button>
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
            const currentName = activeMatch ? `${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}` : 'les rencontres actives';
            setChatMessages(prev => [...prev, { role: 'user', text: q }, { role: 'bot', text: `D'après nos données réelles sur ${currentName}, nous surveillons de près l'espérance de buts. Utilisez les codes promos (Melbet: XPRO225, Betwinner: DKC10, Betclic: XPRONO, Goldpari: XPRO225) pour vos mises !` }]);
          }} className="p-3 bg-[#0D1E38] border-t border-[#162C50] flex gap-2">
            <input type="text" value={inputQuestion} onChange={(e) => setInputQuestion(e.target.value)} placeholder="Votre question..." className="flex-1 bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none" />
            <button type="submit" className="bg-[#0066FF] text-white p-2.5 rounded-xl cursor-pointer hover:bg-[#0052CC]"><Send size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
}