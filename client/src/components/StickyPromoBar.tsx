import React from 'react';
import { Flame, Copy, Check } from 'lucide-react';

interface StickyPromoBarProps {
  onCopyCode: (id: string, code: string) => void;
  copiedCodeId: string | null;
  onNavigateToPartners: () => void;
}

export const StickyPromoBar: React.FC<StickyPromoBarProps> = ({
  onCopyCode,
  copiedCodeId,
  onNavigateToPartners,
}) => {
  // Liste des badges des 4 partenaires avec leurs vraies couleurs
  const promoBadges = [
    {
      id: 'betclic-sticky',
      name: 'Betclic',
      code: 'XPRONO',
      bg: '#E21B23',
      textColor: 'text-white',
      badgeBorder: 'border-white/15',
      codeBorder: 'border-white/20',
      checkColor: 'text-emerald-300',
      italic: true,
    },
    {
      id: 'melbet-sticky',
      name: 'Melbet',
      code: 'XPRO225',
      bg: '#F3A000',
      textColor: 'text-black',
      badgeBorder: 'border-black/10',
      codeBorder: 'border-black/15',
      checkColor: 'text-emerald-800',
      italic: false,
    },
    {
      id: 'betwinner-sticky',
      name: 'Betwinner',
      code: 'DKC10',
      bg: '#058253',
      textColor: 'text-white',
      badgeBorder: 'border-white/15',
      codeBorder: 'border-white/20',
      checkColor: 'text-emerald-300',
      italic: false,
    },
    {
      id: 'goldpari-sticky',
      name: 'Goldpari',
      code: 'XPRO225',
      bg: '#FF6600',
      textColor: 'text-white',
      badgeBorder: 'border-white/15',
      codeBorder: 'border-white/20',
      checkColor: 'text-emerald-300',
      italic: false,
    },
  ];

  // Rendu unitaire d'un badge promo
  const renderBadge = (item: typeof promoBadges[0], keyIndex: number) => (
    <div
      key={`${item.id}-${keyIndex}`}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-lg font-bold text-sm ${item.textColor} transition-transform hover:scale-105 border ${item.badgeBorder} shrink-0 cursor-default`}
      style={{ backgroundColor: item.bg }}
    >
      <span className={`font-black text-sm ${item.italic ? 'italic' : ''}`}>
        {item.name}:
      </span>
      <span className={`font-mono font-black bg-black/25 px-2.5 py-1 rounded-xl text-xs ${item.textColor} border ${item.codeBorder}`}>
        {item.code}
      </span>
      <button
        type="button"
        onClick={() => onCopyCode(item.id, item.code)}
        className="p-1 rounded-lg hover:bg-black/20 cursor-pointer transition-all"
        title="Copier le code"
      >
        {copiedCodeId === item.id ? (
          <Check size={15} className={item.checkColor} />
        ) : (
          <Copy size={15} className="opacity-80 hover:opacity-100" />
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* ANIMATION CSS DU DÉFILEMENT CONTINU AVEC PAUSE AU SURVOL */}
      <style>{`
        @keyframes lmproTicker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .lmpro-ticker-track {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: lmproTicker 25s linear infinite;
        }
        .lmpro-ticker-container:hover .lmpro-ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="sticky top-0 z-40 bg-[#081426]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-2xl flex items-center justify-between gap-3 overflow-hidden select-none">
        
        {/* BLOC GAUCHE FIXE : Label d'appel à l'action */}
        <div className="flex items-center gap-2 shrink-0 bg-[#081426] pr-3 z-10 border-r border-[#162C50]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <Flame size={18} className="text-amber-400" /> CODES PROMO :
          </span>
        </div>

        {/* ZONE CENTRALE : BANDE DÉFILANTE CONTINUE AVEC PAUSE AU SURVOL */}
        <div className="lmpro-ticker-container flex-1 overflow-hidden relative cursor-pointer">
          {/* Dégradés d'atténuation sur les côtés pour un effet de fondu cinéma */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#081426] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#081426] to-transparent z-10 pointer-events-none" />

          {/* Rail défilant (dupliqué pour une boucle sans coupure) */}
          <div className="lmpro-ticker-track">
            {promoBadges.map((badge, idx) => renderBadge(badge, idx))}
            {promoBadges.map((badge, idx) => renderBadge(badge, idx + 100))}
          </div>
        </div>

        {/* BLOC DROITE FIXE : Bouton d'accès aux bonus */}
        <div className="shrink-0 pl-2 bg-[#081426] z-10 border-l border-[#162C50]">
          <button
            type="button"
            onClick={onNavigateToPartners}
            className="bg-white hover:bg-slate-100 text-black font-black text-xs px-3.5 py-2 rounded-2xl whitespace-nowrap shadow-xl cursor-pointer hover:scale-[1.02] transition-all"
          >
            Tous les Bonus →
          </button>
        </div>
      </div>
    </>
  );
};