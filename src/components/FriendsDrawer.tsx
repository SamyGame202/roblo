import React, { useState } from 'react';
import { Friend, GameExperience } from '../types';
import { FRIENDS_LIST, GAMES_DATA } from '../data/mockData';
import { sounds } from '../utils/audio';
import { MessageSquare, Users, ChevronUp, ChevronDown, Play, Send } from 'lucide-react';

interface FriendsDrawerProps {
  onJoinFriendGame: (game: GameExperience) => void;
}

export const FriendsDrawer: React.FC<FriendsDrawerProps> = ({ onJoinFriendGame }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'chat'>('friends');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<{ [friendId: string]: { sender: string; text: string }[] }>({
    f1: [
      { sender: 'Jake', text: 'Hey, join my server on Rainbow Obby!' },
      { sender: 'You', text: 'On my way!' },
    ],
    f2: [
      { sender: 'Liam [Pro]', text: 'blade ball tournament starting soon' },
    ],
  });

  const toggleOpen = () => {
    sounds.playClick();
    setIsOpen(!isOpen);
  };

  const handleJoin = (friend: Friend) => {
    if (friend.gameId) {
      const g = GAMES_DATA.find((x) => x.id === friend.gameId);
      if (g) {
        sounds.playCoin();
        onJoinFriendGame(g);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !messageInput.trim()) return;

    const fId = selectedFriend.id;
    setMessages((prev) => ({
      ...prev,
      [fId]: [...(prev[fId] || []), { sender: 'You', text: messageInput.trim() }],
    }));

    const textSent = messageInput.trim();
    setMessageInput('');

    // Simulated quick response from friend
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [fId]: [...(prev[fId] || []), { sender: selectedFriend.displayName, text: 'sounds good, see ya in game!' }],
      }));
    }, 1200);
  };

  const onlineFriends = FRIENDS_LIST.filter((f) => f.status !== 'offline');

  return (
    <div className="fixed bottom-0 right-4 z-40">
      {/* Minimized Docked Bar */}
      {!isOpen ? (
        <button
          onClick={toggleOpen}
          className="flex items-center gap-3 px-4 py-2.5 bg-[#191b22] hover:bg-[#20232c] border border-b-0 border-white/10 rounded-t-xl text-white shadow-2xl transition-all cursor-pointer text-xs font-semibold"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <span>Chat & Friends ({onlineFriends.length})</span>
          <ChevronUp className="w-4 h-4 text-slate-400" />
        </button>
      ) : (
        /* Expanded Messenger Window */
        <div className="w-80 sm:w-96 bg-[#191b22] border border-b-0 border-white/10 rounded-t-2xl shadow-2xl flex flex-col h-96 overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedFriend(null);
                  setActiveTab('friends');
                }}
                className={`text-xs font-bold px-2 py-1 rounded cursor-pointer ${
                  activeTab === 'friends' && !selectedFriend ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Friends ({onlineFriends.length})
              </button>
              {selectedFriend && (
                <span className="text-xs text-blue-400 font-bold truncate max-w-[120px]">
                  · {selectedFriend.displayName}
                </span>
              )}
            </div>

            <button
              onClick={toggleOpen}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-3">
            {!selectedFriend ? (
              /* Friends List */
              <div className="space-y-2">
                {FRIENDS_LIST.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => setSelectedFriend(f)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                          style={{ backgroundColor: f.avatarColor }}
                        >
                          {f.displayName.charAt(0)}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#191b22] ${
                            f.status === 'in-game'
                              ? 'bg-blue-400'
                              : f.status === 'online'
                              ? 'bg-emerald-500'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div className="truncate">
                        <span className="text-xs font-semibold text-white block truncate">{f.displayName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {f.currentGame ? f.currentGame : f.status === 'online' ? 'Website Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    {f.status === 'in-game' && f.gameId && (
                      <button
                        onClick={() => handleJoin(f)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>Join</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Direct Chat with selected friend */
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {(messages[selectedFriend.id] || []).map((m, i) => {
                    const isMe = m.sender === 'You';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col text-xs ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-500 mb-0.5">{m.sender}</span>
                        <div
                          className={`p-2 rounded-xl max-w-[80%] leading-relaxed ${
                            isMe ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-200'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/10 mt-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${selectedFriend.displayName}...`}
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
