import React, { useState } from 'react';
import { useUser, AVATAR_OPTIONS } from '../context/UserContext.js';
import { User, Sparkles, Check, X, Headphones, Radio } from 'lucide-react';

export const UserOnboardingModal: React.FC = () => {
  const { currentUser, updateProfile, isProfileModalOpen, closeProfileModal, hasCustomProfile } = useUser();
  const [name, setName] = useState(hasCustomProfile ? currentUser.name : '');
  const [handle, setHandle] = useState(hasCustomProfile ? currentUser.handle : '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatarUrl || AVATAR_OPTIONS[0]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile(name, handle, selectedAvatar);
    closeProfileModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface-secondary border border-border-highlight rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {hasCustomProfile && (
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-2 text-content-muted hover:text-content-primary rounded-full hover:bg-surface-tertiary transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono tracking-wider uppercase mb-2">
            <Radio size={12} />
            <span>{hasCustomProfile ? 'EDIT PROFILE' : 'JOIN VIBEROOM'}</span>
          </div>
          <h2 className="text-2xl font-serif tracking-tight text-content-primary">
            {hasCustomProfile ? 'Your Music Identity' : 'Who is listening?'}
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Choose your name and avatar to sync songs & chat in real time with friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-content-muted mb-2 text-center">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-2.5 justify-items-center">
              {AVATAR_OPTIONS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedAvatar(url)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === url
                      ? 'border-emerald-400 scale-105 shadow-lg shadow-emerald-500/30'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-95'
                  }`}
                >
                  <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                  {selectedAvatar === url && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-content-muted mb-1">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                <User size={15} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!handle || handle === name.toLowerCase().replace(/\s+/g, '_')) {
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                  }
                }}
                placeholder="Enter your name..."
                className="w-full bg-surface-primary border border-border-subtle rounded-xl py-2.5 pl-9 pr-3 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus={!hasCustomProfile}
              />
            </div>
          </div>

          {/* Handle Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-content-muted mb-1">
              Username Handle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted text-xs font-mono">
                @
              </div>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="username"
                className="w-full bg-surface-primary border border-border-subtle rounded-xl py-2.5 pl-8 pr-3 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
          >
            <Headphones size={15} />
            <span>{hasCustomProfile ? 'Save Profile' : 'Start Listening Together'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
