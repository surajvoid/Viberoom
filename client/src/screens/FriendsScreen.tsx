import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.js';
import { useSocket } from '../context/SocketContext.js';
import { api } from '../services/api.js';
import { Radio, Sparkles, Heart, MessageCircle, Users, Copy, Check, Share2, KeyRound, ArrowRight } from 'lucide-react';

interface FriendsScreenProps {
  onOpenRoom: (roomId: string) => void;
  onOpenMusicMatch: () => void;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({
  onOpenRoom,
  onOpenMusicMatch,
}) => {
  const { currentUser } = useUser();
  const { activeRoom, joinRoom, createRoom } = useSocket();
  const [friendsActivity, setFriendsActivity] = useState<any[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    api.getFriendsActivity().then(setFriendsActivity);
  }, []);

  const currentRoomCode = activeRoom?.code || '8492';

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}?room=${currentRoomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my VibeRoom',
          text: `Listen to music with me in real-time on VibeRoom! Use code: ${currentRoomCode}`,
          url: inviteUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported, fallback to clipboard
      }
    }
    navigator.clipboard.writeText(`Listen with me on VibeRoom! Room code: ${currentRoomCode} - ${inviteUrl}`);
    setShareFeedback('Invite link copied!');
    setTimeout(() => setShareFeedback(null), 2500);
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim();
    if (!code) return;
    await joinRoom(code);
    onOpenRoom(code);
    setJoinCodeInput('');
  };

  const handleCreatePrivateSession = async () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    await createRoom(`Private Session #${newCode}`, 'friends');
    await joinRoom(newCode);
    onOpenRoom(newCode);
  };

  const otherMember = activeRoom?.members?.find((m) => m.user.id !== currentUser.id);

  return (
    <div className="flex flex-col gap-6 pb-32 pt-2 px-4 max-w-md mx-auto select-none">
      {/* Header */}
      <section className="pt-2">
        <span className="text-xs font-mono tracking-widest text-content-muted uppercase">
          FRIENDS & SOCIAL
        </span>
        <h1 className="text-3xl font-serif tracking-tight text-content-primary mt-1">
          Listen Together
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Synchronize audio with friends in real time, react together, and chat.
        </p>
      </section>

      {/* Invite Friends & Room Code Hub */}
      <section className="p-4 rounded-3xl bg-surface-primary border border-border-subtle shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <Radio size={13} />
            <span>YOUR ROOM INVITE CODE</span>
          </div>
          <span className="text-[10px] font-mono text-content-muted uppercase">SYNC AUDIO</span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle mb-3">
          <div>
            <div className="text-[10px] font-mono text-content-muted uppercase">ACTIVE ROOM CODE</div>
            <div className="font-mono text-2xl font-bold tracking-widest text-content-primary mt-0.5">
              {currentRoomCode}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(currentRoomCode)}
              className="px-3 py-2 rounded-xl bg-surface-tertiary hover:bg-white/10 active:scale-95 border border-border-subtle text-xs font-mono text-content-primary flex items-center gap-1.5 transition-all shadow-sm"
              title="Copy Room Code"
            >
              {copiedCode === currentRoomCode ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareInvite}
              className="px-3.5 py-2 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-95 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {shareFeedback && (
          <div className="mb-3 text-center text-xs font-mono text-emerald-400 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            ✓ {shareFeedback}
          </div>
        )}

        {/* Join Friend's Room Input */}
        <form onSubmit={handleJoinWithCode} className="flex items-center gap-2 pt-1 border-t border-border-subtle/40">
          <div className="relative flex-1">
            <input
              type="text"
              value={joinCodeInput}
              maxLength={8}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="ENTER FRIEND'S 4-DIGIT CODE"
              className="w-full bg-surface-secondary border border-border-subtle rounded-xl py-2 px-3 font-mono text-xs text-content-primary placeholder-content-muted tracking-widest uppercase focus:outline-none focus:border-content-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!joinCodeInput.trim()}
            className="px-4 py-2 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            Connect
          </button>
        </form>
      </section>

      {/* Real-Time Connected Listeners in Active Room */}
      {activeRoom && activeRoom.members && activeRoom.members.length > 0 && (
        <section className="p-4 rounded-3xl bg-surface-primary border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-content-muted">
              CONNECTED IN ROOM ({activeRoom.members.length})
            </span>
            <button
              onClick={() => onOpenRoom(activeRoom.code || activeRoom.id)}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Room</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2">
            {activeRoom.members.map((member) => (
              <div
                key={member.socketId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary/70 border border-border-subtle"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.name}
                    className="w-8 h-8 rounded-full object-cover border border-border-subtle flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-content-primary truncate">
                      {member.user.name} {member.user.id === currentUser.id && '(You)'}
                    </div>
                    <div className="text-[10px] text-content-muted truncate">
                      @{member.user.handle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SYNCED</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Music Taste Match / Chemistry Card */}
      <section
        onClick={onOpenMusicMatch}
        className="relative rounded-3xl bg-gradient-to-br from-[#1C1620] via-surface-primary to-surface-secondary border border-border-subtle p-5 cursor-pointer hover:border-border-highlight transition-all active:scale-[0.99] overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-rose-300">
            <Sparkles size={13} />
            <span>MUSIC CHEMISTRY MATCH</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-content-muted">LIVE TASTE</span>
        </div>

        <div className="flex items-center justify-between my-3">
          <div>
            <h2 className="text-lg font-serif tracking-tight text-content-primary">
              {otherMember ? `Match with ${otherMember.user.name}` : `${currentUser.name}’s Music Match`}
            </h2>
            <p className="text-xs text-content-secondary mt-0.5">
              {otherMember
                ? 'Calculated from shared listening habits & library'
                : 'Connect with a friend to unlock compatibility and shared playlists'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-serif font-bold text-rose-400">
              {otherMember ? '88%' : '—'}
            </div>
            <div className="text-[10px] font-mono text-content-muted uppercase">Match</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-content-secondary">
          <span>Tap to explore chemistry</span>
          <span className="font-semibold text-content-primary">View Details →</span>
        </div>
      </section>

      {/* Friends Live Activity / Clean Social State */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono tracking-widest uppercase text-content-muted">
            LIVE FRIENDS FEED
          </span>
          <span className="text-xs text-content-muted font-mono">
            {friendsActivity.length > 0 ? `${friendsActivity.length} active` : '0 online'}
          </span>
        </div>

        {friendsActivity.length > 0 ? (
          <div className="space-y-3">
            {friendsActivity.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-surface-primary border border-border-subtle hover:border-border-highlight transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-9 h-9 rounded-full object-cover border border-border-subtle"
                    />
                    <div>
                      <div className="text-xs font-semibold text-content-primary">
                        {item.user.name}
                      </div>
                      <div className="text-[10px] text-content-muted">
                        Listening {item.activity.sinceMinutes}m ago
                      </div>
                    </div>
                  </div>

                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-secondary/70 border border-border-subtle/50 mb-3">
                  <img
                    src={item.activity.song.coverUrl}
                    alt={item.activity.song.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-content-primary truncate">
                      {item.activity.song.title}
                    </div>
                    <div className="text-[11px] text-content-secondary truncate">
                      {item.activity.song.artist}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={async () => {
                      await joinRoom(item.activity.roomId || '8492');
                      onOpenRoom(item.activity.roomId || '8492');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-tertiary hover:bg-white/10 active:scale-95 border border-border-subtle text-xs font-medium text-content-primary flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Radio size={13} className="text-emerald-400" />
                    <span>Listen Together</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-surface-primary border border-border-subtle text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-content-muted mb-3">
              <Users size={20} />
            </div>
            <h3 className="font-serif text-base font-semibold text-content-primary">
              No Friends Online Right Now
            </h3>
            <p className="text-xs text-content-secondary max-w-xs mt-1 mb-4 leading-relaxed">
              Share your room code with friends to stream synchronized YouTube music, send floating reactions, and listen together.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareInvite}
                className="px-4 py-2.5 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
              >
                <Share2 size={13} />
                <span>Invite Friends</span>
              </button>
              <button
                onClick={handleCreatePrivateSession}
                className="px-4 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary active:scale-95 border border-border-subtle text-xs font-medium text-content-primary transition-all"
              >
                Start Private Room
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
