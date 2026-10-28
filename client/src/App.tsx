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
  Globe, 
  Lock, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  Crown, 
  Gift, 
  Copy, 
  ExternalLink, 
  TrendingUp,
  Upload,
  FolderOpen
} from 'lucide-react';

// IMPORTATION DES PARTENAIRES ET DES COULEURS OFFICIELLES
import { PartnersView, INITIAL_PARTNERS, getPartnerTheme } from './components/PartnersView';
import type { PartnerBookmaker } from './components/PartnersView';
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

const ALL_LEAGUES_MATCHES: Match[] = [
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
  {
    id: 4007,
    competition: { name: 'Serie A', code: 'SA' },
    utcDate: '2026-10-28T19:45:00Z',
    status: 'TIMED',
    homeTeam: { name: 'FC Internazionale Milano', shortName: 'Inter', crest: 'https://crests.football-data.org/108.png' },
    awayTeam: { name: 'Juventus FC', shortName: 'Juventus', crest: 'https://crests.football-data.org/109.png' }
  },
  {
    id: 4008,
    competition: { name: 'Bundesliga', code: 'BL1' },
    utcDate: '2026-10-28T17:30:00Z',
    status: 'TIMED',
    homeTeam: { name: 'FC Bayern München', shortName: 'Bayern', crest: 'https://crests.football-data.org/5.png' },
    awayTeam: { name: 'Borussia Dortmund', shortName: 'Dortmund', crest: 'https://crests.football-data.org/4.png' }
  },
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
  const [matches] = useState<Match[]>(ALL_LEAGUES_MATCHES);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<Match>(ALL_LEAGUES_MATCHES[0]);

  const [activeMarket, setActiveMarket] = useState<'ALL' | '1X2' | 'GOALS' | 'BTTS'>('ALL');
  const [user, setUser] = useState<any>(null);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>(['Premier League', 'La Liga', 'Ligue 1']);

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre analyste tactique LMPRO. Posez-moi une question sur le match sélectionné !' }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // CHARGEMENT DES PARTENAIRES (MELBET, BETWINNER, GOLDPARIS, BETCLIC)
  const [partners, setPartners] = useState<PartnerBookmaker[]>(() => {
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
    return [
      {
        id: '1',
        email: 'christian.diabagate',
        name: 'Christian Diabagate (Propriétaire)',
        role: 'SUPER_ADMIN',
        addedAt: '28/10/2026'
      }
    ];
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  const userEmail = user?.email?.toLowerCase() || '';
  const userName = user?.displayName?.toLowerCase() || '';

  const isSuperAdmin = user && (
    userName.includes('christian') || 
    userEmail.includes('christian') || 
    adminTeam.some(m => m.role === 'SUPER_ADMIN' && (m.email.toLowerCase() === userEmail || userEmail.includes(m.email.toLowerCase())))
  );

  const isSecondaryAdmin = user && adminTeam.some(m => m.role === 'ADMIN' && m.email.toLowerCase() === userEmail);
  const hasAdminAccess = isSuperAdmin || isSecondaryAdmin;

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
      triggerAdminAction(`Logo de ${partnerId.toUpperCase()} importé avec succès depuis votre ordinateur !`);
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
    triggerAdminAction(`Administrateur ${newMember.name} ajouté avec succès.`);
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

    const home = selectedMatch.homeTeam.name;
    const away = selectedMatch.awayTeam.name;
    const comp = selectedMatch.competition.name;
    const lowerQ = q.toLowerCase();

    setTimeout(() => {
      let reply = "";
      if (lowerQ.includes('jour') || lowerQ.includes('salut') || lowerQ.includes('hello')) {
        reply = `Bonjour ! Sur ce match ${home} vs ${away} (${comp}), nous estimons 1.84 xG pour ${home} contre 1.18 pour ${away}. Utilisez nos codes promos officiels (Melbet: XPRO225, Betwinner: DKC10, Goldparis: LMPRO, Betclic: XPRONO) pour doubler vos dépôts !`;
      } else if (lowerQ.includes('qui') || lowerQ.includes('favori') || lowerQ.includes('gagn')) {
        reply = `D'après notre modèle de Poisson, ${home} est favori à domicile avec 48.2% de probabilité de victoire (Nul 27.1%, ${away} 24.7%).`;
      } else if (lowerQ.includes('but') || lowerQ.includes('over') || lowerQ.includes('score')) {
        reply = `L'espérance totale s'élève à 3.02 buts. Le marché "Plus de 1.5 but" présente 78.4% de probabilité. Les scores exacts les plus probables sont 1-1 (12.8%) et 2-1 (11.4%).`;
      } else if (lowerQ.includes('btts') || lowerQ.includes('marqu') || lowerQ.includes('deux')) {
        reply = `La probabilité que les deux équipes marquent (BTTS - Oui) est évaluée à 58.9%.`;
      } else {
        reply = `Pour ${home} vs ${away} (${comp}), l'avantage du terrain est net pour ${home} (xG: 1.84). L'Over 1.5 but est le choix le plus robuste (78.4%).`;
      }
      setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
      setAiLoading(false);
    }, 600);
  };

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
              { id: 'partners', label: 'Bonus & Partenaires', icon: Gift, highlight: true },
              { id: 'history', label: 'Historique Certifié', icon: History },
              { id: 'profile', label: 'Mon Profil', icon: User },
              { id: 'admin', label: 'Console Admin', icon: ShieldCheck, locked: !hasAdminAccess },
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
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-[#0066FF]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#162C50] border border-[#0066FF] flex items-center justify-center text-xs text-white">
                <User size={16} />
              </div>
            )}
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate">{user ? user.displayName : 'Invité'}</p>
              <span className={`text-[10px] font-bold ${isSuperAdmin ? 'text-amber-400' : isSecondaryAdmin ? 'text-[#0066FF]' : 'text-[#00D68F]'}`}>
                {isSuperAdmin ? '👑 Super-Admin' : isSecondaryAdmin ? '🛡️ Admin' : user ? 'Membre' : 'Mode Démo'}
              </span>
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
            <span><strong className="text-white">COTES & PARTENAIRES OFFICIELS :</strong> Melbet, Betwinner, Goldparis & Betclic</span>
          </div>
          <span className="font-mono bg-[#162C50] text-white px-2 py-0.5 rounded text-[10px] font-bold">
            PRO V2.4
          </span>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* VUE : BONUS & PARTENAIRES (BLOC DÉDIÉ ET MODULAIRE) */}
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
              {!hasAdminAccess ? (
                <div className="bg-[#0D1E38] border border-rose-500/30 rounded-2xl p-10 text-center max-w-xl mx-auto my-12 space-y-4 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-400">
                    <ShieldAlert size={36} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Accès Réservé à l'Administration</h2>
                    <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                      Cette section est strictement confidentielle et réservée au propriétaire (<strong>Christian Diabagate</strong>) et aux administrateurs autorisés.
                    </p>
                  </div>
                </div>
              ) : (
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
                        {isSuperAdmin ? <Crown size={22} className="text-amber-400" /> : <ShieldCheck size={22} className="text-[#0066FF]" />}
                        <h1 className="text-2xl font-black text-white tracking-tight">
                          {isSuperAdmin ? "Console Super-Admin (Propriétaire)" : "Console Administrateur Délégué"}
                        </h1>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Session active : <strong className="text-white">{user ? user.displayName : 'Christian Diabagate'}</strong> 
                        <span className="ml-2 font-mono text-[10px] px-2 py-0.5 rounded bg-[#162C50] text-[#00D68F]">
                          {isSuperAdmin ? 'Droits Illimités' : 'Droits Restreints'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => triggerAdminAction("Synchronisation forcée effectuée avec succès !")}
                        className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#0066FF]/20"
                      >
                        🔄 Forcer Synchronisation
                      </button>

                      {isSuperAdmin && (
                        <button 
                          onClick={() => triggerAdminAction("Cache mémoire purgé avec succès !")}
                          className="bg-[#081426] hover:bg-[#162C50] text-[#94A3B8] hover:text-white border border-[#162C50] px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                        >
                          🧹 Purger le Cache
                        </button>
                      )}
                    </div>
                  </div>

                  {/* IMPORTATION DES LOGOS DEPUIS LA MACHINE (SUPER-ADMIN) */}
                  {isSuperAdmin && (
                    <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <FolderOpen size={18} className="text-[#00D68F]" /> Importer vos Logos depuis votre Ordinateur
                          </h3>
                          <p className="text-xs text-[#94A3B8]">
                            Cliquez sur le bouton pour ouvrir l'Explorateur Windows et sélectionner le logo sur votre PC.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {partners.map((p) => {
                          const theme = getPartnerTheme(p.id);
                          return (
                            <div key={p.id} className="bg-[#081426] border border-[#162C50] p-4 rounded-xl space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-white text-sm">{p.name}</span>
                                <div className="w-10 h-10 rounded-lg bg-[#0D1E38] border border-[#162C50] flex items-center justify-center p-1 overflow-hidden">
                                  {p.logoUrl ? (
                                    <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className={`font-black text-xs ${theme.code}`}>{p.name.substring(0, 2).toUpperCase()}</span>
                                  )}
                                </div>
                              </div>

                              {/* BOUTON QUI OUVRE L'ACCÈS À LA MACHINE */}
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
                                <div>
                                  <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Lien d'affiliation officiel :</label>
                                  <input
                                    type="text"
                                    defaultValue={p.url}
                                    id={`url-${p.id}`}
                                    className="w-full bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-1 text-xs text-white font-mono outline-none focus:border-[#0066FF]"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const newC = (document.getElementById(`code-${p.id}`) as HTMLInputElement).value;
                                    const newU = (document.getElementById(`url-${p.id}`) as HTMLInputElement).value;
                                    handleUpdatePartner(p.id, newC, newU);
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
                  )}

                  {/* GESTION DES DÉLÉGUÉS */}
                  {isSuperAdmin && (
                    <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-5">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <UserPlus size={18} className="text-[#00D68F]" /> Gestion des Administrateurs Délégués
                          </h3>
                          <p className="text-xs text-[#94A3B8]">
                            Ajoutez des collaborateurs pour vous aider à gérer la plateforme.
                          </p>
                        </div>
                        <span className="text-xs text-[#94A3B8] font-mono">{adminTeam.length} administrateur(s)</span>
                      </div>

                      <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#081426] p-4 rounded-xl border border-[#162C50]">
                        <input
                          type="text"
                          required
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="Nom de l'administrateur"
                          className="bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-2 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                        />
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="Email Google de la personne"
                          className="bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-2 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#0066FF]"
                        />
                        <button
                          type="submit"
                          className="bg-[#00D68F] hover:bg-[#00b377] text-black font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={14} /> Donner les Accès Admin
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
                                <td className="py-3 font-bold text-white">
                                  {member.role === 'SUPER_ADMIN' ? '👑' : '🛡️'} {member.name}
                                </td>
                                <td className="py-3 font-mono text-[#94A3B8]">{member.email}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    member.role === 'SUPER_ADMIN' ? 'bg-amber-400/20 text-amber-400' : 'bg-[#0066FF]/20 text-[#0066FF]'
                                  }`}>
                                    {member.role === 'SUPER_ADMIN' ? 'Super-Admin' : 'Admin Délégué'}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  {member.role === 'SUPER_ADMIN' ? (
                                    <span className="text-[10px] text-[#94A3B8] italic">Maître</span>
                                  ) : (
                                    <button
                                      onClick={() => handleRemoveAdmin(member.id, member.name)}
                                      className="text-rose-400 hover:text-rose-300 p-1"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
                    onClick={() => setCurrentPage('partners')}
                    className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-amber-400/30 transition-all"
                  >
                    <Gift size={14} className="text-amber-400" /> Cotes & Bonus
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
                    Rencontres : {selectedLeagueFilter === 'ALL' ? 'Tous les Championnats' : selectedLeagueFilter}
                  </h2>
                  <span className="text-xs text-[#00D68F] font-bold">{filteredMatches.length} match(s) disponible(s)</span>
                </div>

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
              </div>
            </div>
          )}

          {/* PAGE D'ANALYSE AVEC TABLEAU DE COTES FLASHSCORE AUX VRAIES COULEURS DE MARQUE */}
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

              {/* TABLEAU COMPARATIF DE COTES & BOOKMAKERS FLASHSCORE AUX COULEURS DES MARQUES */}
              <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#00D68F]" /> Cotes Officielles & Meilleurs Bonus (Style Flashscore)
                  </h3>
                  <span className="text-[11px] text-[#94A3B8]">Cotes 1X2 réelles</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#162C50] text-[#94A3B8] font-bold uppercase text-[10px]">
                        <th className="pb-3">Bookmaker Partenaire</th>
                        <th className="pb-3 text-center">1 (Dom)</th>
                        <th className="pb-3 text-center">X (Nul)</th>
                        <th className="pb-3 text-center">2 (Ext)</th>
                        <th className="pb-3">Code Promo Officiel</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#162C50]">
                      {partners.map((p) => {
                        const theme = getPartnerTheme(p.id);
                        return (
                          <tr key={p.id} className="hover:bg-[#081426]/60 transition-colors">
                            <td className="py-3.5 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#081426] border border-[#162C50] flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-md">
                                {p.logoUrl ? (
                                  <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className={`font-black text-xs ${theme.code}`}>{p.name.substring(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-white text-xs block">{p.name}</span>
                                <span className={`text-[10px] font-mono ${theme.code}`}>{p.badge}</span>
                              </div>
                            </td>

                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] hover:bg-[#0066FF] hover:text-white transition-colors border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-white text-xs cursor-pointer">
                                {p.odds1}
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] hover:bg-[#0066FF] hover:text-white transition-colors border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#94A3B8] text-xs cursor-pointer">
                                {p.oddsX}
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="bg-[#081426] hover:bg-[#0066FF] hover:text-white transition-colors border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#00D68F] text-xs cursor-pointer">
                                {p.odds2}
                              </span>
                            </td>

                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono bg-[#162C50] px-2.5 py-1 rounded-lg font-black text-xs ${theme.code}`}>
                                  {p.promoCode}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(p.id, p.promoCode)}
                                  className="text-[#94A3B8] hover:text-white text-[10px] flex items-center gap-1"
                                  title="Copier le code"
                                >
                                  {copiedCodeId === p.id ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </td>

                            {/* Bouton Parier aux couleurs officielles (Jaune Melbet, Vert Betwinner, Orange Goldparis, Rouge Betclic) */}
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
                  <h3 className="text-base font-bold text-white">{user ? user.displayName : 'Christian Diabagate'}</h3>
                  <p className="text-xs text-[#94A3B8]">{user ? user.email : 'Super-Administrateur de la plateforme'}</p>
                  <span className={`mt-2 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded ${
                    isSuperAdmin ? 'bg-amber-400/20 text-amber-400' : isSecondaryAdmin ? 'bg-[#0066FF]/20 text-[#0066FF]' : user ? 'bg-[#00D68F]/20 text-[#00D68F]' : 'bg-[#162C50] text-[#94A3B8]'
                  }`}>
                    {isSuperAdmin ? '👑 Propriétaire Maître' : isSecondaryAdmin ? '🛡️ Administrateur' : user ? '✓ Membre Connecté' : 'Mode Démo'}
                  </span>
                </div>
              </div>

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