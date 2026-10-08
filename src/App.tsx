import React, { useState } from 'react';
import { NavigationTab, GameExperience, CatalogItem, UserProfileData, AvatarColors } from './types';
import { GAMES_DATA, INITIAL_USER, CATALOG_ITEMS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { GamePlayer3D } from './components/GamePlayer3D';
import { AvatarEditor } from './components/AvatarEditor';
import { Marketplace } from './components/Marketplace';
import { RobuxShop } from './components/RobuxShop';
import { CreateStudio } from './components/CreateStudio';
import { UserProfile } from './components/UserProfile';
import { FriendsDrawer } from './components/FriendsDrawer';
import { sounds } from './utils/audio';
import { Play, Sparkles, Trophy, Users, Shield, Compass, Search } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('discover');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfileData>(INITIAL_USER);
  const [selectedGameForModal, setSelectedGameForModal] = useState<GameExperience | null>(null);
  const [activePlayingGame, setActivePlayingGame] = useState<GameExperience | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  // Award Badge notification
  const handleAwardBadge = (badgeName: string) => {
    sounds.playCheckpoint();
    setBadgeToast(badgeName);
    setUser((prev) => {
      const alreadyHas = prev.badges.some((b) => b.name === badgeName);
      if (alreadyHas) return prev;
      return {
        ...prev,
        badges: [
          ...prev.badges,
          {
            id: `b-${Date.now()}`,
            name: badgeName,
            description: `Accomplished in live 3D experience!`,
            icon: '🌟',
            unlockedAt: 'Just now',
          },
        ],
      };
    });
    setTimeout(() => setBadgeToast(null), 4000);
  };

  // Launch a game
  const handleLaunchGame = (game: GameExperience) => {
    setSelectedGameForModal(null);
    if (game.isPlayable3D) {
      setActivePlayingGame(game);
    } else {
      // If it's another experience, load rainbow-obby as 3D playable demo for it
      const fallback3D = GAMES_DATA.find((g) => g.id === 'rainbow-obby') || GAMES_DATA[0];
      setActivePlayingGame({
        ...fallback3D,
        title: game.title,
      });
    }
  };

  // Add Robux
  const handleAddRobux = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      robux: prev.robux + amount,
    }));
  };

  // Buy Catalog Item
  const handleBuyItem = (item: CatalogItem) => {
    setUser((prev) => ({
      ...prev,
      robux: Math.max(0, prev.robux - item.price),
      inventoryIds: [...prev.inventoryIds, item.id],
      equippedItems: {
        ...prev.equippedItems,
        [item.category === 'hat' ? 'hat' : item.category === 'accessory' ? 'accessory' : item.category === 'face' ? 'face' : 'shirt']: item.id,
      },
    }));
  };

  // Update Avatar Outfit & Colors
  const handleUpdateAvatar = (colors: AvatarColors, equipped: UserProfileData['equippedItems']) => {
    setUser((prev) => ({
      ...prev,
      avatarColors: colors,
      equippedItems: equipped,
    }));
  };

  // Filter games
  const filteredGames = GAMES_DATA.filter((g) => {
    const matchesCat = categoryFilter === 'All' || g.category === categoryFilter;
    const matchesSearch = !searchQuery ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredGame = GAMES_DATA[0]; // Rainbow Obby

  return (
    <div className="min-h-screen bg-[#111216] text-[#f2f4f5] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {badgeToast && (
        <div className="fixed top-16 right-6 z-50 bg-[#1f2229] border border-amber-400/50 rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Badge Awarded!</span>
            <span className="text-xs font-bold text-white">{badgeToast}</span>
          </div>
        </div>
      )}

      {/* Navigation Topbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActivePlayingGame(null);
          setActiveTab(tab);
        }}
        user={user}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onSearch={(q) => {
          setSearchQuery(q);
          setActivePlayingGame(null);
          setActiveTab('discover');
        }}
      />

      {/* Slide-out Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActivePlayingGame(null);
          setActiveTab(tab);
        }}
        user={user}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {/* If user is actively playing a 3D Game, render the 3D player container */}
        {activePlayingGame ? (
          <div className="space-y-4">
            <GamePlayer3D
              game={activePlayingGame}
              user={user}
              onExit={() => setActivePlayingGame(null)}
              onAwardBadge={handleAwardBadge}
            />
          </div>
        ) : (
          <>
            {/* VIEW 1: DISCOVER / HOME */}
            {activeTab === 'discover' && (
              <div className="space-y-8">
                {/* Hero Featured Experience Banner */}
                {!searchQuery && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                    <div className="relative w-full h-72 sm:h-96">
                      <img
                        src={featuredGame.image}
                        alt={featuredGame.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/50 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#111216]/90 via-[#111216]/40 to-transparent" />

                      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 max-w-xl space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" /> FEATURED 3D EXPERIENCE
                          </span>
                          <span className="text-xs text-slate-300">
                            {featuredGame.activePlayers} Active Players
                          </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                          {featuredGame.title}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                          {featuredGame.description}
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                          <button
                            onClick={() => handleLaunchGame(featuredGame)}
                            className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/30 border border-emerald-400/30 flex items-center gap-2.5 cursor-pointer"
                          >
                            <Play className="w-5 h-5 fill-white" />
                            <span>PLAY NOW</span>
                          </button>
                          <button
                            onClick={() => setSelectedGameForModal(featuredGame)}
                            className="px-5 py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer border border-white/10"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter and Genre Tabs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-bold text-white">
                      {searchQuery ? `Search Results for "${searchQuery}"` : 'Recommended Experiences'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                    {['All', 'Obby', 'Action', 'Roleplay', 'Racing', 'Anime'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={(g) => setSelectedGameForModal(g)}
                    />
                  ))}
                </div>

                {/* Friend Activity Shelf */}
                <div className="bg-[#191b22] border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Friends Playing Now</h3>
                    </div>
                    <span className="text-xs text-slate-400">Join friends instantly</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                      onClick={() => handleLaunchGame(GAMES_DATA[0])}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                          J
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-white block">Jake</span>
                          <span className="text-[11px] text-slate-400 block truncate">Rainbow Obby: 50 Stages</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        Join →
                      </span>
                    </div>

                    <div
                      onClick={() => handleLaunchGame(GAMES_DATA[1])}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-bold text-xs text-white">
                          L
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-white block">Liam [Pro]</span>
                          <span className="text-[11px] text-slate-400 block truncate">Blade Ball: Deflect Arena</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        Join →
                      </span>
                    </div>

                    <div
                      onClick={() => handleLaunchGame(GAMES_DATA[2])}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-xs text-white">
                          S
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-white block">Speedy</span>
                          <span className="text-[11px] text-slate-400 block truncate">Speed Run: Neon City</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        Join →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: MARKETPLACE */}
            {activeTab === 'marketplace' && (
              <Marketplace
                user={user}
                onBuyItem={handleBuyItem}
                onOpenRobuxShop={() => setActiveTab('robux')}
              />
            )}

            {/* VIEW 3: AVATAR CUSTOMIZER */}
            {activeTab === 'avatar' && (
              <AvatarEditor
                user={user}
                onUpdateAvatar={handleUpdateAvatar}
              />
            )}

            {/* VIEW 4: CREATE / STUDIO */}
            {activeTab === 'create' && (
              <CreateStudio
                onLaunchTemplate={(mode) => {
                  const targetGame = GAMES_DATA.find((g) => g.gameMode === mode) || GAMES_DATA[0];
                  setActivePlayingGame(targetGame);
                }}
              />
            )}

            {/* VIEW 5: BUY ROBUX */}
            {activeTab === 'robux' && (
              <RobuxShop
                user={user}
                onAddRobux={handleAddRobux}
              />
            )}

            {/* VIEW 6: USER PROFILE */}
            {activeTab === 'profile' && (
              <UserProfile
                user={user}
                onOpenAvatarEditor={() => setActiveTab('avatar')}
              />
            )}
          </>
        )}
      </main>

      {/* Docked Chat & Friends Drawer */}
      <FriendsDrawer
        onJoinFriendGame={(g) => handleLaunchGame(g)}
      />

      {/* Game Detail Modal */}
      {selectedGameForModal && (
        <GameDetailModal
          game={selectedGameForModal}
          user={user}
          onClose={() => setSelectedGameForModal(null)}
          onLaunchGame={handleLaunchGame}
          onBuyGamepass={(passId, price) => {
            if (user.robux >= price) {
              sounds.playCoin();
              setUser((prev) => ({ ...prev, robux: prev.robux - price }));
              alert(`Purchased Gamepass! Remaining balance: ${user.robux - price} R$`);
            } else {
              alert(`Not enough Robux! You need ${price - user.robux} more.`);
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-[#0d0e11] py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rotate-12 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#0d0e11] -rotate-12" />
            </div>
            <span className="font-bold text-slate-400">ROBLOX</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Use</a>
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#parents" className="hover:text-slate-300 transition-colors">Parents Guide</a>
            <a href="#support" className="hover:text-slate-300 transition-colors">Support</a>
            <a href="#giftcards" className="hover:text-slate-300 transition-colors">Gift Cards</a>
          </div>

          <div>
            <span>© 2026 Roblox Corporation. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
