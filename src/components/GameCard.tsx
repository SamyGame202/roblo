import React from 'react';
import { GameExperience } from '../types';
import { ThumbsUp, Users, Sparkles } from 'lucide-react';

interface GameCardProps {
  game: GameExperience;
  onClick: (game: GameExperience) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <div
      onClick={() => onClick(game)}
      className="group bg-[#191b22] hover:bg-[#20232c] border border-white/5 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col shadow-md hover:-translate-y-1"
    >
      {/* Thumbnail Aspect 16:9 */}
      <div className="relative w-full aspect-video bg-slate-800 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Playable in 3D badge */}
        {game.isPlayable3D && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-sm text-white font-bold text-[10px] rounded flex items-center gap-1 shadow-sm">
            <Sparkles className="w-2.5 h-2.5" /> 3D Playable
          </span>
        )}

        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-slate-200 text-[10px] rounded font-medium">
          {game.category}
        </span>
      </div>

      {/* Info Body */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors" title={game.title}>
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{game.creator}</p>
        </div>

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 mt-2">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold text-slate-300">{game.ratingPercent}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-300">{game.activePlayers}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
