import { useEffect, useState } from 'react';

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({ value, onChange }: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (index: number, newValue: number) => {
    const updatedValue: [number, number] = [...localValue] as [number, number];
    updatedValue[index] = newValue;
    
    if (index === 0 && newValue > localValue[1]) {
      updatedValue[1] = newValue;
    } else if (index === 1 && newValue < localValue[0]) {
      updatedValue[0] = newValue;
    }
    
    setLocalValue(updatedValue);
  };

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum</label>
          <div className="mt-1 flex items-center">
            <span className="text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={localValue[0]}
              onChange={(e) => handleChange(0, Number(e.target.value))}
              onBlur={handleBlur}
              className="ml-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum</label>
          <div className="mt-1 flex items-center">
            <span className="text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={localValue[1]}
              onChange={(e) => handleChange(1, Number(e.target.value))}
              onBlur={handleBlur}
              className="ml-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="10000"
          value={localValue[0]}
          onChange={(e) => handleChange(0, Number(e.target.value))}
          onMouseUp={handleBlur}
          onTouchEnd={handleBlur}
          className="range-slider absolute h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        />
        <input
          type="range"
          min="0"
          max="10000"
          value={localValue[1]}
          onChange={(e) => handleChange(1, Number(e.target.value))}
          onMouseUp={handleBlur}
          onTouchEnd={handleBlur}
          className="range-slider absolute h-1 w-full cursor-pointer appearance-none rounded-lg bg-transparent"
        />
      </div>
    </div>
  );
}