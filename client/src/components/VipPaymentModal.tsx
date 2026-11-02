import React, { useState } from 'react';
import { Crown, X, Smartphone, Check, Zap } from 'lucide-react';

interface VipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VipPaymentModal: React.FC<VipPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedVipPlan, setSelectedVipPlan] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'WAVE' | 'ORANGE' | 'MTN' | 'MOOV'>('WAVE');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccessMsg(true);
    setTimeout(() => {
      onSuccess();
      setPaymentSuccessMsg(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0D1E38] border border-amber-400/50 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-[#94A3B8] hover:text-white cursor-pointer p-1"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 mx-auto shadow-lg shadow-amber-400/10">
            <Crown size={26} />
          </div>
          <h2 className="text-xl font-black text-white">Souscrire au Pass VIP LMPRO</h2>
          <p className="text-xs text-[#94A3B8]">
            Accédez à toutes les analyses et prédictions exclusives des grands championnats européens.
          </p>
        </div>

        {paymentSuccessMsg ? (
          <div className="p-6 bg-emerald-500/20 border border-emerald-500 text-center rounded-2xl space-y-2">
            <Check size={36} className="text-[#00D68F] mx-auto animate-bounce" />
            <h3 className="text-base font-black text-white">Paiement Mobile Money Confirmé !</h3>
            <p className="text-xs text-slate-300">Votre Pass VIP est actif. Déblocage immédiat de toutes les prédictions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Choix de la formule */}
            <div>
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1.5">Choisissez votre Formule :</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DAY', name: 'Pass 24H', price: '1 000 FCFA', badge: 'Court Terme' },
                  { id: 'MONTH', name: 'Pass 1 Mois', price: '5 000 FCFA', badge: 'Populaire' },
                  { id: 'YEAR', name: 'Pass 3 Mois', price: '12 000 FCFA', badge: 'Économique' }
                ].map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedVipPlan(plan.id as any)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedVipPlan === plan.id 
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg' 
                        : 'bg-[#081426] border-[#162C50] text-[#94A3B8] hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase block text-amber-300">{plan.badge}</span>
                    <div className="font-extrabold text-xs text-white mt-1">{plan.name}</div>
                    <div className="font-mono font-black text-sm text-yellow-300 mt-0.5">{plan.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Choix du moyen Mobile Money */}
            <div>
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1.5">Moyen de Paiement Mobile Money :</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'WAVE', name: 'Wave', color: 'bg-[#1EA5FC] text-white' },
                  { id: 'ORANGE', name: 'Orange', color: 'bg-[#FF6600] text-white' },
                  { id: 'MTN', name: 'MTN MoMo', color: 'bg-[#FFCC00] text-black' },
                  { id: 'MOOV', name: 'Moov', color: 'bg-[#005CA9] text-white' }
                ].map((momo) => (
                  <button
                    key={momo.id}
                    type="button"
                    onClick={() => setMobileMoneyProvider(momo.id as any)}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${momo.color} ${
                      mobileMoneyProvider === momo.id ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {momo.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Numéro de téléphone */}
            <div>
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">Votre Numéro de Téléphone :</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                <input
                  type="tel"
                  required
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="Ex: 07 00 00 00 00"
                  className="w-full bg-[#081426] border border-[#162C50] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#94A3B8] outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-1 block">Notification de confirmation sur votre compte {mobileMoneyProvider}.</span>
            </div>

            {/* Bouton de confirmation */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:brightness-105 text-black font-black text-sm rounded-xl shadow-xl shadow-amber-400/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>Confirmer le Paiement & Activer le Pass VIP</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};