import { useState } from 'react';
import { Info } from 'lucide-react';
import { getBadgeClass } from '../../utils/formatters';

export default function ResultCard({ label, value, subValue, color, tooltip, large, className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const valueColor =
    color === 'green' ? 'text-positive' :
    color === 'red' ? 'text-accent' :
    color === 'amber' ? 'text-warning' :
    'text-ink';

  const accentLine =
    color === 'green' ? 'bg-positive' :
    color === 'red' ? 'bg-accent' :
    color === 'amber' ? 'bg-warning' :
    '';

  return (
    <div className={`panel relative overflow-hidden p-sp-6 hover:border-accent/40 transition-colors duration-150 ${className}`}>
      {accentLine && <div className={`absolute top-0 left-0 right-0 h-px ${accentLine}`} />}
      <div className="flex items-start justify-between gap-sp-3 mb-sp-5">
        <span className="mono-label">{label}</span>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="text-muted hover:text-accent transition-colors duration-150"
              aria-label={`Info: ${label}`}
            >
              <Info size={14} />
            </button>
            {showTooltip && (
              <div role="tooltip" className="absolute z-50 bottom-full right-0 mb-sp-3 w-56 p-sp-5 panel shadow-xl text-sm text-muted">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`font-mono font-semibold tabular-nums break-words ${large ? 'text-3xl' : 'text-2xl'} ${valueColor}`}>
        {value}
      </div>

      {subValue && (
        <div className="mt-sp-5">
          {typeof subValue === 'string' ? (
            <span className={color ? getBadgeClass(color) : 'font-mono text-xs text-muted'}>
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
