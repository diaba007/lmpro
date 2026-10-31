import React, { useState } from 'react';
import { 
  Crown, 
  Lock, 
  Key, 
  FolderOpen, 
  Upload, 
  PlusCircle, 
  Trash2, 
  UserPlus,
  Settings,
  ShieldAlert,
  CheckCircle,
  Archive
} from 'lucide-react';
import { getPartnerTheme } from './PartnersView';

interface AdminConsoleViewProps {
  isAdminAuthenticated: boolean;
  isSuperAdmin: boolean;
  adminNotification: string | null;
  onAdminLogin: (username: string, pass: string) => void;
  onAdminLock: () => void;
  adminAuthError: string | null;
  partners: any[];
  onUploadLogo: (partnerId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdatePartner: (id: string, code: string, url: string) => void;
  manualMatches: any[];
  onAddManualMatch: (matchData: any) => void;
  onDeleteManualMatch: (id: number) => void;
  adminTeam: any[];
  onAddAdmin: (name: string, email: string) => void;
  onRemoveAdmin: (id: string, name: string) => void;
  onChangeMasterPassword: (newPass: string) => void;
  onSyncApi: () => void;
  onPurgeCache: () => void;
  // NOUVEAU : ARCHIVAGE D'UN MATCH TERMINÉ AVEC SCORE
  availableMatches: any[];
  onArchiveMatch: (record: any) => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = (props) => {
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [newMasterPass, setNewMasterPass] = useState('');

  // Formulaire ajout de match manuel
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [comp, setComp] = useState('Serie A');
  const [prob1, setProb1] = useState(55);
  const [probX, setProbX] = useState(25);
  const [prob2, setProb2] = useState(20);
  const [xGHome, setXGHome] = useState(1.90);
  const [xGAway, setXGAway] = useState(0.95);
  const [comment, setComment] = useState('');

  // Formulaire ajout admin délégué
  const [delName, setDelName] = useState('');
  const [delEmail, setDelEmail] = useState('');

  // Gestion des modifications de codes promo et liens
  const [partnerCodes, setPartnerCodes] = useState<Record<string, string>>({});
  const [partnerUrls, setPartnerUrls] = useState<Record<string, string>>({});

  // NOUVEAU : FORMULAIRE D'ARCHIVAGE AVEC SCORE FINAL
  const [archiveMatchTitle, setArchiveMatchTitle] = useState('');
  const [archiveComp, setArchiveComp] = useState('Serie A');
  const [archiveSelection, setArchiveSelection] = useState('Plus de 1.5 but');
  const [archiveOdds, setArchiveOdds] = useState('1.75');
  const [archiveHomeScore, setArchiveHomeScore] = useState(2);
  const [archiveAwayScore, setArchiveAwayScore] = useState(0);

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    props.onAdminLogin(adminUser, adminPass);
  };

  const submitManualMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!home.trim() || !away.trim()) return;
    props.onAddManualMatch({
      home,
      away,
      comp,
      prob1,
      probX,
      prob2,
      xGHome,
      xGAway,
      comment
    });
    setHome('');
    setAway('');
    setComment('');
  };

  const submitAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delName.trim() || !delEmail.trim()) return;
    props.onAddAdmin(delName.trim(), delEmail.trim());
    setDelName('');
    setDelEmail('');
  };

  // SOUMISSION DE L'ARCHIVAGE AVEC ARBITRAGE AUTOMATIQUE DU STATUT (GAGNÉ / PERDU)
  const submitArchiveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveMatchTitle.trim()) {
      alert("Veuillez renseigner l'affiche du match.");
      return;
    }

    const hScore = Number(archiveHomeScore);
    const aScore = Number(archiveAwayScore);
    const totalGoals = hScore + aScore;

    // Arbitrage mathématique automatique du pronostic
    let status: 'WON' | 'LOST' = 'LOST';

    if (archiveSelection.includes('Plus de 1.5') && totalGoals > 1.5) status = 'WON';
    else if (archiveSelection.includes('Plus de 2.5') && totalGoals > 2.5) status = 'WON';
    else if (archiveSelection.includes('Moins de 2.5') && totalGoals < 2.5) status = 'WON';
    else if (archiveSelection.includes('Moins de 3.5') && totalGoals < 3.5) status = 'WON';
    else if (archiveSelection.includes('BTTS') && hScore > 0 && aScore > 0) status = 'WON';
    else if (archiveSelection.includes('Victoire') && archiveSelection.includes('1') && hScore > aScore) status = 'WON';
    else if (archiveSelection.includes('Victoire') && archiveSelection.includes('2') && aScore > hScore) status = 'WON';
    else if (archiveSelection.includes('Nul') && hScore === aScore) status = 'WON';
    else if (archiveSelection.includes('1X') && hScore >= aScore) status = 'WON';
    else if (archiveSelection.includes('X2') && aScore >= hScore) status = 'WON';

    props.onArchiveMatch({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      match: archiveMatchTitle.trim(),
      competition: archiveComp,
      selection: archiveSelection,
      predictedOdds: archiveOdds || '1.70',
      finalScore: `${hScore} - ${aScore}`,
      status
    });

    setArchiveMatchTitle('');
  };

  if (!props.isAdminAuthenticated) {
    return (
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-8 sm:p-10 max-w-md mx-auto my-12 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#081426] border-2 border-amber-400/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-black text-white">Portail Super-Administrateur</h2>
          <p className="text-xs text-[#94A3B8]">Espace confidentiel réservé à Christian Diabagate.</p>
        </div>

        {props.adminAuthError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{props.adminAuthError}</span>
          </div>
        )}

        <form onSubmit={submitLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Identifiant Admin :</label>
            <input
              type="text"
              required
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              placeholder="christian ou admin"
              className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Mot de passe Maître :</label>
            <input
              type="password"
              required
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="LMPRO2026 ou 2026"
              className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer hover:opacity-95 transition-all"
          >
            Déverrouiller la Console
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setAdminUser('christian'); setAdminPass('LMPRO2026'); }}
          className="text-[11px] text-[#94A3B8] hover:text-amber-400 underline block mx-auto text-center cursor-pointer"
        >
          Pré-remplir les identifiants par défaut (christian / LMPRO2026)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {props.adminNotification && (
        <div className="p-4 rounded-xl bg-[#00D68F]/20 border border-[#00D68F] text-white text-xs font-bold flex items-center justify-between">
          <span>✓ {props.adminNotification}</span>
        </div>
      )}

      {/* Header Console */}
      <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown className="text-amber-400" /> Console d'Administration Maître
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Super-Admin Propriétaire : Christian Diabagate</p>
        </div>
        <div className="flex gap-2">
          <button onClick={props.onSyncApi} className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all">
            🔄 Synchroniser API
          </button>
          <button onClick={props.onPurgeCache} className="bg-[#081426] border border-[#162C50] hover:bg-[#162C50] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all">
            🧹 Purger Cache
          </button>
          <button onClick={props.onAdminLock} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-500 hover:text-white transition-all">
            <Lock size={14} className="inline mr-1" /> Verrouiller
          </button>
        </div>
      </div>

      {/* NOUVEAU MODULE : CLÔTURER & ARCHIVER UN MATCH DANS L'HISTORIQUE CERTIFIÉ */}
      <div className="bg-[#0D1E38] border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Archive size={20} className="text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-white">Clôturer & Archiver un Match Terminé dans l'Historique</h2>
            <p className="text-xs text-[#94A3B8]">
              Entrez le score final d'une rencontre terminée. L'application arbitrera automatiquement le pronostic (Validé / Échoué).
            </p>
          </div>
        </div>

        <form onSubmit={submitArchiveMatch} className="space-y-4 pt-2">
          {/* Sélection rapide parmi les matchs existants */}
          {props.availableMatches.length > 0 && (
            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Sélection rapide parmi les matchs d'aujourd'hui :</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const found = props.availableMatches.find(m => m.id.toString() === e.target.value);
                    if (found) {
                      setArchiveMatchTitle(`${found.homeTeam.name} vs ${found.awayTeam.name}`);
                      setArchiveComp(found.competition?.name || 'Football');
                    }
                  }
                }}
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="">-- Choisir un match de la liste --</option>
                {props.availableMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam.name} vs {m.awayTeam.name} ({m.competition?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Affiche de la rencontre :</label>
              <input
                type="text"
                required
                value={archiveMatchTitle}
                onChange={(e) => setArchiveMatchTitle(e.target.value)}
                placeholder="Ex: AC Milan vs Bologna FC"
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Compétition :</label>
              <input
                type="text"
                value={archiveComp}
                onChange={(e) => setArchiveComp(e.target.value)}
                placeholder="Ex: Serie A"
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Sélection / Pronostic évalué :</label>
              <select
                value={archiveSelection}
                onChange={(e) => setArchiveSelection(e.target.value)}
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="Plus de 1.5 but">Plus de 1.5 but</option>
                <option value="Plus de 2.5 buts">Plus de 2.5 buts</option>
                <option value="Moins de 2.5 buts">Moins de 2.5 buts</option>
                <option value="BTTS - Les deux marquent">BTTS - Les deux marquent</option>
                <option value="Victoire Domicile (1)">Victoire Domicile (1)</option>
                <option value="Victoire Extérieur (2)">Victoire Extérieur (2)</option>
                <option value="Double Chance 1X">Double Chance 1X</option>
                <option value="Match Nul (X)">Match Nul (X)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#162C50]">
            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Score Équipe Domicile :</label>
              <input
                type="number"
                min="0"
                value={archiveHomeScore}
                onChange={(e) => setArchiveHomeScore(Number(e.target.value))}
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Score Équipe Extérieur :</label>
              <input
                type="number"
                min="0"
                value={archiveAwayScore}
                onChange={(e) => setArchiveAwayScore(Number(e.target.value))}
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Cote officielle du pronostic :</label>
              <input
                type="text"
                value={archiveOdds}
                onChange={(e) => setArchiveOdds(e.target.value)}
                placeholder="Ex: 1.75"
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:opacity-95 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle size={15} />
            <span>Valider le Score & Archiver dans l'Historique Certifié</span>
          </button>
        </form>
      </div>

      {/* 1. GESTION DES CODES PROMO & LIENS BOOKMAKERS */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings size={18} className="text-amber-400" /> Modification des Codes Promo & Liens Bookmakers
        </h3>
        <p className="text-xs text-[#94A3B8]">
          Changez vos codes d'affiliation et vos liens de parrainage pour chaque bookmaker.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {props.partners.map((p) => {
            const currentCode = partnerCodes[p.id] !== undefined ? partnerCodes[p.id] : p.promoCode;
            const currentUrl = partnerUrls[p.id] !== undefined ? partnerUrls[p.id] : p.url;

            return (
              <div key={p.id} className="bg-[#081426] border border-[#162C50] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{p.name}</span>
                  <span className="text-[10px] bg-[#162C50] text-[#00D68F] font-mono px-2 py-0.5 rounded font-bold">Actif</span>
                </div>

                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Code Promo :</label>
                  <input
                    type="text"
                    value={currentCode}
                    onChange={(e) => setPartnerCodes({ ...partnerCodes, [p.id]: e.target.value })}
                    className="w-full bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-1.5 text-xs text-[#00D68F] font-mono font-bold outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Lien d'Affiliation :</label>
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => setPartnerUrls({ ...partnerUrls, [p.id]: e.target.value })}
                    className="w-full bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#0066FF]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => props.onUpdatePartner(p.id, currentCode, currentUrl)}
                  className="w-full py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-[#0066FF]/20"
                >
                  Enregistrer {p.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. GESTION DES COLLABORATEURS (DÉLÉGUÉS) */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus size={18} className="text-[#00D68F]" /> Gestion des Collaborateurs & Délégués
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Donnez accès à d'autres administrateurs sans leur partager votre mot de passe maître.
            </p>
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">{props.adminTeam.length} délégué(s)</span>
        </div>

        <form onSubmit={submitAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#081426] p-4 rounded-xl border border-[#162C50]">
          <input
            type="text"
            required
            value={delName}
            onChange={(e) => setDelName(e.target.value)}
            placeholder="Nom du collaborateur"
            className="bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#0066FF]"
          />
          <input
            type="email"
            required
            value={delEmail}
            onChange={(e) => setDelEmail(e.target.value)}
            placeholder="Email du collaborateur"
            className="bg-[#0D1E38] border border-[#162C50] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#0066FF]"
          />
          <button
            type="submit"
            className="bg-[#00D68F] hover:bg-[#00b377] text-black font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <UserPlus size={14} /> Ajouter Collaborateur
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
              <tr className="hover:bg-[#081426]/50">
                <td className="py-3 font-bold text-white flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-400" /> Christian Diabagate
                </td>
                <td className="py-3 font-mono text-[#94A3B8]">Propriétaire Maître</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400">SUPER_ADMIN</span></td>
                <td className="py-3 text-right italic text-[11px] text-[#94A3B8]">Inamovible</td>
              </tr>
              {props.adminTeam.map((m) => (
                <tr key={m.id} className="hover:bg-[#081426]/50">
                  <td className="py-3 font-bold text-white">{m.name}</td>
                  <td className="py-3 font-mono text-[#94A3B8]">{m.email}</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0066FF]/20 text-[#0066FF]">Délégué</span></td>
                  <td className="py-3 text-right">
                    <button onClick={() => props.onRemoveAdmin(m.id, m.name)} className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer" title="Révoquer">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PUBLIER UN MATCH MANUEL QUAND L'API EST VIDE */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <PlusCircle size={18} className="text-[#00D68F]" /> Publier un Match avec votre Analyse Personnalisée
        </h2>

        <form onSubmit={submitManualMatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Équipe Domicile :</label>
              <input
                type="text"
                required
                value={home}
                onChange={(e) => setHome(e.target.value)}
                placeholder="Ex: Real Madrid"
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Équipe Extérieur :</label>
              <input
                type="text"
                required
                value={away}
                onChange={(e) => setAway(e.target.value)}
                placeholder="Ex: Barcelone"
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Championnat :</label>
              <select
                value={comp}
                onChange={(e) => setComp(e.target.value)}
                className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Serie A">Serie A</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Ligue 1">Ligue 1</option>
                <option value="Champions League">Champions League</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 border-t border-[#162C50]">
            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">Probabilité 1 (%) :</label>
              <input type="number" value={prob1} onChange={(e) => setProb1(Number(e.target.value))} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-[#0066FF] font-bold font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">Probabilité Nul (%) :</label>
              <input type="number" value={probX} onChange={(e) => setProbX(Number(e.target.value))} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-slate-300 font-bold font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">Probabilité 2 (%) :</label>
              <input type="number" value={prob2} onChange={(e) => setProb2(Number(e.target.value))} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-[#00D68F] font-bold font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">xG Domicile :</label>
              <input type="number" step="0.05" value={xGHome} onChange={(e) => setXGHome(Number(e.target.value))} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-[#94A3B8] font-bold block mb-1">xG Extérieur :</label>
              <input type="number" step="0.05" value={xGAway} onChange={(e) => setXGAway(Number(e.target.value))} className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white font-mono" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#94A3B8] font-bold block mb-1">Conseil / Analyse :</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Domination attendue, option 1X très solide"
              className="w-full bg-[#081426] border border-[#162C50] rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-[#00D68F] hover:bg-[#00b377] text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all">
            Publier ce Match
          </button>
        </form>

        {props.manualMatches.length > 0 && (
          <div className="pt-3 border-t border-[#162C50] space-y-2">
            <span className="text-xs font-bold text-[#94A3B8] block">Vos Matchs Publiés ({props.manualMatches.length}) :</span>
            {props.manualMatches.map((m) => (
              <div key={m.id} className="p-3 bg-[#081426] rounded-xl border border-[#162C50] flex items-center justify-between text-xs">
                <span><strong>{m.homeTeam.name} vs {m.awayTeam.name}</strong> ({m.competition.name})</span>
                <button onClick={() => props.onDeleteManualMatch(m.id)} className="text-rose-400 p-1 cursor-pointer"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. IMPORTATION DES LOGOS DEPUIS LA MACHINE */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FolderOpen size={18} className="text-[#00D68F]" /> Importer vos Logos depuis votre Ordinateur
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {props.partners.map((p) => {
            const theme = getPartnerTheme(p.id);
            return (
              <div key={p.id} className="bg-[#081426] border border-[#162C50] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{p.name}</span>
                  <div className="h-10 w-28 rounded-lg bg-[#0D1E38] border border-[#162C50] flex items-center justify-center px-2 py-1 overflow-hidden">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className={`font-black text-xs ${theme.code}`}>{p.name.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <label className="w-full py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <Upload size={14} />
                  <span>Choisir le logo sur mon PC</span>
                  <input type="file" accept="image/*" onChange={(e) => props.onUploadLogo(p.id, e)} className="hidden" />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MODIFIER LE MOT DE PASSE SECRET */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key size={18} className="text-amber-400" /> Modifier votre Mot de Passe Administrateur Secret
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); if (newMasterPass) { props.onChangeMasterPassword(newMasterPass); setNewMasterPass(''); } }} className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            placeholder="Nouveau mot de passe maître"
            value={newMasterPass}
            onChange={(e) => setNewMasterPass(e.target.value)}
            className="flex-1 bg-[#081426] border border-[#162C50] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
          />
          <button type="submit" className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};