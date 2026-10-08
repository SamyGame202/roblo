import React from 'react';
import { UserProfileData } from '../types';
import { CATALOG_ITEMS } from '../data/mockData';
import { Shield, Award, Calendar, Users, Sparkles, ExternalLink, Edit3 } from 'lucide-react';

interface UserProfileProps {
  user: UserProfileData;
  onOpenAvatarEditor: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onOpenAvatarEditor }) => {
  const ownedCatalogItems = CATALOG_ITEMS.filter((item) =>
    user.inventoryIds.includes(item.id)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-[#191b22] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar Icon */}
          <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 p-1 shadow-lg">
            <div className="w-full h-full rounded-xl bg-[#1f222a] flex flex-col items-center justify-center text-4xl overflow-hidden relative">
              <span className="text-4xl">😎</span>
              <div
                className="absolute bottom-0 inset-x-0 h-4"
                style={{ backgroundColor: user.avatarColors.torso }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#191b22]" title="Online" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{user.displayName}</h1>
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]" title="Verified Creator">
                ✓
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">@{user.username}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-white">{user.friendsCount}</strong> Friends
              </span>
              <span className="flex items-center gap-1.5">
                <strong className="text-white">{user.followersCount}</strong> Followers
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {user.joinDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAvatarEditor}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer text-xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>Customize Avatar</span>
          </button>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Player Badges ({user.badges.length})</h2>
          </div>
          <span className="text-xs text-slate-400">Earned in 3D experiences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-[#191b22] border border-white/10 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-3">
                  {badge.icon}
                </div>
                <h3 className="text-xs font-bold text-white mb-1">{badge.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{badge.description}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
                Unlocked {badge.unlockedAt}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory & Gear */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Inventory & Gear ({ownedCatalogItems.length})</h2>
          </div>
          <button onClick={onOpenAvatarEditor} className="text-xs text-blue-400 hover:underline cursor-pointer">
            Manage in Avatar Editor →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {ownedCatalogItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#191b22] border border-white/10 rounded-xl p-3 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-black/30 flex items-center justify-center text-3xl mb-2">
                {item.iconType}
              </div>
              <span className="text-xs font-semibold text-white truncate w-full mb-0.5">{item.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
