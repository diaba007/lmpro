import React, { useState } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  FolderOpen, 
  Upload, 
  PlusCircle, 
  Trash2, 
  UserPlus 
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
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg"
          >
            Déverrouiller la Console
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setAdminUser('christian'); setAdminPass('LMPRO2026'); }}
          className="text-[11px] text-[#94A3B8] hover:text-amber-400 underline block mx-auto text-center"
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
          <p className="text-xs text-[#94A3B8] mt-1">Super-Admin : Christian Diabagate</p>
        </div>
        <div className="flex gap-2">
          <button onClick={props.onSyncApi} className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-2 rounded-xl text-xs font-bold">
            🔄 Synchroniser API
          </button>
          <button onClick={props.onPurgeCache} className="bg-[#081426] border border-[#162C50] hover:bg-[#162C50] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-bold">
            🧹 Purger Cache
          </button>
          <button onClick={props.onAdminLock} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-4 py-2 rounded-xl text-xs font-bold">
            <Lock size={14} className="inline mr-1" /> Verrouiller
          </button>
        </div>
      </div>

      {/* Formulaire Match Manuel */}
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

          <button type="submit" className="w-full py-3 bg-[#00D68F] hover:bg-[#00b377] text-black font-black text-xs rounded-xl shadow-lg">
            Publier ce Match
          </button>
        </form>

        {props.manualMatches.length > 0 && (
          <div className="pt-3 border-t border-[#162C50] space-y-2">
            <span className="text-xs font-bold text-[#94A3B8] block">Vos Matchs Publiés ({props.manualMatches.length}) :</span>
            {props.manualMatches.map((m) => (
              <div key={m.id} className="p-3 bg-[#081426] rounded-xl border border-[#162C50] flex items-center justify-between text-xs">
                <span><strong>{m.homeTeam.name} vs {m.awayTeam.name}</strong> ({m.competition.name})</span>
                <button onClick={() => props.onDeleteManualMatch(m.id)} className="text-rose-400 p-1"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Logos Bookmakers */}
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
    </div>
  );
};