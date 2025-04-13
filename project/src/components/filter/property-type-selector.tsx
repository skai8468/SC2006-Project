interface PropertyTypeSelectorProps {
  types: string[];
  selected: string[];
  onChange: (types: string[]) => void;
}

export function PropertyTypeSelector({ types, selected, onChange }: PropertyTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => {
            onChange(
              selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type]
            );
          }}
          className={`flex h-24 flex-col items-center justify-center rounded-lg border p-4 transition-colors ${
            selected.includes(type)
              ? 'border-blue-500 bg-blue-50 text-blue-500 dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-400'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium">{type}</span>
        </button>
      ))}
    </div>
  );
}