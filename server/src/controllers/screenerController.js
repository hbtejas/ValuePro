const { calculateStockRisk } = require('../services/riskEngine');
const Stock = require('../models/Stock');

// User Agent matching a real browser to prevent blocks
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let sessionCookie = null;
let sessionCrumb = null;
let lastSessionFetchTime = 0;

/**
 * Fetch and refresh cookie and crumb session from Yahoo Finance
 */
async function refreshYahooSession() {
  const now = Date.now();
  // Cache session for 15 minutes to prevent rate limiting
  if (sessionCookie && sessionCrumb && (now - lastSessionFetchTime < 15 * 60 * 1000)) {
    return { cookie: sessionCookie, crumb: sessionCrumb };
  }

  console.log('Refreshing Yahoo Finance cookie and crumb session...');
  const cookieResponse = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': USER_AGENT }
  });
  
  const rawCookies = cookieResponse.headers.get('set-cookie');
  if (!rawCookies) {
    throw new Error('Failed to get session cookie from fc.yahoo.com');
  }
  const cookie = rawCookies.split(';')[0];

  const crumbResponse = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: {
      'Cookie': cookie,
      'User-Agent': USER_AGENT
    }
  });
  
  if (!crumbResponse.ok) {
    throw new Error(`Failed to get session crumb: ${crumbResponse.status}`);
  }
  
  const crumb = await crumbResponse.text();
  
  sessionCookie = cookie;
  sessionCrumb = crumb;
  lastSessionFetchTime = now;
  
  return { cookie, crumb };
}

/**
 * Clean and format ticker input (e.g. RELIANCE -> RELIANCE.NS)
 */
function cleanTicker(ticker) {
  if (!ticker) return '';
  const upper = ticker.toUpperCase().trim();
  if (upper.endsWith('.NS') || upper.endsWith('.BO')) {
    return upper;
  }
  return `${upper}.NS`; // default to NSE
}

exports.screenStock = async (req, res, next) => {
  try {
    let { ticker } = req.query;
    if (!ticker) {
      return res.status(400).json({ success: false, message: 'Ticker symbol is required' });
    }

    const cleaned = cleanTicker(ticker);
    const pureTicker = cleaned.split('.')[0]; // e.g. RELIANCE

    let financialData = null;
    let newsArticles = [];
    let isMock = false;

    try {
      // 1. Get Cookie & Crumb
      const { cookie, crumb } = await refreshYahooSession();

      // 2. Fetch quoteSummary
      const quoteUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${cleaned}?modules=summaryDetail,financialData,defaultKeyStatistics&crumb=${crumb}`;
      const quoteResponse = await fetch(quoteUrl, {
        headers: {
          'Cookie': cookie,
          'User-Agent': USER_AGENT
        }
      });

      if (!quoteResponse.ok) {
        throw new Error(`Yahoo returned status ${quoteResponse.status}`);
      }

      const quoteJson = await quoteResponse.json();
      const result = quoteJson.quoteSummary.result[0];

      financialData = {
        currentPrice: result.financialData.currentPrice?.raw || 0,
        peRatio: result.summaryDetail.trailingPE?.raw || null,
        pbRatio: result.defaultKeyStatistics.priceToBook?.raw || null,
        debtToEquity: result.financialData.debtToEquity?.raw || null,
        currentRatio: result.financialData.currentRatio?.raw || null,
        marketCap: result.summaryDetail.marketCap?.raw || 0,
      };
    } catch (yahooErr) {
      console.warn(`Yahoo Quote fetch failed for ${cleaned}: ${yahooErr.message}. Falling back to mock DB.`);
      
      // Fallback: Query local mock database
      const stock = await Stock.findOne({ ticker: pureTicker });
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: `Stock ${pureTicker} not found in Yahoo or Local Database.`
        });
      }

      financialData = {
        currentPrice: stock.fundamentals.currentPrice,
        peRatio: stock.fundamentals.peRatio,
        pbRatio: stock.fundamentals.priceToBook || 2.0,
        debtToEquity: stock.fundamentals.debtToEquity,
        currentRatio: stock.fundamentals.currentRatio || 1.2,
        marketCap: stock.fundamentals.marketCap * 10000000, // convert Cr to raw
        companyName: stock.name,
        exchange: stock.exchange,
        sector: stock.sector
      };
      isMock = true;
    }

    // 3. Fetch News articles (Search Autocomplete is much more stable)
    try {
      const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${cleaned}&newsCount=6`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        newsArticles = (searchJson.news || []).map(item => ({
          title: item.title,
          publisher: item.publisher,
          link: item.link,
          time: new Date(item.providerPublishTime * 1000).toISOString()
        }));
      }
    } catch (newsErr) {
      console.warn(`Yahoo News fetch failed for ${cleaned}: ${newsErr.message}`);
      newsArticles = [];
    }

    // 4. Calculate Risk
    const riskReport = calculateStockRisk(financialData, newsArticles);

    // 5. Gather general details
    let companyName = financialData.companyName || pureTicker;
    let sector = financialData.sector || 'N/A';
    
    if (!isMock) {
      // Find matching mock details if any to augment name/sector
      const match = await Stock.findOne({ ticker: pureTicker });
      if (match) {
        companyName = match.name;
        sector = match.sector;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ticker: pureTicker,
        fullName: cleaned,
        companyName,
        sector,
        currentPrice: financialData.currentPrice,
        peRatio: financialData.peRatio,
        pbRatio: financialData.pbRatio,
        debtToEquity: financialData.debtToEquity,
        currentRatio: financialData.currentRatio,
        marketCap: financialData.marketCap,
        risk: riskReport,
        news: newsArticles,
        dataSource: isMock ? 'Local Database (Offline Fallback)' : 'Yahoo Finance API'
      }
    });

  } catch (error) {
    next(error);
  }
};
