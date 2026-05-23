'use client';
interface AvatarProps {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-11 h-11', xl: 'w-16 h-16' };
const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-sm', xl: 'text-xl' };
const dotMap  = { sm: 'w-2 h-2 -bottom-px -right-px', md: 'w-2.5 h-2.5 bottom-0 right-0', lg: 'w-3 h-3 bottom-0 right-0', xl: 'w-3.5 h-3.5 bottom-0.5 right-0.5' };

const gradients = [
  'from-indigo-400 to-violet-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-purple-500',
];

function gradientFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return gradients[hash % gradients.length];
}

export default function Avatar({ src, name, size = 'md', online }: AvatarProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover object-top`} />
      ) : (
        <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center`}>
          <span className={`${textMap[size]} font-bold text-white`}>{initials}</span>
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute ${dotMap[size]} rounded-full border-2 ${online ? 'bg-emerald-400 border-white' : 'bg-slate-400 border-white'}`} />
      )}
    </div>
  );
}
