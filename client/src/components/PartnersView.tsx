import React from 'react';
import { Gift, Copy, Check, ExternalLink, Flame } from 'lucide-react';

export interface PartnerBookmaker {
  id: string;
  name: string;
  logoUrl: string;
  bonus: string;
  promoCode: string;
  url: string;
  odds1: string;
  oddsX: string;
  odds2: string;
  badge: string;
}

export const INITIAL_PARTNERS: PartnerBookmaker[] = [
  {
    id: 'melbet',
    name: 'Melbet',
    logoUrl: '',
    bonus: '+200% jusqu\'à 130 000 FCFA sur 1er dépôt',
    promoCode: 'XPRO225',
    url: 'https://melbet.com',
    odds1: '2.05',
    oddsX: '3.45',
    odds2: '3.80',
    badge: 'TOP BONUS AFRIQUE'
  },
  {
    id: 'betwinner',
    name: 'Betwinner',
    logoUrl: '',
    bonus: '+100% de bonus exclusif de bienvenue',
    promoCode: 'DKC10',
    url: 'https://betwinner.com',
    odds1: '2.08',
    oddsX: '3.40',
    odds2: '3.75',
    badge: 'RECOMMANDÉ'
  },
  {
    id: 'goldparis',
    name: 'Goldparis',
    logoUrl: '',
    bonus: 'Paris Gratuits & Bonus VIP hebdomadaire',
    promoCode: 'LMPRO',
    url: 'https://goldparis.com',
    odds1: '2.02',
    oddsX: '3.50',
    odds2: '3.90',
    badge: 'EXCLUSIF CI'
  },
  {
    id: 'betclic',
    name: 'Betclic',
    logoUrl: '',
    bonus: '1er pari remboursé jusqu\'à 100€ / équivalent',
    promoCode: 'XPRONO',
    url: 'https://betclic.com',
    odds1: '2.00',
    oddsX: '3.35',
    odds2: '3.70',
    badge: 'INTERNATIONAL'
  }
];

// FONCTION QUI ATTRIBUE DIRECTEMENT LES VRAIES COULEURS OFFICIELLES
export const getPartnerTheme = (id: string) => {
  switch (id.toLowerCase()) {
    case 'melbet':
      return {
        button: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black hover:opacity-95 shadow-lg shadow-amber-500/30',
        badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
        code: 'text-amber-400',
        border: 'border-amber-500/40 hover:border-amber-400',
        parierBtn: 'bg-amber-400 hover:bg-yellow-400 text-black'
      };
    case 'betwinner':
      return {
        button: 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white hover:opacity-95 shadow-lg shadow-emerald-600/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        code: 'text-emerald-400',
        border: 'border-emerald-500/40 hover:border-emerald-400',
        parierBtn: 'bg-emerald-600 hover:bg-green-600 text-white'
      };
    case 'goldparis':
      return {
        button: 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 text-white hover:opacity-95 shadow-lg shadow-orange-500/30',
        badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
        code: 'text-orange-400',
        border: 'border-orange-500/40 hover:border-orange-400',
        parierBtn: 'bg-orange-500 hover:bg-orange-400 text-white'
      };
    case 'betclic':
      return {
        button: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:opacity-95 shadow-lg shadow-red-600/30',
        badge: 'bg-red-500/20 text-red-300 border border-red-500/40',
        code: 'text-red-400',
        border: 'border-red-500/40 hover:border-red-400',
        parierBtn: 'bg-red-600 hover:bg-rose-600 text-white'
      };
    default:
      return {
        button: 'bg-[#0066FF] text-white',
        badge: 'bg-[#0066FF]/20 text-[#0066FF]',
        code: 'text-[#0066FF]',
        border: 'border-[#162C50]',
        parierBtn: 'bg-[#00D68F] text-black'
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
      <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Gift className="text-amber-400" /> Partenaires Officiels & Bonus Vérifiés
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Utilisez nos codes promos exclusifs pour doubler vos dépôts sur Melbet, Betwinner, Goldparis et Betclic.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
          <Flame size={14} className="text-amber-400" /> Bonus Actifs 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {partners.map((partner) => {
          const theme = getPartnerTheme(partner.id);
          return (
            <div 
              key={partner.id}
              className={`bg-[#0D1E38] border ${theme.border} rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-5`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#081426] border border-[#162C50] flex items-center justify-center p-1.5 overflow-hidden shadow-md">
                      {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className={`font-black text-sm ${theme.code}`}>
                          {partner.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                        {partner.badge}
                      </span>
                      <h2 className="text-xl font-black text-white mt-1">{partner.name}</h2>
                    </div>
                  </div>

                  {/* Cotes Flashscore */}
                  <div className="flex items-center gap-1.5 bg-[#081426] p-1.5 rounded-xl border border-[#162C50] text-[11px] font-mono">
                    <span className="px-2 py-1 bg-[#162C50] rounded text-white font-bold">{partner.odds1}</span>
                    <span className="px-2 py-1 bg-[#162C50] rounded text-[#94A3B8] font-bold">{partner.oddsX}</span>
                    <span className="px-2 py-1 bg-[#162C50] rounded text-[#00D68F] font-bold">{partner.odds2}</span>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] mt-4 font-medium leading-relaxed">
                  Offre de bienvenue : <strong className="text-white">{partner.bonus}</strong>
                </p>
              </div>

              <div className="space-y-3 pt-2">
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

                {/* BOUTON OFFICIEL AUX COULEURS DE LA MARQUE */}
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${theme.button}`}
                >
                  <span>Parier sur {partner.name} avec Bonus</span>
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