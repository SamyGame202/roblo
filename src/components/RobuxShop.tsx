import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfileData } from '../types';
import { sounds } from '../utils/audio';
import { Sparkles, Check, ShieldCheck, Zap, Star } from 'lucide-react';

interface RobuxShopProps {
  user: UserProfileData;
  onAddRobux: (amount: number) => void;
}

const ROBUX_PACKAGES = [
  { amount: 400, price: '$4.99', popular: false, bonus: '' },
  { amount: 800, price: '$9.99', popular: false, bonus: '' },
  { amount: 1700, price: '$19.99', popular: true, bonus: '+100 Bonus' },
  { amount: 4500, price: '$49.99', popular: false, bonus: '+500 Bonus' },
  { amount: 10000, price: '$99.99', popular: false, bonus: '+2,000 Bonus' },
];

export const RobuxShop: React.FC<RobuxShopProps> = ({ user, onAddRobux }) => {
  const [successModal, setSuccessModal] = useState<number | null>(null);

  const handleBuy = (amount: number) => {
    sounds.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onAddRobux(amount);
    setSuccessModal(amount);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>OFFICIAL ROBUX STORE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Buy Robux</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Robux can be used to purchase awesome avatar upgrades, special abilities in experiences, and limited collectibles.
        </p>

        <div className="pt-2">
          <span className="text-xs text-slate-400">Current Balance: </span>
          <span className="font-mono text-emerald-400 font-bold text-base">
            {user.robux.toLocaleString()} R$
          </span>
        </div>
      </div>

      {/* Robux Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ROBUX_PACKAGES.map((pkg) => (
          <div
            key={pkg.amount}
            className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between text-center ${
              pkg.popular
                ? 'bg-gradient-to-b from-emerald-950/50 to-[#191b22] border-emerald-500 shadow-lg shadow-emerald-900/20 scale-105'
                : 'bg-[#191b22] border-white/10 hover:border-white/20'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}

            <div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl mb-3 shadow-inner">
                💎
              </div>
              <h3 className="font-mono text-2xl font-black text-white">{pkg.amount.toLocaleString()}</h3>
              <span className="text-xs font-semibold text-emerald-400 block mb-1">Robux</span>
              {pkg.bonus && (
                <span className="text-[10px] text-amber-400 font-medium block">{pkg.bonus}</span>
              )}
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleBuy(pkg.amount)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                  pkg.popular
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white'
                    : 'bg-white/10 hover:bg-white/20 active:scale-95 text-white'
                }`}
              >
                {pkg.price}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roblox Premium Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white text-slate-950 font-black text-xs flex items-center justify-center">
              P
            </span>
            <span className="text-sm font-bold text-white tracking-wide">ROBLOX PREMIUM</span>
          </div>
          <h2 className="text-xl font-bold text-white">Upgrade to Premium Membership</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Get 10% more Robux when you buy Robux packages, unlock exclusive items and discounts in the Marketplace, and get access to item trading with friends!
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Monthly Robux stipend</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Item Trading unlocked</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Premium only games</span>
          </div>
        </div>

        <button
          onClick={() => handleBuy(2200)}
          className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
        >
          Join Premium · $9.99/mo
        </button>
      </div>

      {/* Success Modal */}
      {successModal !== null && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2229] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4">
              💎
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Robux Added!</h3>
            <p className="text-xs text-slate-300 mb-6">
              +{successModal.toLocaleString()} Robux has been credited to your balance. Go dress up your avatar or support creators!
            </p>
            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
