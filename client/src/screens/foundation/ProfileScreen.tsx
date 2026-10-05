import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Music,
  Heart,
  Flame,
  Share2,
  Check,
  Disc3,
  Moon,
  Headphones,
  Award,
  LogOut,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { UserAvatar } from '../../components/ui/UserAvatar.js';
import { MOCK_USERS, MOCK_TRACKS } from '../../mockData.js';
import { useAuth } from '../../context/AuthContext.js';
import { useRoom } from '../../context/RoomContext.js';
import { usePlayer } from '../../context/PlayerContext.js';

export const ProfileScreen: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { joinRoom } = useRoom();
  const { playTrack } = usePlayer();
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const personality = currentUser.musicPersonality;

  const handleSharePersonality = () => {
    navigator.clipboard?.writeText?.(
      `My VibeRoom Sonic Archetype: "${personality.sonicArchetype}" (${personality.vibeTag})! Top genre: ${personality.topGenre} 🎧`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 pb-32 select-none">
      {/* Profile Header Hero */}
      <div className="relative rounded-hero overflow-hidden bg-gradient-to-br from-app-surface via-app-elevated to-app-surface border border-app-border p-6 sm:p-8 shadow-soft-1">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <UserAvatar user={currentUser} size="xl" showPresence={true} />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-section-heading md:text-page-title font-extrabold text-app-text">
                {currentUser.name}
              </h2>
              <Badge variant="accent">
                <Sparkles size={12} className="inline mr-1" />
                Active Listener
              </Badge>
            </div>
            <p className="text-meta text-app-muted">{currentUser.handle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? <Check size={14} /> : <Share2 size={14} />}
              onClick={handleSharePersonality}
            >
              {copied ? 'Copied Card!' : 'Share Taste'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut size={14} className="text-rose-400" />}
              onClick={logout}
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Music Personality Section (Gen-Z Social Experience - PRD Section 21) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
            <Sparkles size={20} className="text-app-accent" />
            <span>Music Personality & Sonic Archetype</span>
          </h3>
          <p className="text-meta text-app-muted">
            Calculated from your synchronized listening patterns across social rooms
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="space-y-2 p-5 border border-app-border">
            <div className="flex items-center gap-2 text-app-accent">
              <Music size={18} />
              <span className="text-meta font-bold uppercase tracking-wider">Top Genre</span>
            </div>
            <p className="text-section-heading font-extrabold text-app-text">
              {personality.topGenre}
            </p>
            <p className="text-meta-sm text-app-muted">Top 1% of late-night synth enthusiasts</p>
          </Card>

          <Card className="space-y-2 p-5 border border-app-border">
            <div className="flex items-center gap-2 text-app-accent">
              <Flame size={18} />
              <span className="text-meta font-bold uppercase tracking-wider">Sonic Archetype</span>
            </div>
            <p className="text-section-heading font-extrabold text-app-text">
              {personality.sonicArchetype}
            </p>
            <Badge variant="accent">{personality.vibeTag}</Badge>
          </Card>

          <Card className="space-y-2 p-5 border border-app-border">
            <div className="flex items-center gap-2 text-app-accent">
              <Clock size={18} />
              <span className="text-meta font-bold uppercase tracking-wider">Listening Time</span>
            </div>
            <p className="text-section-heading font-extrabold text-app-text">
              {personality.weeklyListeningHours} hrs
            </p>
            <p className="text-meta-sm text-app-muted">This week across 4 social rooms</p>
          </Card>
        </div>

        {/* Fun Personality Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-card bg-app-surface border border-app-border flex items-center gap-3">
            <Moon size={20} className="text-app-accent shrink-0" />
            <div>
              <p className="text-meta-sm font-bold text-app-muted uppercase">Peak Hours</p>
              <p className="text-body font-bold text-app-text">10 PM – 1 AM</p>
            </div>
          </div>

          <div className="p-3 rounded-card bg-app-surface border border-app-border flex items-center gap-3">
            <Award size={20} className="text-app-accent shrink-0" />
            <div>
              <p className="text-meta-sm font-bold text-app-muted uppercase">Top Artist</p>
              <p className="text-body font-bold text-app-text">The Weeknd</p>
            </div>
          </div>

          <div className="p-3 rounded-card bg-app-surface border border-app-border flex items-center gap-3">
            <Headphones size={20} className="text-app-accent shrink-0" />
            <div>
              <p className="text-meta-sm font-bold text-app-muted uppercase">Audio Vibe</p>
              <p className="text-body font-bold text-app-text">Night Drive 🌃</p>
            </div>
          </div>

          <div className="p-3 rounded-card bg-app-surface border border-app-border flex items-center gap-3">
            <Disc3 size={20} className="text-app-accent shrink-0" />
            <div>
              <p className="text-meta-sm font-bold text-app-muted uppercase">Rooms Joined</p>
              <p className="text-body font-bold text-app-text">32 Sessions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Music Match / Taste Compatibility (PRD Section 21) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
            <Heart size={20} className="text-rose-500" />
            <span>Music Match Compatibility</span>
          </h3>
          <span className="text-meta-sm text-app-muted">Based on shared sonic vibe</span>
        </div>

        <Card className="p-6 border border-app-border bg-gradient-to-br from-app-surface via-app-elevated/40 to-app-surface space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-body font-bold text-app-text flex items-center gap-2">
                <Sparkles size={16} className="text-app-accent" />
                Compare Sonic Taste With Friends
              </h4>
              <p className="text-meta text-app-muted max-w-lg">
                Invite friends to your listening sessions. As you vote on queue songs together in rooms, VibeRoom calculates your real-time compatibility percentage!
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={copied ? <Check size={14} /> : <Share2 size={14} />}
              onClick={handleSharePersonality}
              className="shrink-0"
            >
              {copied ? 'Link Copied!' : 'Invite Friends'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-app-border">
            <div className="p-3 rounded-card bg-app-surface/60 border border-app-border">
              <p className="text-meta-sm font-bold text-app-accent">1. Share Code</p>
              <p className="text-meta-sm text-app-muted mt-0.5">Send your room code or profile link</p>
            </div>
            <div className="p-3 rounded-card bg-app-surface/60 border border-app-border">
              <p className="text-meta-sm font-bold text-app-accent">2. Listen in Sync</p>
              <p className="text-meta-sm text-app-muted mt-0.5">React and vote on upcoming YouTube tracks</p>
            </div>
            <div className="p-3 rounded-card bg-app-surface/60 border border-app-border">
              <p className="text-meta-sm font-bold text-app-accent">3. Unlock Taste Score</p>
              <p className="text-meta-sm text-app-muted mt-0.5">Discover mutual music compatibility</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
