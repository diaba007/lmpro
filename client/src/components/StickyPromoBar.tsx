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
    <div className="sticky top-0 z-40 bg-[#081426]/95 backdrop-blur-md border-b border-white/10 px-4 py-2 shadow-xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
      
      {/* Label d'appel à l'action */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={14} className="text-amber-400" /> CODES PROMO :
        </span>
      </div>

      {/* Les 4 Pastilles aux vraies couleurs de marque forcées */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* 🔴 Betclic (Rouge #E21B23) */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg shadow-md font-bold text-xs text-white"
          style={{ backgroundColor: '#E21B23' }}
        >
          <span className="italic font-black">Betclic:</span>
          <span className="font-mono font-black bg-black/25 px-1.5 py-0.5 rounded text-white">XPRONO</span>
          <button
            type="button"
            onClick={() => onCopyCode('betclic-sticky', 'XPRONO')}
            className="text-white/80 hover:text-white p-0.5 cursor-pointer transition-colors"
            title="Copier le code"
          >
            {copiedCodeId === 'betclic-sticky' ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
          </button>
        </div>

        {/* 🟡 Melbet (Jaune-Oranger #F3A000) */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg shadow-md font-bold text-xs text-black"
          style={{ backgroundColor: '#F3A000' }}
        >
          <span className="font-black">Melbet:</span>
          <span className="font-mono font-black bg-black/20 px-1.5 py-0.5 rounded text-black">XPRO225</span>
          <button
            type="button"
            onClick={() => onCopyCode('melbet-sticky', 'XPRO225')}
            className="text-black/80 hover:text-black p-0.5 cursor-pointer transition-colors"
            title="Copier le code"
          >
            {copiedCodeId === 'melbet-sticky' ? <Check size={13} className="text-emerald-800" /> : <Copy size={13} />}
          </button>
        </div>

        {/* 🟢 Betwinner (Vert #058253) */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg shadow-md font-bold text-xs text-white"
          style={{ backgroundColor: '#058253' }}
        >
          <span className="font-black">Betwinner:</span>
          <span className="font-mono font-black bg-black/25 px-1.5 py-0.5 rounded text-white">DKC10</span>
          <button
            type="button"
            onClick={() => onCopyCode('betwinner-sticky', 'DKC10')}
            className="text-white/80 hover:text-white p-0.5 cursor-pointer transition-colors"
            title="Copier le code"
          >
            {copiedCodeId === 'betwinner-sticky' ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
          </button>
        </div>

        {/* 🟠 Goldparis (Orange #FF6600) */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg shadow-md font-bold text-xs text-white"
          style={{ backgroundColor: '#FF6600' }}
        >
          <span className="font-black">Goldparis:</span>
          <span className="font-mono font-black bg-black/25 px-1.5 py-0.5 rounded text-white">LMPRO</span>
          <button
            type="button"
            onClick={() => onCopyCode('goldparis-sticky', 'LMPRO')}
            className="text-white/80 hover:text-white p-0.5 cursor-pointer transition-colors"
            title="Copier le code"
          >
            {copiedCodeId === 'goldparis-sticky' ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Bouton de redirection vers la page des bonus */}
        <button
          type="button"
          onClick={onNavigateToPartners}
          className="bg-white hover:bg-slate-100 text-black font-black text-[11px] px-3 py-1 rounded-lg whitespace-nowrap shadow-md cursor-pointer transition-all"
        >
          Tous les Bonus →
        </button>
      </div>
    </div>
  );
};