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
