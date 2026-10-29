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
    <div className="sticky top-0 z-40 bg-[#081426]/95 backdrop-blur-md border-b border-amber-500/30 px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={14} className="text-amber-400" /> CODES PROMO :
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Melbet */}
        <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-amber-400/40 px-2.5 py-1 rounded-lg">
          <span className="text-[11px] font-bold text-amber-300">Melbet:</span>
          <span className="text-xs font-mono font-black text-white">XPRO225</span>
          <button
            onClick={() => onCopyCode('melbet-sticky', 'XPRO225')}
            className="text-[#94A3B8] hover:text-white p-0.5"
            title="Copier"
          >
            {copiedCodeId === 'melbet-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Betwinner */}
        <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-emerald-500/40 px-2.5 py-1 rounded-lg">
          <span className="text-[11px] font-bold text-emerald-400">Betwinner:</span>
          <span className="text-xs font-mono font-black text-white">DKC10</span>
          <button
            onClick={() => onCopyCode('betwinner-sticky', 'DKC10')}
            className="text-[#94A3B8] hover:text-white p-0.5"
            title="Copier"
          >
            {copiedCodeId === 'betwinner-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Goldparis */}
        <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-orange-500/40 px-2.5 py-1 rounded-lg">
          <span className="text-[11px] font-bold text-orange-400">Goldparis:</span>
          <span className="text-xs font-mono font-black text-white">X</span>
          <button
            onClick={() => onCopyCode('goldparis-sticky', 'XPRO225')}
            className="text-[#94A3B8] hover:text-white p-0.5"
            title="Copier"
          >
            {copiedCodeId === 'goldparis-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Betclic */}
        <div className="flex items-center gap-1.5 bg-[#0D1E38] border border-red-500/40 px-2.5 py-1 rounded-lg">
          <span className="text-[11px] font-bold text-red-400">Betclic:</span>
          <span className="text-xs font-mono font-black text-white">XPRONO</span>
          <button
            onClick={() => onCopyCode('betclic-sticky', 'XPRONO')}
            className="text-[#94A3B8] hover:text-white p-0.5"
            title="Copier"
          >
            {copiedCodeId === 'betclic-sticky' ? <Check size={12} className="text-[#00D68F]" /> : <Copy size={12} />}
          </button>
        </div>

        <button
          onClick={onNavigateToPartners}
          className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors"
        >
          Bonus →
        </button>
      </div>
    </div>
  );
};