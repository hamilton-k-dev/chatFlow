'use client';
import React from 'react';
import { useChatContext } from '../ChatContext';

interface Props {
  memberIds: string[];
  size?: 'sm' | 'md';
}

const colors = [
  'bg-violet-400', 'bg-blue-400', 'bg-emerald-400',
  'bg-rose-400', 'bg-amber-400', 'bg-cyan-400',
];

function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return colors[hash % colors.length];
}

function MiniAvatar({ avatar, name, className, style }: { avatar: string; name: string; className: string; style?: React.CSSProperties }) {
  if (avatar) return <img src={avatar} alt={name} className={className} style={style} />;
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`${className} ${colorFor(name)} flex items-center justify-center`} style={style}>
      <span className="text-white font-semibold" style={{ fontSize: 9 }}>{initials}</span>
    </div>
  );
}

export default function GroupAvatarStack({ memberIds, size = 'md' }: Props) {
  const { users, currentUserId, currentUserAvatar, currentUserName } = useChatContext();
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
  const containerDim = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';

  const resolved = memberIds.slice(0, 3).map(id => {
    if (id === currentUserId) return { id, name: currentUserName, avatar: currentUserAvatar };
    return users.find(u => u.id === id);
  }).filter(Boolean);

  return (
    <div className={`relative ${containerDim} flex-shrink-0`}>
      {resolved.slice(0, 2).map((u, i) => (
        <MiniAvatar
          key={u!.id}
          avatar={u!.avatar}
          name={u!.name}
          className={`absolute ${dim} rounded-full object-cover object-top border-2 border-white`}
          style={{ top: i === 0 ? 0 : undefined, bottom: i === 1 ? 0 : undefined, left: i === 0 ? 0 : undefined, right: i === 1 ? 0 : undefined }}
        />
      ))}
      {resolved.length >= 3 && (
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${dim} rounded-full bg-violet-400 border-2 border-white flex items-center justify-center`}>
          <span className="text-white text-xs font-bold" style={{ fontSize: 8 }}>+{memberIds.length - 2}</span>
        </div>
      )}
    </div>
  );
}
