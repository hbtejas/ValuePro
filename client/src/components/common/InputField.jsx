import { Info } from 'lucide-react';
import { useState } from 'react';

export default function InputField({
  label,
  name,
  type = 'number',
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  tooltip,
  error,
  min,
  max,
  step,
  required,
  className = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-loss ml-0.5">*</span>}
        </label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-gray-400 hover:text-brand-accent transition-colors"
              aria-label={`Info about ${label}`}
            >
              <Info size={14} />
            </button>
            {showTooltip && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 
                              glass-card text-xs text-gray-600 dark:text-gray-300 shadow-xl">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 
                                w-2 h-2 rotate-45 bg-white dark:bg-surface-dark-secondary border-r border-b 
                                border-surface-border dark:border-surface-dark-border" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium tabular-nums">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step || (type === 'number' ? 'any' : undefined)}
          className={`input-field tabular-nums ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} ${error ? 'border-loss ring-1 ring-loss/30' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-loss flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
