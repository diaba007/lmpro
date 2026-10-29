import React from 'react';
import { Gift, Copy, Check, ExternalLink, Flame } from 'lucide-react';

export interface PartnerBookmaker {
  id: string;
  name: string;
  logoUrl?: string;
  bonusTitle: string;
  bonusHighlight: string;
  bonusSub: string;
  promoCode: string;
  url: string;
  badge: string;
  bgColor: string;
  btnTextColor: string;
}

export const INITIAL_PARTNERS: PartnerBookmaker[] = [
  {
    id: 'betclic',
    name: 'Betclic',
    bonusTitle: 'Jusqu\'à',
    bonusHighlight: '5000 FCFA *',
    bonusSub: 'remboursés en freebets',
    promoCode: 'XPRONO',
    url: 'https://betclic.com',
    badge: 'OFFICIEL',
    bgColor: '#E21B23',       // ROUGE BETCLIC
    btnTextColor: '#E21B23'
  },
  {
    id: 'melbet',
    name: 'Melbet',
    bonusTitle: 'Bonus exceptionnel de',
    bonusHighlight: '200 %',
    bonusSub: 'jusqu\'à 130 000 FCFA sur 1er dépôt',
    promoCode: 'XPRO225',
    url: 'https://melbet.com',
    badge: 'TOP BONUS AFRIQUE',
    bgColor: '#F3A000',       // JAUNE-ORANGER MELBET
    btnTextColor: '#1A1A1A'
  },
  {
    id: 'betwinner',
    name: 'Betwinner',
    bonusTitle: 'Bonus exclusif de',
    bonusHighlight: '100 %',
    bonusSub: 'sur votre premier rechargement',
    promoCode: 'DKC10',
    url: 'https://betwinner.com',
    badge: 'RECOMMANDÉ',
    bgColor: '#058253',       // VERT BETWINNER
    btnTextColor: '#058253'
  },
  {
    id: 'goldpari',
    name: 'Goldpari',         // GOLDPARI SANS S
    bonusTitle: 'Bonus spécial',
    bonusHighlight: 'VIP & Freebets',
    bonusSub: 'offerts chaque semaine pour vos mises',
    promoCode: 'XPRO225',     // CODE XPRO225
    url: 'https://goldpari.com',
    badge: 'EXCLUSIF CI',
    bgColor: '#FF6600',       // ORANGE GOLDPARI
    btnTextColor: '#FF6600'
  }
];

export const getPartnerTheme = (id: string) => {
  switch (id.toLowerCase()) {
    case 'melbet':
      return { code: 'text-amber-400', parierBtn: 'bg-amber-400 hover:bg-yellow-400 text-black font-black' };
    case 'betwinner':
      return { code: 'text-emerald-400', parierBtn: 'bg-emerald-600 hover:bg-green-600 text-white font-black' };
    case 'goldpari':
    case 'goldparis':
      return { code: 'text-orange-400', parierBtn: 'bg-orange-500 hover:bg-orange-400 text-white font-black' };
    case 'betclic':
      return { code: 'text-red-400', parierBtn: 'bg-red-600 hover:bg-rose-600 text-white font-black' };
    default:
      return { code: 'text-[#00D68F]', parierBtn: 'bg-[#00D68F] text-black font-black' };
  }
};

interface PartnersViewProps {
  partners?: PartnerBookmaker[];
  onCopyCode: (id: string, code: string) => void;
  copiedCodeId: string | null;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ onCopyCode, copiedCodeId }) => {
  const list = INITIAL_PARTNERS;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {list.map((partner) => (
          <div 
            key={partner.id}
            className="rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:scale-[1.01]"
            style={{ 
              backgroundColor: partner.bgColor,
              minHeight: '260px',
              color: '#FFFFFF'
            }}
          >
            {/* Ligne 1 : Nom officiel en grand et blanc */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white drop-shadow">
                {partner.name}
              </h2>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-black/25 text-white/90">
                {partner.badge}
              </span>
            </div>

            {/* Ligne 2 : Montant du Bonus mis en avant en jaune fluo */}
            <div className="my-5">
              <p className="text-lg sm:text-xl font-extrabold text-white leading-tight drop-shadow-sm">
                {partner.bonusTitle}{' '}
                <span className="text-yellow-300 underline decoration-2 underline-offset-4">
                  {partner.bonusHighlight}
                </span>{' '}
                {partner.bonusSub}
              </p>
            </div>

            {/* Ligne 3 : Code promo + Bouton blanc */}
            <div className="space-y-2.5">
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
                  className="bg-white/25 hover:bg-white/35 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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

              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 bg-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-100 transition-all cursor-pointer"
                style={{ color: partner.btnTextColor }}
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