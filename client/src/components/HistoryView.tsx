import React, { useState } from 'react';
import { History, Filter, Check, X } from 'lucide-react';

export interface PredictionHistoryRecord {
  id: string;
  date: string;
  match: string;
  competition: string;
  selection: string;
  predictedOdds: string;
  finalScore: string;
  status: 'WON' | 'LOST' | 'PENDING';
}

interface HistoryViewProps {
  records: PredictionHistoryRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ records }) => {
  const [filter, setFilter] = useState<'ALL' | 'WON' | 'LOST'>('ALL');

  const evaluated = records.filter(r => r.status === 'WON' || r.status === 'LOST');
  const wonCount = evaluated.filter(r => r.status === 'WON').length;
  const winrate = evaluated.length > 0 ? ((wonCount / evaluated.length) * 100).toFixed(1) : "0";

  const filtered = filter === 'ALL' ? records : records.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0D1E38] via-[#081426] to-[#0D1E38] p-6 rounded-2xl border border-[#162C50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="text-[#00D68F]" /> Registre d'Audit & Historique Certifié
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Prédictions enregistrées avant coup d'envoi. Traçabilité publique et immuable.
          </p>
        </div>

        <div className="bg-[#081426] px-4 py-2.5 rounded-xl border border-[#162C50] text-xs font-mono flex items-center gap-3">
          <div>Évalués : <strong className="text-white">{evaluated.length}</strong></div>
          <div>Validés : <strong className="text-[#00D68F]">{wonCount}</strong></div>
          <div>Taux de Réussite : <strong className="text-[#00D68F] text-sm font-black">{winrate}%</strong></div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[#0D1E38] p-3 rounded-xl border border-[#162C50]">
        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-[#0066FF]" />
          <span className="text-[#94A3B8] font-bold">Filtrer :</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                filter === 'ALL' ? 'bg-[#0066FF] text-white' : 'bg-[#081426] text-[#94A3B8] hover:text-white'
              }`}
            >
              Tous ({records.length})
            </button>
            <button
              onClick={() => setFilter('WON')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                filter === 'WON' ? 'bg-[#00D68F] text-black' : 'bg-[#081426] text-[#94A3B8] hover:text-white'
              }`}
            >
              Validés ({records.filter(r => r.status === 'WON').length})
            </button>
            <button
              onClick={() => setFilter('LOST')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                filter === 'LOST' ? 'bg-rose-500 text-white' : 'bg-[#081426] text-[#94A3B8] hover:text-white'
              }`}
            >
              Échoués ({records.filter(r => r.status === 'LOST').length})
            </button>
          </div>
        </div>
        <span className="text-xs text-[#94A3B8] font-mono">{filtered.length} enregistrement(s)</span>
      </div>

      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#081426] text-[#94A3B8] uppercase font-bold text-[10px] border-b border-[#162C50]">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Match Officiel</th>
              <th className="p-4">Sélection Calculée</th>
              <th className="p-4 text-center">Score Final</th>
              <th className="p-4 text-center">Cote Estimée</th>
              <th className="p-4 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#162C50] text-slate-300">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-[#081426]/50 transition-colors">
                <td className="p-4 font-mono text-[#94A3B8]">{row.date}</td>
                <td className="p-4">
                  <span className="font-bold text-white block">{row.match}</span>
                  <span className="text-[10px] text-[#94A3B8]">{row.competition}</span>
                </td>
                <td className="p-4 font-semibold text-white">{row.selection}</td>
                <td className="p-4 text-center font-mono font-bold text-white">{row.finalScore}</td>
                <td className="p-4 text-center font-mono text-white">{row.predictedOdds}</td>
                <td className="p-4 text-right">
                  {row.status === 'WON' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00D68F]/15 text-[#00D68F] font-bold text-xs">
                      <Check size={12} /> Validé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 font-bold text-xs">
                      <X size={12} /> Échoué
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};