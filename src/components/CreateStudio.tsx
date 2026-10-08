import React, { useState } from 'react';
import { GameExperience } from '../types';
import { sounds } from '../utils/audio';
import { Sparkles, Code, Play, Plus, Check, Terminal, Layers, Box } from 'lucide-react';

interface CreateStudioProps {
  onLaunchTemplate: (mode: 'obby' | 'blade_ball' | 'speed_run') => void;
}

export const CreateStudio: React.FC<CreateStudioProps> = ({ onLaunchTemplate }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'killbrick' | 'trampoline' | 'leaderboard'>('killbrick');
  const [createdNotification, setCreatedNotification] = useState(false);

  const LUA_SCRIPTS = {
    killbrick: `-- Lava Kill Brick Script (Classic Roblox)
local lavaPart = script.Parent

local function onTouched(hit)
    local character = hit.Parent
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if humanoid and humanoid.Health > 0 then
        -- Play OOF sound & trigger respawn
        humanoid.Health = 0
    end
end

lavaPart.Touched:Connect(onTouched)
print("KillBrick initialized successfully.")`,
    trampoline: `-- Super Bounce Trampoline Spring
local pad = script.Parent
local BOUNCE_IMPULSE = 120

pad.Touched:Connect(function(hit)
    local rootPart = hit.Parent:FindFirstChild("HumanoidRootPart")
    if rootPart then
        rootPart.AssemblyLinearVelocity = Vector3.new(0, BOUNCE_IMPULSE, 0)
        local sound = Instance.new("Sound", pad)
        sound.SoundId = "rbxassetid://9114223171" -- Spring sound
        sound:Play()
    end
end)`,
    leaderboard: `-- Player Leaderstats & Checkpoints
game.Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local stage = Instance.new("IntValue")
    stage.Name = "Stage"
    stage.Value = 1
    stage.Parent = leaderstats

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 0
    coins.Parent = leaderstats
end)`,
  };

  const handleCreateNew = () => {
    sounds.playCoin();
    setCreatedNotification(true);
    setTimeout(() => setCreatedNotification(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Creator Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>ROBLOX STUDIO CREATOR HUB</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Experience Creations & Studio</h1>
          <p className="text-sm text-slate-400">
            Build 3D experiences, write Luau scripts, and publish to millions of players worldwide.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-lg transition-all shadow-md cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Experience</span>
        </button>
      </div>

      {createdNotification && (
        <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium flex items-center justify-between">
          <span>Created new place: <strong>Alex's Place #4</strong> with Starter Baseplate!</span>
          <button onClick={() => onLaunchTemplate('obby')} className="underline font-bold text-white cursor-pointer">
            Open in 3D Studio →
          </button>
        </div>
      )}

      {/* Creator Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#191b22] border border-white/10 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Total Creator Plays</span>
          <span className="text-2xl font-bold text-white font-mono">1.4M+</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+14.2% this month</span>
        </div>
        <div className="bg-[#191b22] border border-white/10 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Developer Robux (DevEx)</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">48,200 R$</span>
          <span className="text-[10px] text-slate-400 block mt-1">Eligible for cash out</span>
        </div>
        <div className="bg-[#191b22] border border-white/10 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Active Server Instances</span>
          <span className="text-2xl font-bold text-blue-400 font-mono">14</span>
          <span className="text-[10px] text-slate-400 block mt-1">Global edge routing</span>
        </div>
      </div>

      {/* Starter Templates */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-blue-400" />
          <span>Starter Place Templates</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Obby Template */}
          <div className="bg-[#191b22] border border-white/10 hover:border-white/20 rounded-xl p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl mb-3">
                🧗
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Obby Starter Pack</h3>
              <p className="text-xs text-slate-400 mb-4">
                Pre-configured stage checkpoints, lava killbricks, bouncy springs, and victory podium.
              </p>
            </div>
            <button
              onClick={() => onLaunchTemplate('obby')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test in 3D</span>
            </button>
          </div>

          {/* Blade Ball Arena Template */}
          <div className="bg-[#191b22] border border-white/10 hover:border-white/20 rounded-xl p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl mb-3">
                ⚔️
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Deflect Arena Template</h3>
              <p className="text-xs text-slate-400 mb-4">
                Homing projectile logic, parry hitboxes, AI opponents, and arena boundary ring.
              </p>
            </div>
            <button
              onClick={() => onLaunchTemplate('blade_ball')}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test in 3D</span>
            </button>
          </div>

          {/* Speed Run Template */}
          <div className="bg-[#191b22] border border-white/10 hover:border-white/20 rounded-xl p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl mb-3">
                ⚡
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Speed Run Template</h3>
              <p className="text-xs text-slate-400 mb-4">
                Hyper-speed booster pads, wall jumps, skyway ramps, and timer leaderboard.
              </p>
            </div>
            <button
              onClick={() => onLaunchTemplate('speed_run')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test in 3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Luau Script Inspector */}
      <div className="bg-[#191b22] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Roblox Luau Script Inspector</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveCodeTab('killbrick')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'killbrick' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              KillBrick.lua
            </button>
            <button
              onClick={() => setActiveCodeTab('trampoline')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'trampoline' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SpringPad.lua
            </button>
            <button
              onClick={() => setActiveCodeTab('leaderboard')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'leaderboard' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leaderstats.lua
            </button>
          </div>
        </div>

        <pre className="p-4 bg-black/60 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-white/5 mt-4">
          <code>{LUA_SCRIPTS[activeCodeTab]}</code>
        </pre>
      </div>
    </div>
  );
};
