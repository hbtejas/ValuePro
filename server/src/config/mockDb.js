const bcrypt = require('bcryptjs');

const db = {
  users: [],
  stocks: [],
  portfolios: [],
  histories: []
};

// Seed stocks with sample data for autocomplete and lookup
const seedStocks = [
  {
    ticker: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Oil & Gas / Conglomerate',
    fundamentals: {
      eps: 97.78,
      bookValue: 1087.5,
      totalDebt: 316740,
      shareholdersEquity: 735400,
      ebit: 124500,
      ebitda: 167800,
      marketCap: 1998000,
      promoterHolding: 50.33,
      netProfit: 79560,
      revenue: 966780,
      operatingCashFlow: 112300,
      capex: 85600,
      totalAssets: 1567800,
      currentLiabilities: 423500,
      retainedEarnings: 612300,
      totalLiabilities: 832400,
      sales: 966780,
      workingCapital: -45600,
      interestExpense: 21340,
      dividendPerShare: 10,
      currentPrice: 2953,
      sharesOutstanding: 676.8,
      freeCashFlow: 26700,
      peRatio: 30.2,
      industryPE: 12.5,
      grossMargin: 42.3,
      assetTurnover: 0.62,
      currentRatio: 1.12,
      epsGrowthRate: 14.2,
      revenueGrowthRate: 22.5,
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    fundamentals: {
      eps: 119.45,
      bookValue: 276.8,
      totalDebt: 12450,
      shareholdersEquity: 101200,
      ebit: 58900,
      ebitda: 65400,
      marketCap: 1564000,
      promoterHolding: 72.3,
      netProfit: 45080,
      revenue: 239350,
      operatingCashFlow: 52100,
      capex: 8900,
      totalAssets: 178900,
      currentLiabilities: 67800,
      retainedEarnings: 82300,
      totalLiabilities: 77700,
      sales: 239350,
      workingCapital: 34500,
      interestExpense: 890,
      dividendPerShare: 91,
      currentPrice: 4275,
      sharesOutstanding: 365.9,
      freeCashFlow: 43200,
      peRatio: 35.8,
      industryPE: 28.5,
      grossMargin: 48.7,
      assetTurnover: 1.34,
      currentRatio: 2.45,
      epsGrowthRate: 8.5,
      revenueGrowthRate: 12.3,
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    fundamentals: {
      eps: 82.3,
      bookValue: 567.9,
      totalDebt: 2145000,
      shareholdersEquity: 432100,
      ebit: 98700,
      ebitda: 112400,
      marketCap: 1345000,
      promoterHolding: 25.8,
      netProfit: 56780,
      revenue: 367800,
      operatingCashFlow: 78900,
      capex: 12300,
      totalAssets: 3456000,
      currentLiabilities: 2890000,
      retainedEarnings: 298700,
      totalLiabilities: 3023900,
      sales: 367800,
      workingCapital: -123400,
      interestExpense: 234500,
      dividendPerShare: 19.5,
      currentPrice: 1762,
      sharesOutstanding: 763.3,
      freeCashFlow: 66600,
      peRatio: 21.4,
      industryPE: 18.2,
      grossMargin: 65.2,
      assetTurnover: 0.11,
      currentRatio: 0.98,
      epsGrowthRate: 18.7,
      revenueGrowthRate: 25.4,
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'INFY',
    name: 'Infosys Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    fundamentals: {
      eps: 62.4,
      bookValue: 195.4,
      totalDebt: 8230,
      shareholdersEquity: 78500,
      ebit: 31200,
      ebitda: 35400,
      marketCap: 685000,
      promoterHolding: 14.8,
      netProfit: 24200,
      revenue: 146700,
      operatingCashFlow: 29500,
      capex: 4500,
      totalAssets: 112000,
      currentLiabilities: 33500,
      retainedEarnings: 51200,
      totalLiabilities: 33500,
      sales: 146700,
      workingCapital: 22100,
      interestExpense: 620,
      dividendPerShare: 46.0,
      currentPrice: 1640,
      sharesOutstanding: 415.0,
      freeCashFlow: 25000,
      peRatio: 26.3,
      industryPE: 28.5,
      grossMargin: 40.5,
      assetTurnover: 1.31,
      currentRatio: 2.15,
      epsGrowthRate: 9.8,
      revenueGrowthRate: 11.2
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    fundamentals: {
      eps: 58.7,
      bookValue: 315.6,
      totalDebt: 1125000,
      shareholdersEquity: 218500,
      ebit: 52300,
      ebitda: 58900,
      marketCap: 782000,
      promoterHolding: 0.0,
      netProfit: 35400,
      revenue: 186000,
      operatingCashFlow: 41200,
      capex: 6500,
      totalAssets: 1950000,
      currentLiabilities: 1731500,
      retainedEarnings: 142300,
      totalLiabilities: 1731500,
      sales: 186000,
      workingCapital: -82100,
      interestExpense: 115400,
      dividendPerShare: 10.0,
      currentPrice: 1125,
      sharesOutstanding: 695.1,
      freeCashFlow: 34700,
      peRatio: 19.2,
      industryPE: 18.2,
      grossMargin: 61.3,
      assetTurnover: 0.1,
      currentRatio: 1.05,
      epsGrowthRate: 17.5,
      revenueGrowthRate: 21.0
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    fundamentals: {
      eps: 68.2,
      bookValue: 421.5,
      totalDebt: 3254000,
      shareholdersEquity: 375400,
      ebit: 82500,
      ebitda: 91400,
      marketCap: 692000,
      promoterHolding: 57.5,
      netProfit: 61000,
      revenue: 412000,
      operatingCashFlow: 89500,
      capex: 14500,
      totalAssets: 5542000,
      currentLiabilities: 5166600,
      retainedEarnings: 298000,
      totalLiabilities: 5166600,
      sales: 412000,
      workingCapital: -185400,
      interestExpense: 215400,
      dividendPerShare: 13.7,
      currentPrice: 775,
      sharesOutstanding: 892.4,
      freeCashFlow: 75000,
      peRatio: 11.3,
      industryPE: 18.2,
      grossMargin: 51.5,
      assetTurnover: 0.07,
      currentRatio: 0.95,
      epsGrowthRate: 14.2,
      revenueGrowthRate: 18.5
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'ITC',
    name: 'ITC Ltd',
    exchange: 'NSE',
    sector: 'FMCG',
    fundamentals: {
      eps: 16.5,
      bookValue: 62.4,
      totalDebt: 320,
      shareholdersEquity: 77500,
      ebit: 24500,
      ebitda: 26800,
      marketCap: 528000,
      promoterHolding: 0.0,
      netProfit: 20400,
      revenue: 72500,
      operatingCashFlow: 21200,
      capex: 3100,
      totalAssets: 83500,
      currentLiabilities: 5680,
      retainedEarnings: 65400,
      totalLiabilities: 6000,
      sales: 72500,
      workingCapital: 12500,
      interestExpense: 40,
      dividendPerShare: 15.75,
      currentPrice: 423,
      sharesOutstanding: 1248.0,
      freeCashFlow: 18100,
      peRatio: 25.6,
      industryPE: 32.5,
      grossMargin: 38.2,
      assetTurnover: 0.87,
      currentRatio: 2.85,
      epsGrowthRate: 8.5,
      revenueGrowthRate: 10.4
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd',
    exchange: 'NSE',
    sector: 'FMCG',
    fundamentals: {
      eps: 44.5,
      bookValue: 215.3,
      totalDebt: 120,
      shareholdersEquity: 50800,
      ebit: 13200,
      ebitda: 14100,
      marketCap: 568000,
      promoterHolding: 61.9,
      netProfit: 10400,
      revenue: 61800,
      operatingCashFlow: 11400,
      capex: 1800,
      totalAssets: 68500,
      currentLiabilities: 17580,
      retainedEarnings: 42100,
      totalLiabilities: 17700,
      sales: 61800,
      workingCapital: 8400,
      interestExpense: 20,
      dividendPerShare: 42.0,
      currentPrice: 2420,
      sharesOutstanding: 235.0,
      freeCashFlow: 9600,
      peRatio: 54.4,
      industryPE: 32.5,
      grossMargin: 51.5,
      assetTurnover: 0.9,
      currentRatio: 1.48,
      epsGrowthRate: 6.2,
      revenueGrowthRate: 8.5
    },
    lastUpdated: new Date()
  },
  {
    ticker: 'LT',
    name: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    sector: 'Infrastructure / Construction',
    fundamentals: {
      eps: 94.8,
      bookValue: 685.2,
      totalDebt: 125400,
      shareholdersEquity: 96500,
      ebit: 28900,
      ebitda: 34500,
      marketCap: 482000,
      promoterHolding: 0.0,
      netProfit: 13200,
      revenue: 215400,
      operatingCashFlow: 28500,
      capex: 11200,
      totalAssets: 345000,
      currentLiabilities: 122800,
      retainedEarnings: 82500,
      totalLiabilities: 248500,
      sales: 215400,
      workingCapital: 25400,
      interestExpense: 8900,
      dividendPerShare: 28.0,
      currentPrice: 3435,
      sharesOutstanding: 140.2,
      freeCashFlow: 17300,
      peRatio: 36.2,
      industryPE: 24.5,
      grossMargin: 18.5,
      assetTurnover: 0.62,
      currentRatio: 1.25,
      epsGrowthRate: 12.3,
      revenueGrowthRate: 15.6
    },
    lastUpdated: new Date()
  }
];

db.stocks.push(...seedStocks);

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mocking User model methods
const mockUser = {
  findOne: async ({ email }) => {
    const user = db.users.find(u => u.email === email.toLowerCase());
    if (!user) return null;
    return {
      ...user,
      comparePassword: async (pass) => bcrypt.compare(pass, user.passwordHash),
      save: async function() {
        const idx = db.users.findIndex(u => u._id === this._id);
        if (idx !== -1) db.users[idx] = this;
        return this;
      },
      toJSON: function() {
        const copy = { ...this };
        delete copy.passwordHash;
        delete copy.refreshToken;
        return copy;
      }
    };
  },
  create: async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userData.passwordHash || userData.password, salt);
    const newUser = {
      _id: generateId(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: hash,
      riskProfile: userData.riskProfile || 'Moderate',
      preferredLanguage: 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(newUser);
    
    // Auto-create blank portfolio
    db.portfolios.push({
      _id: generateId(),
      userId: newUser._id,
      name: 'My Portfolio',
      holdings: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      ...newUser,
      comparePassword: async (pass) => bcrypt.compare(pass, hash),
      save: async function() {
        const idx = db.users.findIndex(u => u._id === this._id);
        if (idx !== -1) db.users[idx] = this;
        return this;
      },
      toJSON: function() {
        const copy = { ...this };
        delete copy.passwordHash;
        delete copy.refreshToken;
        return copy;
      }
    };
  },
  findById: async (id) => {
    const user = db.users.find(u => u._id === id);
    if (!user) return null;
    return {
      ...user,
      save: async function() {
        const idx = db.users.findIndex(u => u._id === this._id);
        if (idx !== -1) db.users[idx] = this;
        return this;
      },
      toJSON: function() {
        const copy = { ...this };
        delete copy.passwordHash;
        delete copy.refreshToken;
        return copy;
      }
    };
  }
};

// Seed default demo user
mockUser.create({
  name: 'Demo Investor',
  email: 'demo@valuepro.in',
  password: 'demo123456',
  riskProfile: 'Moderate'
}).then(demoUser => {
  // Add holdings to demo user's portfolio
  const portfolio = db.portfolios.find(p => p.userId === demoUser._id);
  if (portfolio) {
    portfolio.holdings = [
      {
        _id: generateId(),
        stockTicker: 'RELIANCE',
        stockName: 'Reliance Industries Ltd',
        sector: 'Oil & Gas / Conglomerate',
        marketCapCategory: 'Large Cap',
        units: 25,
        avgPrice: 2450,
        currentValue: 25 * 2953,
      },
      {
        _id: generateId(),
        stockTicker: 'TCS',
        stockName: 'Tata Consultancy Services Ltd',
        sector: 'Information Technology',
        marketCapCategory: 'Large Cap',
        units: 15,
        avgPrice: 3800,
        currentValue: 15 * 4275,
      },
      {
        _id: generateId(),
        stockTicker: 'HDFCBANK',
        stockName: 'HDFC Bank Ltd',
        sector: 'Banking & Finance',
        marketCapCategory: 'Large Cap',
        units: 40,
        avgPrice: 1580,
        currentValue: 40 * 1762,
      }
    ];
  }

  // Seed some history for demo user
  db.histories.push(
    {
      _id: generateId(),
      userId: demoUser._id,
      calculatorType: 'dcf',
      inputs: { baseFCF: 26700, growthRateY1to5: 15, discountRate: 12, terminalGrowthRate: 3, forecastPeriod: 10, netDebt: 316740, sharesOutstanding: 6768 },
      outputs: { ivPerShare: 2845.67, enterpriseValue: 19485600 },
      stockTicker: 'RELIANCE',
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      userId: demoUser._id,
      calculatorType: 'sip',
      inputs: { monthlyInvestment: 25000, expectedReturnRate: 12, years: 20 },
      outputs: { futureValue: 24981930, totalInvested: 6000000, estimatedGains: 18981930 },
      createdAt: new Date(),
    }
  );
});

// Mocking Stock model methods
const mockStock = {
  findOne: async ({ ticker }) => {
    return db.stocks.find(s => s.ticker === ticker.toUpperCase()) || null;
  },
  find: (query) => {
    let list = db.stocks;
    if (query && query.$or) {
      const q = query.$or[0].ticker.$regex;
      list = db.stocks.filter(s => 
        s.ticker.toLowerCase().includes(q.toLowerCase()) || 
        s.name.toLowerCase().includes(q.toLowerCase())
      );
    }
    const chain = {
      select: () => chain,
      limit: () => list
    };
    return chain;
  },
  insertMany: async (stocks) => {
    db.stocks.push(...stocks);
    return stocks;
  }
};

// Mocking Portfolio model methods
const mockPortfolio = {
  findOne: async ({ userId }) => {
    const portfolio = db.portfolios.find(p => p.userId.toString() === userId.toString());
    if (!portfolio) return null;
    return {
      ...portfolio,
      save: async function() {
        const idx = db.portfolios.findIndex(p => p._id === this._id);
        if (idx !== -1) db.portfolios[idx] = this;
        return this;
      }
    };
  },
  create: async (portfolioData) => {
    const newPortfolio = {
      _id: generateId(),
      userId: portfolioData.userId,
      name: portfolioData.name || 'My Portfolio',
      holdings: portfolioData.holdings || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.portfolios.push(newPortfolio);
    return {
      ...newPortfolio,
      save: async function() {
        const idx = db.portfolios.findIndex(p => p._id === this._id);
        if (idx !== -1) db.portfolios[idx] = this;
        return this;
      }
    };
  }
};

// Mocking CalculationHistory model methods
const mockHistory = {
  find: (query) => {
    let list = db.histories.filter(h => h.userId.toString() === query.userId.toString());
    if (query.calculatorType) {
      list = list.filter(h => h.calculatorType === query.calculatorType);
    }
    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: () => list
    };
    return chain;
  },
  countDocuments: async (query) => {
    let list = db.histories.filter(h => h.userId.toString() === query.userId.toString());
    if (query.calculatorType) {
      list = list.filter(h => h.calculatorType === query.calculatorType);
    }
    return list.length;
  },
  create: async (historyData) => {
    const newHistory = {
      _id: generateId(),
      userId: historyData.userId,
      calculatorType: historyData.calculatorType,
      inputs: historyData.inputs,
      outputs: historyData.outputs,
      stockTicker: historyData.stockTicker || null,
      createdAt: new Date(),
    };
    db.histories.push(newHistory);
    return newHistory;
  },
  findOneAndDelete: async (query) => {
    const idx = db.histories.findIndex(h => h._id === query._id && h.userId.toString() === query.userId.toString());
    if (idx === -1) return null;
    const deleted = db.histories[idx];
    db.histories.splice(idx, 1);
    return deleted;
  }
};

module.exports = {
  User: mockUser,
  Stock: mockStock,
  Portfolio: mockPortfolio,
  CalculationHistory: mockHistory,
  db
};
