import React from 'react';
import { NavigationTab, UserProfileData } from '../types';
import {
  Compass,
  User,
  ShoppingBag,
  Palette,
  Hammer,
  Gem,
  Package,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SidebarProps {
  isOpen: boolean;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  user: UserProfileData;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  onSelectTab,
  user,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleItemClick = (tab: NavigationTab) => {
    sounds.playClick();
    onSelectTab(tab);
    onClose();
  };

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { tab: 'discover', label: 'Discover', icon: <Compass className="w-4 h-4" /> },
    { tab: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { tab: 'avatar', label: 'Avatar Customizer', icon: <Palette className="w-4 h-4" />, badge: '3D' },
    { tab: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { tab: 'create', label: 'Creations & Studio', icon: <Hammer className="w-4 h-4" /> },
    { tab: 'robux', label: 'Buy Robux', icon: <Gem className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      />

      {/* Drawer panel */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#191b1f] border-r border-white/10 z-50 flex flex-col justify-between shadow-2xl p-4 animate-in slide-in-from-left duration-200">
        <div>
          {/* User mini header in sidebar */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {user.displayName.charAt(0)}
            </div>
            <div className="truncate">
              <span className="text-sm font-bold text-white block truncate">{user.displayName}</span>
              <span className="text-xs text-slate-400 font-mono block truncate">@{user.username}</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleItemClick(item.tab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility links */}
        <div className="pt-4 border-t border-white/10 space-y-1 text-xs text-slate-400">
          <div className="flex items-center justify-between px-3 py-2">
            <span>Robux Balance:</span>
            <span className="font-mono text-emerald-400 font-bold">{user.robux.toLocaleString()} R$</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span>Friends:</span>
            <span className="font-bold text-white">{user.friendsCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 px-3 pt-2">
            © 2026 Roblox Corporation
          </div>
        </div>
      </aside>
    </>
  );
};
