import React, { useState } from 'react';
import { GameExperience, UserProfileData } from '../types';
import { Play, ThumbsUp, ThumbsDown, Star, Users, Eye, Sparkles, Check, Server, Shield } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameDetailModalProps {
  game: GameExperience;
  user: UserProfileData;
  onClose: () => void;
  onLaunchGame: (game: GameExperience) => void;
  onBuyGamepass: (passId: string, price: number) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  user,
  onClose,
  onLaunchGame,
  onBuyGamepass,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'store' | 'servers'>('about');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState('');
  const [upvotes, setUpvotes] = useState(game.ratingPercent);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePlay = () => {
    sounds.playClick();
    setIsLaunching(true);
    setLaunchStep('Allocating server...');

    setTimeout(() => {
      setLaunchStep('Loading blocky assets & scripts...');
      sounds.playCoin();
    }, 600);

    setTimeout(() => {
      setLaunchStep('Starting 3D engine...');
      setTimeout(() => {
        setIsLaunching(false);
        onLaunchGame(game);
      }, 500);
    }, 1200);
  };

  const handleVote = (type: 'up' | 'down') => {
    sounds.playClick();
    if (hasVoted === type) {
      setHasVoted(null);
    } else {
      setHasVoted(type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#191b22] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Hero Banner / Thumbnail */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191b22] via-[#191b22]/40 to-transparent" />

          {/* Badge indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white font-semibold text-xs rounded-md">
              {game.category}
            </span>
            {game.isPlayable3D && (
              <span className="px-2.5 py-1 bg-emerald-600/90 text-white font-bold text-xs rounded-md flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" /> Playable in 3D
              </span>
            )}
          </div>

          {/* Quick Play overlay on image bottom */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {game.title}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                By <span className="text-blue-400 font-semibold">{game.creator}</span>
              </p>
            </div>

            {/* Iconic Green Roblox Play Button */}
            <button
              onClick={handlePlay}
              disabled={isLaunching}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-base rounded-xl transition-all shadow-xl shadow-emerald-900/40 border border-emerald-400/30 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
              <span>{isLaunching ? launchStep : 'PLAY'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-xs">
            <div className="flex items-center gap-6 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{game.activePlayers}</span>
                <span className="text-slate-500">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{game.visits}</span>
                <span className="text-slate-500">Visits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">{upvotes}%</span>
                <span className="text-slate-500">Rating</span>
              </div>
            </div>

            {/* Voting & Favorite */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote('up')}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  hasVoted === 'up'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Thumbs Up"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  hasVoted === 'down'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Thumbs Down"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Favorite"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'about' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'store' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Store & Passes ({game.gamepasses.length})
            </button>
            <button
              onClick={() => setActiveTab('servers')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'servers' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Servers ({game.servers.length})
            </button>
          </div>

          {/* TAB: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{game.description}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Genre</span>
                  <span className="font-semibold text-white">{game.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Server Size</span>
                  <span className="font-semibold text-white">20 Players</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Updated</span>
                  <span className="font-semibold text-white">Today</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Allowed Gear</span>
                  <span className="font-semibold text-white">Melee / Navigation</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORE & PASSES */}
          {activeTab === 'store' && (
            <div className="space-y-3">
              {game.gamepasses.map((pass) => (
                <div
                  key={pass.id}
                  className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{pass.title}</h4>
                    <p className="text-[11px] text-slate-400">{pass.perk}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {pass.price} R$
                    </span>
                    <button
                      onClick={() => onBuyGamepass(pass.id, pass.price)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                      Buy Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SERVERS */}
          {activeTab === 'servers' && (
            <div className="space-y-3">
              {game.servers.map((srv, idx) => (
                <div
                  key={srv.id}
                  className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-semibold text-white block">Server #{idx + 1} ({srv.id})</span>
                      <span className="text-[11px] text-slate-400">
                        {srv.players}/{srv.maxPlayers} Players · {srv.ping}ms ping
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlay}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
