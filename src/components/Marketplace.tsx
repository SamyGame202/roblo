import React, { useState } from 'react';
import { CatalogItem, UserProfileData } from '../types';
import { CATALOG_ITEMS } from '../data/mockData';
import { sounds } from '../utils/audio';
import { Search, Sparkles, Check, ShoppingCart, Tag, Filter } from 'lucide-react';

interface MarketplaceProps {
  user: UserProfileData;
  onBuyItem: (item: CatalogItem) => void;
  onOpenRobuxShop: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  user,
  onBuyItem,
  onOpenRobuxShop,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hat' | 'accessory' | 'face' | 'shirt'>('all');
  const [selectedItemForModal, setSelectedItemForModal] = useState<CatalogItem | null>(null);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePurchase = (item: CatalogItem) => {
    if (user.inventoryIds.includes(item.id)) {
      setPurchaseFeedback(`You already own ${item.name}!`);
      setTimeout(() => setPurchaseFeedback(null), 2500);
      return;
    }

    if (user.robux < item.price) {
      setPurchaseFeedback(`Not enough Robux! You need ${item.price - user.robux} more.`);
      setTimeout(() => setPurchaseFeedback(null), 3000);
      return;
    }

    sounds.playCoin();
    onBuyItem(item);
    setPurchaseFeedback(`Successfully purchased ${item.name}! Added to Inventory.`);
    setTimeout(() => {
      setPurchaseFeedback(null);
      setSelectedItemForModal(null);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-900/60 via-purple-900/40 to-slate-900 border border-white/10 p-6 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL ROBLOX MARKETPLACE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Avatar Shop & Catalog</h1>
          <p className="text-sm text-slate-300 mt-1">
            Discover community gear, exclusive limited collectibles, and trending fashion.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
          <div>
            <span className="text-[11px] text-slate-400 block">Your Robux Balance</span>
            <span className="font-mono text-lg font-bold text-emerald-400">
              {user.robux.toLocaleString()} R$
            </span>
          </div>
          <button
            onClick={onOpenRobuxShop}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Get Robux
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#191b22] p-4 rounded-xl border border-white/10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, accessories, clothing..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'hat', label: 'Hats' },
            { id: 'accessory', label: 'Accessories' },
            { id: 'face', label: 'Faces' },
            { id: 'shirt', label: 'Clothing' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item) => {
          const isOwned = user.inventoryIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItemForModal(item)}
              className="group bg-[#191b22] hover:bg-[#20232c] border border-white/5 hover:border-white/20 rounded-xl p-3.5 transition-all flex flex-col justify-between cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              <div className="relative w-full aspect-square rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-5xl mb-3 group-hover:scale-105 transition-transform">
                <span>{item.iconType}</span>
                {item.isLimited && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500/90 text-slate-950 font-black text-[9px] rounded tracking-wider">
                    LIMITED
                  </span>
                )}
                {isOwned && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> OWNED
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white truncate mb-1" title={item.name}>
                  {item.name}
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-400">
                    {item.isFree ? 'Free' : `${item.price.toLocaleString()} R$`}
                  </span>
                  {item.stats && (
                    <span className="text-[10px] text-slate-500">❤️ {item.stats.favorites}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL / BUY MODAL */}
      {selectedItemForModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2229] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedItemForModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-6xl mb-4 shadow-inner">
                {selectedItemForModal.iconType}
              </div>

              {selectedItemForModal.isLimited && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded mb-2">
                  COLLECTIBLE LIMITED EDITION
                </span>
              )}

              <h2 className="text-xl font-bold text-white mb-2">{selectedItemForModal.name}</h2>
              <p className="text-xs text-slate-300 mb-4 max-w-sm">
                {selectedItemForModal.description}
              </p>

              <div className="w-full bg-white/5 rounded-xl p-3 mb-6 flex items-center justify-between text-xs">
                <span className="text-slate-400">Item Price:</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {selectedItemForModal.isFree ? 'Free' : `${selectedItemForModal.price.toLocaleString()} R$`}
                </span>
              </div>

              {purchaseFeedback && (
                <div className="w-full mb-4 p-2.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
                  {purchaseFeedback}
                </div>
              )}

              <div className="w-full flex gap-3">
                <button
                  onClick={() => setSelectedItemForModal(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchase(selectedItemForModal)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{user.inventoryIds.includes(selectedItemForModal.id) ? 'Equip Now' : 'Buy Item'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
