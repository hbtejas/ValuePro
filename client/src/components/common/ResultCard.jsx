import { Info } from 'lucide-react';
import { useState } from 'react';
import { getBadgeClass } from '../../utils/formatters';

export default function ResultCard({ label, value, subValue, color, tooltip, large, className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`glass-card p-4 lg:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-brand-accent transition-colors"
              aria-label={`Info: ${label}`}
            >
              <Info size={14} />
            </button>
            {showTooltip && (
              <div className="absolute z-50 bottom-full right-0 mb-2 w-56 p-3 
                              glass-card text-xs text-gray-600 dark:text-gray-300 shadow-xl">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`tabular-nums font-bold ${large ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'} 
                        ${color === 'green' ? 'text-gain' : color === 'red' ? 'text-loss' : color === 'amber' ? 'text-neutral' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </div>

      {subValue && (
        <div className="mt-1.5">
          {typeof subValue === 'string' ? (
            <span className={`${color ? getBadgeClass(color) : 'text-xs text-gray-500'}`}>
              {subValue}
            </span>
          ) : (
            subValue
          )}
        </div>
      )}
    </div>
  );
}
