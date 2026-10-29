import React from 'react';
import { Gift, Copy, Check, ExternalLink, Flame } from 'lucide-react';

export interface PartnerBookmaker {
  id: string;
  name: string;
  logoUrl: string;
  bonusTitle: string;
  bonusHighlight: string;
  bonusSub: string;
  promoCode: string;
  url: string;
  badge: string;
  cardBg: string;
  buttonTextColor: string;
}

export const INITIAL_PARTNERS: PartnerBookmaker[] = [
  {
    id: 'betclic',
    name: 'Betclic',
    logoUrl: '',
    bonusTitle: 'Jusqu\'à',
    bonusHighlight: '5000 FCFA *',
    bonusSub: 'remboursés en freebets',
    promoCode: 'XPRONO',
    url: 'https://betclic.com',
    badge: 'OFFICIEL',
    cardBg: 'bg-[#E21B23]', // Rouge vif Betclic officiel
    buttonTextColor: 'text-[#E21B23]'
  },
  {
    id: 'melbet',
    name: 'Melbet',
    logoUrl: '',
    bonusTitle: 'Bonus exceptionnel de',
    bonusHighlight: '200 %',
    bonusSub: 'jusqu\'à 130 000 FCFA sur 1er dépôt',
    promoCode: 'XPRO225',
    url: 'https://melbet.com',
    badge: 'TOP BONUS AFRIQUE',
    cardBg: 'bg-[#F3A000]', // Jaune-Oranger Melbet officiel
    buttonTextColor: 'text-[#1A1A1A]'
  },
  {
    id: 'betwinner',
    name: 'Betwinner',
    logoUrl: '',
    bonusTitle: 'Bonus exclusif de',
    bonusHighlight: '100 %',
    bonusSub: 'sur votre premier rechargement',
    promoCode: 'DKC10',
    url: 'https://betwinner.com',
    badge: 'RECOMMANDÉ',
    cardBg: 'bg-[#058253]', // Vert Betwinner officiel
    buttonTextColor: 'text-[#058253]'
  },
  {
    id: 'goldparis',
    name: 'Goldparis',
    logoUrl: '',
    bonusTitle: 'Bonus spécial',
    bonusHighlight: 'VIP & Freebets',
    bonusSub: 'offerts chaque semaine pour vos mises',
    promoCode: 'LMPRO',
    url: 'https://goldparis.com',
    badge: 'EXCLUSIF CI',
    cardBg: 'bg-[#FF6600]', // Orange Goldparis officiel
    buttonTextColor: 'text-[#FF6600]'
  }
];

export const getPartnerTheme = (id: string) => {
  switch (id.toLowerCase()) {
    case 'melbet':
      return {
        code: 'text-amber-400',
        parierBtn: 'bg-amber-400 hover:bg-yellow-400 text-black font-black'
      };
    case 'betwinner':
      return {
        code: 'text-emerald-400',
        parierBtn: 'bg-emerald-600 hover:bg-green-600 text-white font-black'
      };
    case 'goldparis':
      return {
        code: 'text-orange-400',
        parierBtn: 'bg-orange-500 hover:bg-orange-400 text-white font-black'
      };
    case 'betclic':
      return {
        code: 'text-red-400',
        parierBtn: 'bg-red-600 hover:bg-rose-600 text-white font-black'
      };
    default:
      return {
        code: 'text-[#00D68F]',
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
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Gift className="text-amber-400" /> Bonus Partenaires Officiels
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Profitez des offres de bienvenue exclusives négociées par LMPRO.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
          <Flame size={14} className="text-amber-400" /> Offres Vérifiées 2026
        </div>
      </div>

      {/* Grille des Cartes (DESIGN PLEIN IDENTIQUE À VOTRE CAPTURE !) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {partners.map((partner) => (
          <div 
            key={partner.id}
            className={`${partner.cardBg} rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:scale-[1.01]`}
            style={{ minHeight: '260px' }}
          >
            {/* Ligne 1 : Logo ou Nom de marque officiel en blanc */}
            <div className="flex items-center justify-between">
              {partner.logoUrl ? (
                <div className="h-10 w-28 sm:w-32 bg-black/20 rounded-xl px-2 py-1 flex items-center justify-center">
                  <img src={partner.logoUrl} alt={partner.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white">
                  {partner.name}
                </h2>
              )}

              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-black/25 text-white/90">
                {partner.badge}
              </span>
            </div>

            {/* Ligne 2 : Texte d'accroche avec le montant mis en valeur en JAUNE/OR */}
            <div className="my-5">
              <p className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                {partner.bonusTitle}{' '}
                <span className="text-yellow-300 underline decoration-2 underline-offset-4">
                  {partner.bonusHighlight}
                </span>{' '}
                {partner.bonusSub}
              </p>
            </div>

            {/* Ligne 3 : Code promo + Bouton blanc contrasté "Profitez du bonus" */}
            <div className="space-y-2.5">
              {/* Barre de Code Promo à copier */}
              <div className="bg-black/25 border border-white/20 rounded-xl px-3.5 py-2 flex items-center justify-between text-white">
                <div className="text-xs">
                  <span className="text-[10px] text-white/80 uppercase font-bold block">Code Promo :</span>
                  <span className="font-mono font-black text-sm tracking-wider text-yellow-300">
                    {partner.promoCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onCopyCode(partner.id, partner.promoCode)}
                  className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedCodeId === partner.id ? (
                    <>
                      <Check size={13} className="text-emerald-300" />
                      <span className="text-emerald-300">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>

              {/* Le bouton blanc emblématique comme sur la capture */}
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 sm:py-3.5 bg-white ${partner.buttonTextColor} font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-slate-100 transition-all cursor-pointer`}
              >
                <span>Profitez du bonus</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};