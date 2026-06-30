/**
 * Indian Number & Currency Formatting Utilities
 * 
 * Uses lakh/crore grouping (₹12,34,567 not ₹1,234,567).
 * Never uses US million/billion grouping.
 */

/**
 * Format a number with Indian lakh/crore comma grouping.
 * e.g., 1234567 → "12,34,567"
 */
export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  
  // Indian grouping: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const lastThree = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = formatted + ',' + lastThree;
  }
  
  const result = decPart === '00' ? intPart : `${intPart}.${decPart}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Format a number as INR currency with ₹ symbol and Indian grouping.
 * e.g., 1234567 → "₹12,34,567"
 */
export function formatINR(num, showDecimals = false) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  let intPart, decPart;
  if (showDecimals) {
    const parts = absNum.toFixed(2).split('.');
    intPart = parts[0];
    decPart = parts[1];
  } else {
    intPart = Math.round(absNum).toString();
    decPart = null;
  }
  
  // Indian grouping
  if (intPart.length > 3) {
    const lastThree = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = formatted + ',' + lastThree;
  }
  
  const formatted = decPart ? `${intPart}.${decPart}` : intPart;
  return `₹${isNegative ? '-' : ''}${formatted}`;
}

/**
 * Format a number in short form using Indian conventions.
 * e.g., 12500000 → "₹1.25 Cr", 4560000 → "₹45.6 L"
 */
export function formatShort(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const sign = isNegative ? '-' : '';
  
  if (absNum >= 10000000) {
    // Crore (1 Cr = 10,000,000)
    const crores = absNum / 10000000;
    return `₹${sign}${crores.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  } else if (absNum >= 100000) {
    // Lakh (1 L = 100,000)
    const lakhs = absNum / 100000;
    return `₹${sign}${lakhs.toFixed(2).replace(/\.?0+$/, '')} L`;
  } else if (absNum >= 1000) {
    // Thousand
    const thousands = absNum / 1000;
    return `₹${sign}${thousands.toFixed(1).replace(/\.?0+$/, '')}K`;
  }
  
  return `₹${sign}${absNum.toFixed(absNum % 1 === 0 ? 0 : 2)}`;
}

/**
 * Format a percentage with consistent rounding.
 * Prefixes with + or - and colors accordingly.
 * e.g., 14.567 → "+14.57%", -3.2 → "-3.20%"
 */
export function formatPercent(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format a date in Indian DD/MM/YYYY format.
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse a DD/MM/YYYY date string to a Date object.
 */
export function parseIndianDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

/**
 * Get color class based on value direction.
 * green = good/up, red = bad/down — matching Indian broker app conventions.
 */
export function getValueColor(value) {
  if (value > 0) return 'text-financial-positive';
  if (value < 0) return 'text-financial-negative';
  return 'text-gray-500';
}

/**
 * Get badge class based on status color string.
 */
export function getBadgeClass(color) {
  switch (color) {
    case 'green': return 'badge-green';
    case 'red': return 'badge-red';
    case 'amber': return 'badge-amber';
    default: return 'badge-amber';
  }
}
