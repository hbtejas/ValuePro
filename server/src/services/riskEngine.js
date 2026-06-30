/**
 * Automated Risk Analysis Engine
 * Calculates multi-factor risk score out of 100 based on Solvency, Valuation, and Sentiment.
 */
function calculateStockRisk(financialData, newsArticles = []) {
  const warnings = [];
  
  // 1. Leverage & Solvency Risk (Weight: 40%)
  let solvencyRisk = 0;
  const deRatio = financialData.debtToEquity; // e.g. 150 = 1.5x (Yahoo returns percentage/raw)
  const currentRatio = financialData.currentRatio;

  if (deRatio !== undefined && deRatio !== null) {
    // If Yahoo returns ratio (e.g. 1.5) or percent (e.g. 150)
    const deVal = deRatio > 10 ? deRatio / 100 : deRatio;
    if (deVal > 2.0) {
      solvencyRisk = 40;
      warnings.push('High leverage: Debt-to-Equity ratio exceeds 2.0x');
    } else if (deVal > 1.0) {
      solvencyRisk = 20;
      warnings.push('Moderate leverage: Debt-to-Equity ratio between 1.0x and 2.0x');
    } else {
      solvencyRisk = 5;
    }
  } else {
    solvencyRisk = 10; // Neutral fallback
  }

  if (currentRatio !== undefined && currentRatio !== null && currentRatio < 1.0) {
    solvencyRisk = Math.min(40, solvencyRisk + 15);
    warnings.push('Liquidity concern: Current Ratio is below 1.0');
  }

  // 2. Valuation Risk (Weight: 40%)
  let valuationRisk = 0;
  const pe = financialData.peRatio;
  const pb = financialData.pbRatio;

  if (pe !== undefined && pe !== null) {
    if (pe > 60) {
      valuationRisk = 40;
      warnings.push('High valuation: P/E ratio is extremely high (>60)');
    } else if (pe > 35) {
      valuationRisk = 25;
      warnings.push('Premium valuation: P/E ratio is elevated (35-60)');
    } else if (pe < 0) {
      valuationRisk = 30;
      warnings.push('Earnings deficit: Company is currently loss-making (Negative P/E)');
    } else {
      valuationRisk = 10;
    }
  } else {
    valuationRisk = 15;
  }

  if (pb !== undefined && pb !== null && pb > 10) {
    valuationRisk = Math.min(40, valuationRisk + 10);
    warnings.push('Elevated price-to-book multiple (>10x)');
  }

  // 3. News Sentiment Heat Risk (Weight: 20%)
  let sentimentRisk = 0;
  const negativeKeywords = ['SEBI', 'probe', 'penalty', 'fraud', 'default', 'pledged shares', 'ASM', 'GSM', 'investigation', 'fine', 'scam', 'irregularity'];
  let matchCount = 0;

  newsArticles.forEach((article) => {
    const title = article.title || '';
    negativeKeywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(title)) {
        matchCount++;
        warnings.push(`Sentiment Alert: Regulatory or compliance keyword "${kw}" flagged in recent headline: "${title.substring(0, 50)}..."`);
      }
    });
  });

  sentimentRisk = Math.min(20, matchCount * 10);

  // Aggregate Score
  const aggregateScore = solvencyRisk + valuationRisk + sentimentRisk;
  let category = 'Low';
  if (aggregateScore >= 60) {
    category = 'High';
  } else if (aggregateScore >= 30) {
    category = 'Medium';
  }

  return {
    aggregateScore,
    category,
    breakdown: {
      solvency: solvencyRisk,
      valuation: valuationRisk,
      sentiment: sentimentRisk
    },
    warnings: [...new Set(warnings)] // Deduplicated warnings
  };
}

module.exports = {
  calculateStockRisk
};
