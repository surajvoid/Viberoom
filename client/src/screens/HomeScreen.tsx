import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext.js';
import { useAudio } from '../context/AudioContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Song, Playlist, TopChart } from '../types/index.js';
import { api } from '../services/api.js';
import { EditorialTitle } from '../components/EditorialTitle.js';
import { SongRow } from '../components/SongRow.js';
import {
  Radio,
  Users,
  Play,
  Sparkles,
  Flame,
  ArrowRight,
  KeyRound,
  Heart,
  Disc3,
  Copy,
  Check,
} from 'lucide-react';

interface HomeScreenProps {
  onOpenRoom: (roomId: string) => void;
  onOpenMusicMatch: () => void;
  onOpenJoinCodeModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenRoom,
  onOpenMusicMatch,
  onOpenJoinCodeModal,
}) => {
  const { currentUser } = useUser();
  const { playSong } = useAudio();
  const { joinRoom } = useSocket();

  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [topCharts, setTopCharts] = useState<TopChart[]>([]);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    api.getSongs().then(setSongs);
    api.getPlaylists().then(setPlaylists);
    api.getTopCharts().then(setTopCharts);
  }, []);

  const featuredPlaylist = playlists[0];

  const handleQuickJoinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    const code = roomCodeInput.trim();
    await joinRoom(code);
    onOpenRoom(code);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-7 pb-32 pt-2 px-4 max-w-md mx-auto select-none">
      {/* Greeting Editorial */}
      <section className="pt-2">
        <span className="text-xs font-mono tracking-widest text-content-muted uppercase">
          Welcome back, {currentUser.name}
        </span>
        <h1 className="text-3xl font-serif tracking-tight text-content-primary mt-1">
          Music Is Better Together
        </h1>
      </section>

      {/* Groic Signature: 1-Tap Join with Room Code Bar */}
      <section className="p-4 rounded-3xl bg-surface-secondary/80 border border-border-subtle shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <KeyRound size={13} />
            <span>JOIN ROOM WITH CODE</span>
          </div>
          <span className="text-[10px] text-content-muted font-mono">INSTANT SYNC</span>
        </div>

        <form onSubmit={handleQuickJoinCode} className="flex items-center gap-2">
          <input
            type="text"
            value={roomCodeInput}
            maxLength={8}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            placeholder="ENTER 4-DIGIT CODE (e.g. 8492)"
            className="flex-1 bg-surface-primary border border-border-subtle rounded-xl py-2.5 px-3 font-mono text-xs text-content-primary placeholder-content-muted tracking-widest uppercase focus:outline-none focus:border-content-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!roomCodeInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shadow-md"
          >
            Join
          </button>
        </form>
      </section>

      {/* Active Live Rooms Carousel */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono tracking-widest uppercase text-content-muted">
            TRENDING LIVE ROOMS
          </span>
          <span className="text-xs text-content-muted">Live Sync</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Room 1 */}
          <div
            onClick={async () => {
              await joinRoom('8492');
              onOpenRoom('8492');
            }}
            className="p-3.5 rounded-2xl bg-surface-primary border border-border-subtle hover:border-border-highlight cursor-pointer flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode('8492');
                  }}
                  className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border-subtle text-[9px] font-mono text-content-secondary hover:text-white flex items-center gap-1"
                >
                  {copiedCode === '8492' ? <Check size={9} className="text-emerald-400" /> : <Copy size={9} />}
                  <span>8492</span>
                </button>
              </div>
              <h3 className="font-serif text-sm font-semibold text-content-primary truncate">
                LATE NIGHT BOLLYWOOD
              </h3>
              <p className="text-[10px] text-content-secondary truncate mt-0.5">
                Apna Bana Le
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-[10px] font-mono text-content-muted">
              <span>1,284 listening</span>
              <span className="font-semibold text-content-primary group-hover:translate-x-0.5 transition-transform">
                Join →
              </span>
            </div>
          </div>

          {/* Room 2 */}
          <div
            onClick={async () => {
              await joinRoom('5120');
              onOpenRoom('5120');
            }}
            className="p-3.5 rounded-2xl bg-surface-primary border border-border-subtle hover:border-border-highlight cursor-pointer flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode('5120');
                  }}
                  className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border-subtle text-[9px] font-mono text-content-secondary hover:text-white flex items-center gap-1"
                >
                  {copiedCode === '5120' ? <Check size={9} className="text-emerald-400" /> : <Copy size={9} />}
                  <span>5120</span>
                </button>
              </div>
              <h3 className="font-serif text-sm font-semibold text-content-primary truncate">
                LO-FI & CHILL
              </h3>
              <p className="text-[10px] text-content-secondary truncate mt-0.5">
                Midnight Lo-Fi
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-[10px] font-mono text-content-muted">
              <span>734 listening</span>
              <span className="font-semibold text-content-primary group-hover:translate-x-0.5 transition-transform">
                Join →
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* Groic Top Charts Section (India & Global) */}
      {topCharts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-content-muted">
              TOP CHARTS
            </span>
            <span className="text-xs text-content-muted font-mono">India & Global</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {topCharts.map((chart) => (
              <div
                key={chart.id}
                onClick={() => {
                  if (chart.songs.length > 0) {
                    playSong(chart.songs[0], chart.songs);
                  }
                }}
                className="group relative rounded-2xl overflow-hidden bg-surface-primary border border-border-subtle p-3 cursor-pointer hover:border-border-highlight transition-all"
              >
                <img
                  src={chart.coverUrl}
                  alt={chart.title}
                  className="w-full aspect-square rounded-xl object-cover mb-2 group-hover:scale-105 transition-transform"
                />
                <div className="text-xs font-bold text-content-primary truncate font-serif">
                  {chart.title}
                </div>
                <div className="text-[10px] text-content-muted truncate mt-0.5">
                  {chart.subtitle}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
