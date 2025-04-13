import { Minus, Plus } from 'lucide-react';

interface RoomCounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function RoomCounter({ label, value, onChange }: RoomCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="rounded-full border p-2 hover:border-gray-400 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
          disabled={value === 0}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center dark:text-gray-300">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="rounded-full border p-2 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}