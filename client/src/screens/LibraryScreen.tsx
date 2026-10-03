import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Song } from '../types/index.js';
import { SongRow } from '../components/SongRow.js';
import { UploadCloud, Music, Heart, FolderPlus, Play, Check, Plus } from 'lucide-react';

export const LibraryScreen: React.FC = () => {
  const {
    userUploadedSongs,
    addUploadedSong,
    playSong,
    likedSongs,
    openRoom,
  } = useAudio();
  const { joinRoom } = useSocket();

  const [activeTab, setActiveTab] = useState<'uploads' | 'favorites'>('uploads');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    // Create browser audio URL
    const objectUrl = URL.createObjectURL(file);
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

    const newSong: Song = {
      id: `upload-${Date.now()}`,
      title: fileNameWithoutExt,
      artist: 'Local Upload',
      album: 'My Uploads',
      durationSec: 180, // Default duration estimation
      audioUrl: objectUrl,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      genre: 'User Audio',
      mood: 'Personal',
      dominantColor: '#17202A',
      isUserUploaded: true,
      uploadedAt: Date.now(),
    };

    setTimeout(() => {
      addUploadedSong(newSong);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 pb-32 pt-2 px-4 max-w-md mx-auto select-none">
      {/* Header */}
      <section className="pt-2">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400 uppercase">
          <Music size={14} />
          <span>PERSONAL LIBRARY</span>
        </div>
        <h1 className="text-3xl font-serif tracking-tight text-content-primary mt-1">
          Your Music & Uploads
        </h1>
        <p className="text-xs text-content-secondary mt-1 leading-relaxed">
          Upload your own audio tracks to stream together in rooms with friends.
        </p>
      </section>

      {/* Upload Box */}
      <section className="relative rounded-3xl bg-surface-secondary/70 border-2 border-dashed border-border-highlight hover:border-content-secondary p-5 transition-all text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-primary border border-border-subtle flex items-center justify-center text-content-primary mb-3 shadow-md">
            {uploadSuccess ? (
              <Check size={22} className="text-emerald-400" />
            ) : (
              <UploadCloud size={22} />
            )}
          </div>

          <h3 className="text-sm font-semibold text-content-primary">
            {uploadSuccess ? 'Track Added to Your Library!' : 'Upload Audio Track'}
          </h3>
          <p className="text-[11px] text-content-muted mt-0.5 mb-3">
            Supports MP3, WAV, M4A from your phone or PC
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{isUploading ? 'Importing Audio...' : 'Select Audio File'}</span>
          </button>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'uploads'
              ? 'bg-surface-secondary text-content-primary border border-border-highlight'
              : 'text-content-muted hover:text-content-secondary'
          }`}
        >
          My Uploads ({userUploadedSongs.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'bg-surface-secondary text-content-primary border border-border-highlight'
              : 'text-content-muted hover:text-content-secondary'
          }`}
        >
          Liked Tracks ({likedSongs.size})
        </button>
      </div>

      {/* Content list */}
      {activeTab === 'uploads' ? (
        <section>
          {userUploadedSongs.length === 0 ? (
            <div className="text-center py-10 text-content-muted text-xs">
              <p>No uploaded tracks yet.</p>
              <p className="text-[10px] mt-1">Tap above to upload your favorite tracks.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {userUploadedSongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  showCover={true}
                  playlistContext={userUploadedSongs}
                  onOpenRoomForSong={async (s) => {
                    playSong(s);
                    await joinRoom(`room-${s.id}`);
                    openRoom(`room-${s.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <div className="text-xs text-content-secondary py-2">
            Songs saved to your favorites are accessible offline and can be queued anytime.
          </div>
        </section>
      )}
    </div>
  );
};
