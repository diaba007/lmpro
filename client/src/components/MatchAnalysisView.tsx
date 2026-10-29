import React from 'react';
import { Sparkles, TrendingUp, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getPartnerTheme } from './PartnersView';

interface MatchAnalysisViewProps {
  match: any;
  analysis: any;
  odds: any;
  partners: any[];
  onOpenAI: () => void;
}

export const MatchAnalysisView: React.FC<MatchAnalysisViewProps> = ({
  match,
  analysis,
  odds,
  partners,
  onOpenAI,
}) => {
  const homeName = match.homeTeam.shortName || match.homeTeam.name;
  const awayName = match.awayTeam.shortName || match.awayTeam.name;

  const chartData = [
    { name: homeName, prob: analysis.homeWin, fill: '#0066FF' },
    { name: 'Nul', prob: analysis.draw, fill: '#94A3B8' },
    { name: awayName, prob: analysis.awayWin, fill: '#00D68F' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Match */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
        <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-4">
          <span className="uppercase font-bold tracking-wider">{match.competition.name}</span>
          <button onClick={onOpenAI} className="flex items-center gap-1.5 text-[#00D68F] hover:underline font-bold">
            <Sparkles size={14} /> Analyser avec l'IA
          </button>
        </div>
        <div className="grid grid-cols-3 items-center text-center">
          <div className="flex flex-col items-center space-y-2">
            {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="w-14 h-14 object-contain" />}
            <h2 className="text-sm md:text-base font-bold text-white">{match.homeTeam.name}</h2>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-[#94A3B8] font-bold uppercase mb-1">xG Attendus (Poisson)</span>
            <div className="text-3xl font-black text-white font-mono bg-[#081426] px-4 py-1.5 rounded-xl border border-[#162C50]">
              {analysis.xGHome.toFixed(2)} - {analysis.xGAway.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="w-14 h-14 object-contain" />}
            <h2 className="text-sm md:text-base font-bold text-white">{match.awayTeam.name}</h2>
          </div>
        </div>
      </div>

      {/* Tableau Flashscore rattaché aux équipes */}
      <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-[#00D68F]" /> Cotes Officielles pour {homeName} vs {awayName}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#162C50] text-[#94A3B8] font-bold uppercase text-[10px]">
                <th className="pb-3">Bookmaker</th>
                <th className="pb-3 text-center">1 ({homeName})</th>
                <th className="pb-3 text-center">X (Nul)</th>
                <th className="pb-3 text-center">2 ({awayName})</th>
                <th className="pb-3">Code Promo</th>
                <th className="pb-3 text-right">Parier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162C50]">
              {partners.map((p) => {
                const theme = getPartnerTheme(p.id);
                return (
                  <tr key={p.id} className="hover:bg-[#081426]/60 transition-colors">
                    <td className="py-3.5 flex items-center gap-3">
                      <div className="h-8 w-24 rounded-lg bg-[#081426] border border-[#162C50] flex items-center justify-center px-2 py-1 overflow-hidden shrink-0 shadow-inner">
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className={`font-black text-xs ${theme.code}`}>{p.name.toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-extrabold text-white text-xs">{p.name}</span>
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-white text-xs">
                        {odds.odds1}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#94A3B8] text-xs">
                        {odds.oddsX}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="bg-[#081426] border border-[#162C50] px-2.5 py-1.5 rounded-lg font-mono font-bold text-[#00D68F] text-xs">
                        {odds.odds2}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`font-mono bg-[#162C50] px-2.5 py-1 rounded-lg font-black text-xs ${theme.code}`}>
                        {p.promoCode}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md ${theme.parierBtn}`}
                      >
                        <span>Parier</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Probabilités 1X2 & Over/Under */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Probabilités 1X2 (Loi de Poisson)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" stroke="#FFFFFF" width={90} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#081426', 
                    borderColor: '#162C50', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    padding: '10px 14px',
                    color: '#FFFFFF'
                  }}
                  itemStyle={{ color: '#00D68F', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value}%`, 'Probabilité']}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="prob" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0D1E38] border border-[#162C50] rounded-2xl p-6 space-y-3 text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Marchés Spécialisés</h3>
          <div>
            <div className="flex justify-between font-bold text-white mb-1">
              <span>Plus de 1.5 But</span>
              <span className="text-[#00D68F]">{analysis.over15}%</span>
            </div>
            <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00D68F] h-full" style={{ width: `${analysis.over15}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-bold text-white mb-1">
              <span>Plus de 2.5 Buts</span>
              <span className="text-[#0066FF]">{analysis.over25}%</span>
            </div>
            <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0066FF] h-full" style={{ width: `${analysis.over25}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-bold text-white mb-1">
              <span>Les 2 marquent (BTTS - Oui)</span>
              <span className="text-amber-400">{analysis.btts}%</span>
            </div>
            <div className="w-full bg-[#081426] h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${analysis.btts}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};