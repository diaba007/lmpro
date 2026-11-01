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
  return (
    <div className="sticky top-0 z-40 bg-[#081426]/95 backdrop-blur-md border-b border-white/10 px-5 py-3 shadow-2xl flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
      
      {/* Label Principal Agrandie avec Flamme */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        <span className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={18} className="text-amber-400" /> CODES PROMO :
        </span>
      </div>

      {/* Les 4 Badges Rectangulaires Agrandis et Bien Arrondis (rounded-2xl) */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* 🔴 Betclic (Rouge #E21B23) */}
        <div 
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-lg font-bold text-sm text-white transition-transform hover:scale-[1.02] border border-white/15"
          style={{ backgroundColor: '#E21B23' }}
        >
          <span className="italic font-black text-sm">Betclic:</span>
          <span className="font-mono font-black bg-black/25 px-2.5 py-1 rounded-xl text-xs text-white border border-white/20">
            XPRONO
          </span>
          <button
            type="button"
            onClick={() => onCopyCode('betclic-sticky', 'XPRONO')}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 cursor-pointer transition-all"
            title="Copier le code"
          >
            {copiedCodeId === 'betclic-sticky' ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
          </button>
        </div>

        {/* 🟡 Melbet (Jaune-Oranger #F3A000) */}
        <div 
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-lg font-bold text-sm text-black transition-transform hover:scale-[1.02] border border-black/10"
          style={{ backgroundColor: '#F3A000' }}
        >
          <span className="font-black text-sm">Melbet:</span>
          <span className="font-mono font-black bg-black/20 px-2.5 py-1 rounded-xl text-xs text-black border border-black/15">
            XPRO225
          </span>
          <button
            type="button"
            onClick={() => onCopyCode('melbet-sticky', 'XPRO225')}
            className="text-black/80 hover:text-black p-1 rounded-lg hover:bg-black/15 cursor-pointer transition-all"
            title="Copier le code"
          >
            {copiedCodeId === 'melbet-sticky' ? <Check size={15} className="text-emerald-800" /> : <Copy size={15} />}
          </button>
        </div>

        {/* 🟢 Betwinner (Vert #058253) */}
        <div 
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-lg font-bold text-sm text-white transition-transform hover:scale-[1.02] border border-white/15"
          style={{ backgroundColor: '#058253' }}
        >
          <span className="font-black text-sm">Betwinner:</span>
          <span className="font-mono font-black bg-black/25 px-2.5 py-1 rounded-xl text-xs text-white border border-white/20">
            DKC10
          </span>
          <button
            type="button"
            onClick={() => onCopyCode('betwinner-sticky', 'DKC10')}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 cursor-pointer transition-all"
            title="Copier le code"
          >
            {copiedCodeId === 'betwinner-sticky' ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
          </button>
        </div>

        {/* 🟠 Goldpari (Orange #FF6600 - Code XPRO225) */}
        <div 
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-lg font-bold text-sm text-white transition-transform hover:scale-[1.02] border border-white/15"
          style={{ backgroundColor: '#FF6600' }}
        >
          <span className="font-black text-sm">Goldpari:</span>
          <span className="font-mono font-black bg-black/25 px-2.5 py-1 rounded-xl text-xs text-white border border-white/20">
            XPRO225
          </span>
          <button
            type="button"
            onClick={() => onCopyCode('goldpari-sticky', 'XPRO225')}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 cursor-pointer transition-all"
            title="Copier le code"
          >
            {copiedCodeId === 'goldpari-sticky' ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Bouton vers tous les bonus - Bien Arrondi et Stylé */}
        <button
          type="button"
          onClick={onNavigateToPartners}
          className="bg-white hover:bg-slate-100 text-black font-black text-xs px-4 py-2.5 rounded-2xl whitespace-nowrap shadow-xl cursor-pointer hover:scale-[1.02] transition-all ml-1"
        >
          Tous les Bonus →
        </button>
      </div>
    </div>
  );
};