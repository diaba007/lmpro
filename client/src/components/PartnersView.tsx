import React from 'react';
import { Gift, Copy, Check, ExternalLink, Flame, ShieldCheck } from 'lucide-react';

export interface PartnerBookmaker {
  id: string;
  name: string;
  logoUrl: string;
  bonus: string;
  promoCode: string;
  url: string;
  badge: string;
  paymentMethods: string;
}

export const INITIAL_PARTNERS: PartnerBookmaker[] = [
  {
    id: 'melbet',
    name: 'Melbet',
    logoUrl: '',
    bonus: '+200% jusqu\'à 130 000 FCFA sur 1er dépôt',
    promoCode: 'XPRO225',
    url: 'https://melbet.com',
    badge: 'TOP BONUS AFRIQUE',
    paymentMethods: 'Wave, Orange Money, MTN MoMo, Moov, Carte'
  },
  {
    id: 'betwinner',
    name: 'Betwinner',
    logoUrl: '',
    bonus: '+100% de bonus exclusif de bienvenue',
    promoCode: 'DKC10',
    url: 'https://betwinner.com',
    badge: 'RECOMMANDÉ',
    paymentMethods: 'Wave, Orange Money, MTN, Moov, Crypto'
  },
  {
    id: 'goldparis',
    name: 'Goldparis',
    logoUrl: '',
    bonus: 'Paris Gratuits & Bonus VIP hebdomadaire',
    promoCode: 'LMPRO',
    url: 'https://goldparis.com',
    badge: 'EXCLUSIF CI',
    paymentMethods: 'Orange Money, MTN, Wave, Espèces'
  },
  {
    id: 'betclic',
    name: 'Betclic',
    logoUrl: '',
    bonus: '1er pari remboursé jusqu\'à 100€ / équivalent',
    promoCode: 'XPRONO',
    url: 'https://betclic.com',
    badge: 'INTERNATIONAL',
    paymentMethods: 'Carte Bancaire, Virement, Portefeuilles'
  }
];

// THÈMES OFFICIELS PAR MARQUE
export const getPartnerTheme = (id: string) => {
  switch (id.toLowerCase()) {
    case 'melbet':
      return {
        button: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black hover:opacity-95 shadow-lg shadow-amber-500/30 font-black',
        badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
        code: 'text-amber-400',
        border: 'border-amber-500/40 hover:border-amber-400',
        parierBtn: 'bg-amber-400 hover:bg-yellow-400 text-black font-black'
      };
    case 'betwinner':
      return {
        button: 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white hover:opacity-95 shadow-lg shadow-emerald-600/30 font-black',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        code: 'text-emerald-400',
        border: 'border-emerald-500/40 hover:border-emerald-400',
        parierBtn: 'bg-emerald-600 hover:bg-green-600 text-white font-black'
      };
    case 'goldparis':
      return {
        button: 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 text-white hover:opacity-95 shadow-lg shadow-orange-500/30 font-black',
        badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
        code: 'text-orange-400',
        border: 'border-orange-500/40 hover:border-orange-400',
        parierBtn: 'bg-orange-500 hover:bg-orange-400 text-white font-black'
      };
    case 'betclic':
      return {
        button: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:opacity-95 shadow-lg shadow-red-600/30 font-black',
        badge: 'bg-red-500/20 text-red-300 border border-red-500/40',
        code: 'text-red-400',
        border: 'border-red-500/40 hover:border-red-400',
        parierBtn: 'bg-red-600 hover:bg-rose-600 text-white font-black'
      };
    default:
      return {
        button: 'bg-[#0066FF] text-white font-black',
        badge: 'bg-[#0066FF]/20 text-[#0066FF]',
        code: 'text-[#0066FF]',
        border: 'border-[#162C50]',
        parierBtn: 'bg-[#00D68F] text-black font-black'
      };
  }
};

interface PartnersViewProps {
  partners: PartnerBookmaker[];
  onCopyCode: (id: string, code: string) => void;
  copiedCodeId: string | null;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ partners, onCopyCode, copiedCodeId }) => {
  return (
    <div className="space-y-6">
      {/* En-tête de la page Bonus & Partenaires */}
      <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Gift className="text-amber-400" /> Partenaires Officiels & Bonus Vérifiés
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Inscrivez-vous avec nos codes promos exclusifs pour doubler vos premiers dépôts.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
          <Flame size={14} className="text-amber-400" /> Bonus Actifs 2026
        </div>
      </div>

      {/* Grille des 4 Partenaires (Sans cotes flottantes : fokus sur les bonus et les codes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {partners.map((partner) => {
          const theme = getPartnerTheme(partner.id);
          return (
            <div 
              key={partner.id}
              className={`bg-[#0D1E38] border ${theme.border} rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-5`}
            >
              <div>
                {/* En-tête : Logo Rectangulaire et Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-32 rounded-xl bg-[#081426] border border-[#162C50] flex items-center justify-center px-2 py-1 overflow-hidden shadow-inner shrink-0">
                      {partner.logoUrl ? (
                        <img 
                          src={partner.logoUrl} 
                          alt={partner.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className={`font-black text-xs tracking-wider ${theme.code}`}>
                          {partner.name.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">{partner.name}</h2>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${theme.badge}`}>
                        {partner.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offre de bienvenue claire */}
                <div className="mt-4 p-3 bg-[#081426] rounded-xl border border-[#162C50]">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Bonus de bienvenue garanti :</span>
                  <p className="text-xs font-bold text-white mt-0.5 leading-relaxed">
                    {partner.bonus}
                  </p>
                </div>

                {/* Moyens de paiements acceptés */}
                <div className="mt-2 text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#00D68F] shrink-0" />
                  <span>Dépôts/Retraits : <strong className="text-slate-300">{partner.paymentMethods || 'Wave, Orange, MTN'}</strong></span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {/* Code Promo avec bouton Copier */}
                <div className="bg-[#081426] border border-[#162C50] p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Code Promo Officiel :</span>
                    <span className={`text-base font-black font-mono tracking-wider ${theme.code}`}>
                      {partner.promoCode}
                    </span>
                  </div>
                  <button
                    onClick={() => onCopyCode(partner.id, partner.promoCode)}
                    className="flex items-center gap-1.5 bg-[#162C50] hover:bg-[#0066FF] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    {copiedCodeId === partner.id ? (
                      <>
                        <Check size={14} className="text-[#00D68F]" />
                        <span className="text-[#00D68F]">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bouton d'inscription direct aux couleurs de la marque */}
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${theme.button}`}
                >
                  <span>Créer mon compte sur {partner.name} avec Bonus</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};