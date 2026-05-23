'use client';

const EMOJIS = ['😀','😂','😍','🥰','😎','🤔','😅','🙏','👍','❤️','🔥','✨','🎉','💯','😭','🤣','😊','😇','🥳','😴','🤯','😤','🥺','😏','🤗','💪','👏','🙌','🤝','💬'];

interface Props {
  onSelect: (emoji: string) => void;
  darkMode: boolean;
}

export default function EmojiPicker({ onSelect, darkMode }: Props) {
  return (
    <div className={`absolute bottom-16 left-0 w-64 p-3 rounded-2xl shadow-xl z-50 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-100'}`}>
      <div className="grid grid-cols-6 gap-1">
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => onSelect(e)}
            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
