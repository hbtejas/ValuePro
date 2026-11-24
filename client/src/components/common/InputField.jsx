import { useState } from 'react';
import { Info } from 'lucide-react';

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
  disabled,
  className = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`space-y-sp-3 ${className}`}>
      <div className="flex items-center justify-between gap-sp-3">
        <label htmlFor={name} className="mono-label">
          {label}
          {required && <span className="text-accent ml-sp-1">*</span>}
        </label>

        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-muted hover:text-accent transition-colors duration-150"
              aria-label={`Info about ${label}`}
            >
              <Info size={14} />
            </button>
            {showTooltip && (
              <div
                role="tooltip"
                className="absolute z-50 bottom-full right-0 mb-sp-3 w-56 p-sp-5 panel shadow-xl text-sm text-muted"
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        {prefix && (
          <span className="absolute left-sp-5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted pointer-events-none">
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
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`input-field tabular-nums font-mono ${prefix ? 'pl-sp-9' : ''} ${suffix ? 'pr-sp-9' : ''} ${error ? '!border-accent !ring-1 !ring-accent/40' : ''}`}
        />
        {suffix && (
          <span className="absolute right-sp-5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="font-mono text-xs text-accent">
          ! {error}
        </p>
      )}
    </div>
  );
}
