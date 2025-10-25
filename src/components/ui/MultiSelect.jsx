import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function MultiSelect({ options, selected, onChange, colorScheme = 'blue' }) {
  const handleSelect = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const colors = {
    blue: {
        selected: 'bg-blue-600 hover:bg-blue-700 text-white',
        unselected: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
    },
    purple: {
        selected: 'bg-purple-600 hover:bg-purple-700 text-white',
        unselected: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Badge
          key={option}
          onClick={() => handleSelect(option)}
          className={`cursor-pointer transition-colors text-sm px-3 py-1.5 ${
            selected.includes(option) ? colors[colorScheme].selected : colors[colorScheme].unselected
          }`}
          variant={selected.includes(option) ? 'default' : 'secondary'}
        >
          {option}
        </Badge>
      ))}
    </div>
  );
}