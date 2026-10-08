import React, { useState } from 'react';
import { NavigationTab, UserProfileData } from '../types';
import { Search, Bell, Settings, Menu, Shield } from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  user: UserProfileData;
  onToggleSidebar: () => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onToggleSidebar,
  onSearch,
}) => {
  const [searchVal, setSearchVal] = useState('');

  const handleNavClick = (tab: NavigationTab) => {
    sounds.playClick();
    onSelectTab(tab);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    onSelectTab('discover');
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#191b1f] border-b border-white/10 px-4 flex items-center justify-between gap-4">
      {/* Zone 1: Sidebar Toggle & Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Zone: Roblox tilted silver cube + Wordmark */}
        <button
          onClick={() => handleNavClick('discover')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-6 h-6 bg-white rotate-12 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
            <div className="w-2.5 h-2.5 bg-[#191b1f] -rotate-12" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-white group-hover:text-slate-200">
            ROBLOX
          </span>
        </button>
      </div>

      {/* Zone 2: 4-6 Clean Text Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => handleNavClick('discover')}
          className={`transition-colors cursor-pointer pb-0.5 ${
            activeTab === 'discover'
              ? 'text-white border-b-2 border-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Discover
        </button>

        <button
          onClick={() => handleNavClick('marketplace')}
          className={`transition-colors cursor-pointer pb-0.5 ${
            activeTab === 'marketplace'
              ? 'text-white border-b-2 border-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Marketplace
        </button>

        <button
          onClick={() => handleNavClick('create')}
          className={`transition-colors cursor-pointer pb-0.5 ${
            activeTab === 'create'
              ? 'text-white border-b-2 border-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create
        </button>

        <button
          onClick={() => handleNavClick('robux')}
          className={`transition-colors cursor-pointer pb-0.5 ${
            activeTab === 'robux'
              ? 'text-white border-b-2 border-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Robux
        </button>
      </nav>

      {/* Search Input (Desktop Center-Right) */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search games, catalog..."
          className="w-full bg-[#111216] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white/30"
        />
      </form>

      {/* Zone 3: Primary Actions (Robux Balance & Avatar Profile) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Robux Balance */}
        <button
          onClick={() => handleNavClick('robux')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-emerald-400 transition-colors cursor-pointer"
          title="Buy & View Robux"
        >
          <span>💎</span>
          <span>{user.robux.toLocaleString()}</span>
        </button>

        {/* Notifications */}
        <button
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* User Profile Avatar shortcut */}
        <button
          onClick={() => handleNavClick('profile')}
          className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="My Profile"
        >
          <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
            {user.username}
          </span>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user.displayName.charAt(0)}
          </div>
        </button>
      </div>
    </header>
  );
};
