import { calculateCac, calculateRoas, compareScenarios } from './financialEngine.js';

const insufficient = (missing) => ({ status: 'insufficient_data', missing });

export function createFinancialViewModel(data = {}) {
  const history = data.acquisitionHistory ?? [];
  const advertisingSpend = history.reduce((total, row) => total + Number(row.ad_spend_usd), 0);
  const attributedRevenue = history.reduce((total, row) => total + Number(row.attributed_revenue_usd), 0);
  const acquiredCustomers = history.reduce((total, row) => total + Number(row.acquired_customers), 0);

  const roas = history.length
    ? calculateRoas({ attributedRevenue, advertisingSpend })
    : insufficient(['advertising_acquisition_history']);

  // El esquema real no almacena honorarios de agencia; no se asume que sean cero.
  const cac = history.length
    ? calculateCac({ advertisingSpend, acquiredCustomers })
    : insufficient(['advertising_acquisition_history', 'agencyFees']);

  const scenarioInputs = (data.scenarios ?? []).map((scenario) => ({ name: scenario.name, metrics: {} }));
  const comparison = scenarioInputs.length
    ? compareScenarios({ scenarios: scenarioInputs })
    : insufficient(['commercial_scenarios']);

  return {
    metrics: {
      contributionMargin: insufficient(['offers', 'productCosts', 'orderCosts']),
      contributionMarginRate: insufficient(['contributionMargin', 'sellingPrice']),
      cac,
      roas,
      breakEvenRoas: insufficient(['contributionMarginRate']),
      ltv12Months: insufficient(['repurchasePatterns', 'contributionMargin']),
      ltvCacRatio: insufficient(['ltv12Months', 'cac']),
      payback: insufficient(['monthlyContributionMargins', 'cac']),
      cashFlow: insufficient(['initialCash', 'monthlyScenarioInputs']),
    },
    comparison,
    hasRealResults: roas.status === 'ok',
  };
}
