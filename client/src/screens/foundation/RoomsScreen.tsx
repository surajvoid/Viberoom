import React from 'react';
import { Radio, Plus, KeyRound, Users, Disc3, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Artwork } from '../../components/ui/Artwork.js';
import { UserAvatar } from '../../components/ui/UserAvatar.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { useRoom } from '../../context/RoomContext.js';

export const RoomsScreen: React.FC = () => {
  const { roomsList, joinRoom, setIsCreateModalOpen, setIsJoinModalOpen } = useRoom();

  return (
    <div className="space-y-8 pb-36">
      {/* Banner / Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-hero bg-gradient-to-r from-app-surface via-app-elevated to-app-surface border border-app-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="live">Live Social Sync</Badge>
            <span className="text-meta-sm text-app-muted">Discord × Apple Music</span>
          </div>
          <h2 className="text-section-heading md:text-page-title font-extrabold text-app-text">
            Private Listening Rooms
          </h2>
          <p className="text-body text-app-muted max-w-md">
            Hang out in real-time, vote on upcoming tracks, send live reactions, and listen together in sync.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            icon={<KeyRound size={16} />}
            onClick={() => setIsJoinModalOpen(true)}
          >
            Enter Code
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Room
          </Button>
        </div>
      </div>

      {/* Active Live Rooms List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
            <Radio size={20} className="text-rose-500 animate-pulse" />
            <span>Active Rooms Right Now</span>
          </h3>
          <span className="text-meta-sm text-app-muted">{roomsList.length} live rooms</span>
        </div>

        {roomsList.length === 0 ? (
          <EmptyState
            type="rooms"
            title="No active rooms right now"
            description="Launch a private room to invite friends, vote democratically on upcoming songs, and listen in sync!"
            actionLabel="Launch a Room"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomsList.map((room) => {
              const modeBadge = {
                democratic: { label: 'Democratic Voting', variant: 'accent' as const },
                dj: { label: 'Host DJ Mode', variant: 'default' as const },
                chill: { label: 'Chillout Lounge', variant: 'outline' as const },
              }[room.mode];

              return (
                <Card
                  key={room.id}
                  interactive={true}
                  onClick={() => joinRoom(room.id)}
                  className="flex flex-col justify-between p-5 space-y-4 border border-app-border hover:border-app-border-strong group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="live">LIVE</Badge>
                        <Badge variant={modeBadge.variant}>{modeBadge.label}</Badge>
                      </div>
                      <span className="flex items-center gap-1.5 text-meta-sm font-semibold text-app-accent">
                        <Users size={14} />
                        {room.listenerCount} listeners
                      </span>
                    </div>

                    <div>
                      <h4 className="text-section-heading font-bold text-app-text group-hover:text-app-accent transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-meta text-app-muted line-clamp-2 mt-1">
                        {room.description}
                      </p>
                    </div>
                  </div>

                  {/* Now Playing in Room & Participants */}
                  <div className="pt-3 border-t border-app-border space-y-3">
                    {room.currentTrack && (
                      <div className="flex items-center gap-3 bg-app-elevated/40 p-2.5 rounded-chip">
                        <Artwork
                          src={room.currentTrack.artworkSvg}
                          alt={room.currentTrack.title}
                          size="xs"
                          rounded="chip"
                          isPlaying={true}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-meta font-bold text-app-text truncate">
                            {room.currentTrack.title}
                          </p>
                          <p className="text-meta-sm text-app-muted truncate">
                            {room.currentTrack.artist}
                          </p>
                        </div>
                        <Disc3 size={18} className="text-app-accent animate-spin duration-3000" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        {room.participants.slice(0, 4).map((p, i) => (
                          <UserAvatar
                            key={i}
                            user={p.user}
                            size="xs"
                            showPresence={false}
                            className="border-2 border-app-surface"
                          />
                        ))}
                        {room.participants.length > 4 && (
                          <span className="w-6 h-6 rounded-full bg-app-elevated border-2 border-app-surface text-[10px] font-bold flex items-center justify-center text-app-text">
                            +{room.participants.length - 4}
                          </span>
                        )}
                      </div>

                      <span className="text-meta-sm font-mono text-app-muted">
                        Code: <strong className="text-app-text font-bold">#{room.code}</strong>
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
