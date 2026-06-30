require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Stock = require('./models/Stock');
const Portfolio = require('./models/Portfolio');
const CalculationHistory = require('./models/CalculationHistory');
const env = require('./config/env');

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Stock.deleteMany({}),
      Portfolio.deleteMany({}),
      CalculationHistory.deleteMany({}),
    ]);

    // ── Sample Stocks (realistic Indian market fundamentals) ──
    const stocks = await Stock.insertMany([
      {
        ticker: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        exchange: 'NSE',
        sector: 'Oil & Gas / Conglomerate',
        fundamentals: {
          eps: 97.78,
          bookValue: 1087.5,
          totalDebt: 316740_00_00000, // ₹3,16,740 Cr
          shareholdersEquity: 735400_00_00000,
          ebit: 124500_00_00000,
          ebitda: 167800_00_00000,
          marketCap: 1998000_00_00000, // ~₹19.98 Lakh Cr
          promoterHolding: 50.33,
          netProfit: 79560_00_00000,
          revenue: 966780_00_00000,
          operatingCashFlow: 112300_00_00000,
          capex: 85600_00_00000,
          totalAssets: 1567800_00_00000,
          currentLiabilities: 423500_00_00000,
          retainedEarnings: 612300_00_00000,
          totalLiabilities: 832400_00_00000,
          sales: 966780_00_00000,
          workingCapital: -45600_00_00000,
          interestExpense: 21340_00_00000,
          dividendPerShare: 10,
          currentPrice: 2953,
          sharesOutstanding: 676_80_00000, // 676.8 Cr shares
          freeCashFlow: 26700_00_00000,
          peRatio: 30.2,
          industryPE: 12.5,
          grossMargin: 42.3,
          assetTurnover: 0.62,
          currentRatio: 1.12,
          epsGrowthRate: 14.2,
          revenueGrowthRate: 22.5,
        },
        lastUpdated: new Date(),
      },
      {
        ticker: 'TCS',
        name: 'Tata Consultancy Services Ltd',
        exchange: 'NSE',
        sector: 'Information Technology',
        fundamentals: {
          eps: 119.45,
          bookValue: 276.8,
          totalDebt: 12450_00_00000,
          shareholdersEquity: 101200_00_00000,
          ebit: 58900_00_00000,
          ebitda: 65400_00_00000,
          marketCap: 1564000_00_00000, // ~₹15.64 Lakh Cr
          promoterHolding: 72.3,
          netProfit: 45080_00_00000,
          revenue: 239350_00_00000,
          operatingCashFlow: 52100_00_00000,
          capex: 8900_00_00000,
          totalAssets: 178900_00_00000,
          currentLiabilities: 67800_00_00000,
          retainedEarnings: 82300_00_00000,
          totalLiabilities: 77700_00_00000,
          sales: 239350_00_00000,
          workingCapital: 34500_00_00000,
          interestExpense: 890_00_00000,
          dividendPerShare: 91,
          currentPrice: 4275,
          sharesOutstanding: 365_90_00000,
          freeCashFlow: 43200_00_00000,
          peRatio: 35.8,
          industryPE: 28.5,
          grossMargin: 48.7,
          assetTurnover: 1.34,
          currentRatio: 2.45,
          epsGrowthRate: 8.5,
          revenueGrowthRate: 12.3,
        },
        lastUpdated: new Date(),
      },
      {
        ticker: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        exchange: 'NSE',
        sector: 'Banking & Finance',
        fundamentals: {
          eps: 82.3,
          bookValue: 567.9,
          totalDebt: 2145000_00_00000,
          shareholdersEquity: 432100_00_00000,
          ebit: 98700_00_00000,
          ebitda: 112400_00_00000,
          marketCap: 1345000_00_00000,
          promoterHolding: 25.8,
          netProfit: 56780_00_00000,
          revenue: 367800_00_00000,
          operatingCashFlow: 78900_00_00000,
          capex: 12300_00_00000,
          totalAssets: 3456000_00_00000,
          currentLiabilities: 2890000_00_00000,
          retainedEarnings: 298700_00_00000,
          totalLiabilities: 3023900_00_00000,
          sales: 367800_00_00000,
          workingCapital: -123400_00_00000,
          interestExpense: 234500_00_00000,
          dividendPerShare: 19.5,
          currentPrice: 1762,
          sharesOutstanding: 763_30_00000,
          freeCashFlow: 66600_00_00000,
          peRatio: 21.4,
          industryPE: 18.2,
          grossMargin: 65.2,
          assetTurnover: 0.11,
          currentRatio: 0.98,
          epsGrowthRate: 18.7,
          revenueGrowthRate: 25.4,
        },
        lastUpdated: new Date(),
      },
    ]);

    console.log(`Seeded ${stocks.length} stocks`);

    // ── Demo User ──
    const demoUser = await User.create({
      name: 'Demo Investor',
      email: 'demo@valuepro.in',
      passwordHash: 'demo123456', // will be hashed by pre-save hook
      riskProfile: 'Moderate',
    });

    console.log(`Seeded demo user: ${demoUser.email} (password: demo123456)`);

    // ── Demo Portfolio ──
    const portfolio = await Portfolio.create({
      userId: demoUser._id,
      name: 'My Growth Portfolio',
      holdings: [
        {
          stockTicker: 'RELIANCE',
          stockName: 'Reliance Industries Ltd',
          sector: 'Oil & Gas / Conglomerate',
          marketCapCategory: 'Large Cap',
          units: 25,
          avgPrice: 2450,
          currentValue: 25 * 2953,
        },
        {
          stockTicker: 'TCS',
          stockName: 'Tata Consultancy Services Ltd',
          sector: 'Information Technology',
          marketCapCategory: 'Large Cap',
          units: 15,
          avgPrice: 3800,
          currentValue: 15 * 4275,
        },
        {
          stockTicker: 'HDFCBANK',
          stockName: 'HDFC Bank Ltd',
          sector: 'Banking & Finance',
          marketCapCategory: 'Large Cap',
          units: 40,
          avgPrice: 1580,
          currentValue: 40 * 1762,
        },
      ],
    });

    console.log(`Seeded portfolio with ${portfolio.holdings.length} holdings`);

    // ── Sample Calculation History ──
    await CalculationHistory.insertMany([
      {
        userId: demoUser._id,
        calculatorType: 'dcf',
        inputs: { baseFCF: 26700, growthRateY1to5: 15, discountRate: 12, terminalGrowthRate: 3, forecastPeriod: 10, netDebt: 316740, sharesOutstanding: 6768 },
        outputs: { ivPerShare: 2845.67, enterpriseValue: 19485600 },
        stockTicker: 'RELIANCE',
      },
      {
        userId: demoUser._id,
        calculatorType: 'sip',
        inputs: { monthlyInvestment: 25000, expectedReturnRate: 12, years: 20 },
        outputs: { futureValue: 24981930, totalInvested: 6000000, estimatedGains: 18981930 },
      },
    ]);

    console.log('Seeded calculation history');
    console.log('\\n✅ Seed completed successfully!');
    console.log('\\nDemo login credentials:');
    console.log('  Email: demo@valuepro.in');
    console.log('  Password: demo123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
