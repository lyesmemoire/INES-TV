import React from 'react';
import ChannelCard from './ChannelCard';
import { Channel } from '../../types';

interface ChannelGridProps {
  channels: Channel[];
  activeChannel: Channel;
  onSelect: (c: Channel) => void;
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-4 bg-zinc-900/80 space-y-3">
        <div className="h-3.5 rounded-lg skeleton w-3/4" />
        <div className="h-3 rounded-lg skeleton w-1/3" />
      </div>
    </div>
  );
}

export default function ChannelGrid({ channels, activeChannel, onSelect, isLoading }: ChannelGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <div className="text-6xl mb-4">📺</div>
        <p className="text-lg font-semibold">Aucune chaîne disponible</p>
        <p className="text-sm mt-1">Essayez une autre catégorie</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {channels.map((channel, i) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          isActive={activeChannel.id === channel.id}
          index={i}
          onClick={() => onSelect(channel)}
        />
      ))}
    </div>
  );
}
