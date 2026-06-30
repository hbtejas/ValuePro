import {
  TrendingUp, Shield, Calculator, BarChart3, PieChart,
  DollarSign, Percent, Building2, Activity, Scale,
  ShieldCheck, Banknote, LineChart, ArrowUpRight, Gift,
  TrendingDown, Briefcase, Target, Sliders, Wallet,
  Landmark, Clock, Flame, GitBranch, Star,
  Award, AlertTriangle, Search, RefreshCw, Layers,
} from 'lucide-react';

export const CALCULATOR_CATEGORIES = [
  {
    id: 'valuation',
    name: 'Valuation Tools',
    description: 'Estimate the intrinsic value of stocks',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    calculators: [
      { id: 'intrinsic-value', name: 'Intrinsic Value', description: 'Graham, Lynch, EPV & DCF methods', icon: Calculator, popularity: 5 },
      { id: 'margin-of-safety', name: 'Margin of Safety', description: 'Is the stock undervalued?', icon: Shield, popularity: 5 },
      { id: 'dcf', name: 'DCF Valuation', description: 'Discounted Cash Flow analysis', icon: BarChart3, popularity: 5 },
      { id: 'pe-fair-value', name: 'P/E Fair Value', description: 'Fair price via industry P/E', icon: DollarSign, popularity: 4 },
      { id: 'peg-ratio', name: 'PEG Ratio', description: 'Price/Earnings to Growth', icon: Percent, popularity: 4 },
      { id: 'ev-ebitda', name: 'EV/EBITDA', description: 'Enterprise value multiple', icon: Building2, popularity: 3 },
      { id: 'price-to-book', name: 'Price-to-Book', description: 'P/B ratio for banks & financials', icon: Landmark, popularity: 3 },
      { id: 'combined-fair-value', name: 'Combined Fair Value', description: 'All methods compared side-by-side', icon: Layers, popularity: 5 },
    ],
  },
  {
    id: 'financial-health',
    name: 'Financial Health & Quality',
    description: 'Assess company financial strength',
    icon: ShieldCheck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    calculators: [
      { id: 'roe', name: 'ROE', description: 'Return on Equity', icon: Activity, popularity: 4 },
      { id: 'roce', name: 'ROCE', description: 'Return on Capital Employed', icon: Activity, popularity: 4 },
      { id: 'debt-to-equity', name: 'Debt-to-Equity', description: 'Leverage & risk assessment', icon: Scale, popularity: 4 },
      { id: 'interest-coverage', name: 'Interest Coverage', description: 'Can the company service debt?', icon: ShieldCheck, popularity: 3 },
      { id: 'screener-score', name: 'Screener Score', description: 'Weighted composite quality score', icon: Star, popularity: 4 },
      { id: 'piotroski-f-score', name: 'Piotroski F-Score', description: '9-point financial strength test', icon: Award, popularity: 3 },
      { id: 'altman-z-score', name: 'Altman Z-Score', description: 'Bankruptcy risk assessment', icon: AlertTriangle, popularity: 3 },
      { id: 'beneish-m-score', name: 'Beneish M-Score', description: 'Earnings manipulation detector', icon: Search, popularity: 2 },
    ],
  },
  {
    id: 'cash-flow-growth',
    name: 'Cash Flow & Growth',
    description: 'Analyze growth trends and cash flows',
    icon: LineChart,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    calculators: [
      { id: 'free-cash-flow', name: 'Free Cash Flow', description: 'OCF minus CapEx with trends', icon: Banknote, popularity: 4 },
      { id: 'cagr', name: 'CAGR', description: 'Compound Annual Growth Rate', icon: TrendingUp, popularity: 5 },
      { id: 'eps-growth', name: 'EPS Growth', description: 'Earnings per share trend', icon: ArrowUpRight, popularity: 4 },
      { id: 'inflation', name: 'Inflation Impact', description: 'Future cost & purchasing power', icon: Flame, popularity: 3 },
    ],
  },
  {
    id: 'returns-income',
    name: 'Returns & Income',
    description: 'Track returns, yields, and income',
    icon: Gift,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    calculators: [
      { id: 'dividend-yield', name: 'Dividend Yield', description: 'Annual yield percentage', icon: Gift, popularity: 4 },
      { id: 'total-shareholder-return', name: 'Total Shareholder Return', description: 'Price gains + dividends', icon: TrendingUp, popularity: 3 },
      { id: 'xirr', name: 'XIRR', description: 'Returns on irregular cashflows', icon: GitBranch, popularity: 4 },
      { id: 'drip', name: 'DRIP Simulator', description: 'Dividend reinvestment compounding', icon: RefreshCw, popularity: 3 },
    ],
  },
  {
    id: 'portfolio-planning',
    name: 'Portfolio & Planning',
    description: 'Plan investments and manage portfolios',
    icon: Briefcase,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    calculators: [
      { id: 'portfolio-allocation', name: 'Portfolio Allocation', description: 'Sector & cap allocation analysis', icon: PieChart, popularity: 4 },
      { id: 'position-size', name: 'Position Size', description: 'Risk-based position sizing', icon: Target, popularity: 3 },
      { id: 'asset-allocation', name: 'Asset Allocation', description: 'Age & risk-based asset mix', icon: Sliders, popularity: 4 },
      { id: 'sip', name: 'SIP Calculator', description: 'Systematic Investment Plan returns', icon: Wallet, popularity: 5 },
      { id: 'lump-sum', name: 'Lump Sum', description: 'One-time investment growth', icon: Banknote, popularity: 4 },
      { id: 'retirement', name: 'Retirement Planner', description: 'Corpus & SIP for retirement', icon: Clock, popularity: 4 },
    ],
  },
];

// Flat map for quick lookup
export const CALCULATORS = {};
CALCULATOR_CATEGORIES.forEach((cat) => {
  cat.calculators.forEach((calc) => {
    CALCULATORS[calc.id] = { ...calc, category: cat.id, categoryName: cat.name };
  });
});

export const getCalculatorInfo = (id) => CALCULATORS[id] || null;
export const getCategoryInfo = (id) => CALCULATOR_CATEGORIES.find((c) => c.id === id) || null;
