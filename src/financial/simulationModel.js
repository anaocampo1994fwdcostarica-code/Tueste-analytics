import {
  calculateBreakEvenRoas,
  calculateCac,
  calculateContributionMargin,
  calculateContributionMarginRate,
  calculateLtvCacRatio,
  calculateMarginalCac,
  calculateMonthlyCashFlow,
  calculatePayback,
  calculatePaybackFirstWholeMonth,
} from '../calculations/financialEngine.js';
import { FINANCIAL_SOURCES } from './contracts.js';

const required = [
  'metaActual', 'metaAgency', 'price', 'bagCost', 'shipping', 'paymentFeePercent',
  'packaging', 'subscriptionPrice', 'churn', 'actualDiscount', 'discount', 'packPrice',
  'packAdoption', 'packPackaging', 'freeShippingThreshold', 'initialCash', 'fixedCosts', 'agencyFee',
  'existingContribution', 'existingDecay', 'organicCustomers', 'oneTimeShare',
  'safetyFloor', 'oneTimeOrdersByMonth', 'acquisitionHistory',
];

const resultValue = (result, selector = (value) => value) => result?.status === 'ok' ? selector(result.value) : null;

export function interpolateAcquiredCustomers(spend, history) {
  if (!Number.isFinite(spend) || spend <= 0) return 0;
  for (let index = 1; index < history.length; index += 1) {
    if (spend <= history[index][0]) {
      const [previousSpend, previousCustomers] = history[index - 1];
      const [nextSpend, nextCustomers] = history[index];
      return previousCustomers + ((spend - previousSpend) * (nextCustomers - previousCustomers)) / (nextSpend - previousSpend);
    }
  }
  return history.at(-1)[1];
}

function contribution(state, price, bags, packaging, sellerPaysShipping = true) {
  return calculateContributionMargin({
    sellingPrice: price,
    productVariableCosts: [bags * state.bagCost],
    shippingCost: sellerPaysShipping ? state.shipping : 0,
    paymentFeePercent: state.paymentFeePercent,
    paymentFeeFixed: 0,
    otherOrderCost: packaging,
  });
}

function contributionPartsByAge(state, offer, age) {
  const subscriberShare = 1 - state.oneTimeShare;
  const usesPackPolicy = offer === 'pack';
  const standard = resultValue(contribution(state, state.price, 2, state.packaging, !usesPackPolicy), (value) => value.amount);
  const subscription = resultValue(contribution(state, state.subscriptionPrice, 2, state.packaging, !usesPackPolicy), (value) => value.amount);
  const pack = resultValue(contribution(
    state,
    state.packPrice,
    3,
    state.packPackaging,
    state.packPrice >= state.freeShippingThreshold,
  ), (value) => value.amount);
  if ([standard, subscription, pack].some((value) => value == null)) return null;
  let oneTimeContribution = standard;
  if (offer === 'standard' && age === 0) {
    oneTimeContribution = resultValue(contribution(state, state.price * (1 - state.actualDiscount), 2, state.packaging), (value) => value.amount);
  }
  if (offer === 'agency' && age === 0) {
    oneTimeContribution = resultValue(contribution(state, state.price * (1 - state.discount), 2, state.packaging), (value) => value.amount);
  }
  if (offer === 'pack') oneTimeContribution = standard * (1 - state.packAdoption) + pack * state.packAdoption;
  const oneTimeUnweighted = state.oneTimeOrdersByMonth[age] * oneTimeContribution;
  const subscriberUnweighted = ((1 - state.churn) ** age) * subscription;
  const oneTime = state.oneTimeShare * oneTimeUnweighted;
  const subscriber = subscriberShare * subscriberUnweighted;
  return { oneTime, subscriber, total: oneTime + subscriber, oneTimeUnweighted, subscriberUnweighted, oneTimeContribution, subscriptionContribution: subscription, packContribution: pack };
}

function calculateScenario(state, { mode, advertisingSpend, offer }) {
  const acquiredCustomers = interpolateAcquiredCustomers(advertisingSpend, state.acquisitionHistory);
  const hasMetaAcquisition = advertisingSpend > 0 && acquiredCustomers > 0;
  const cacResult = hasMetaAcquisition ? calculateCac({ advertisingSpend, agencyFees: state.agencyFee, acquiredCustomers }) : null;
  const cac = resultValue(cacResult);
  const cacAds = acquiredCustomers > 0 ? advertisingSpend / acquiredCustomers : null;
  const contributionParts = Array.from({ length: 12 }, (_, age) => contributionPartsByAge(state, offer, age));
  if (contributionParts.some((value) => value == null)) {
    return { status: 'insufficient_data', mode };
  }
  const monthlyCustomerContribution = contributionParts.map((part) => part.total);
  const monthlyOrganicContribution = monthlyCustomerContribution;
  const oneTimeLtv = contributionParts.reduce((sum, part) => sum + part.oneTimeUnweighted, 0);
  const subscriberShare = 1 - state.oneTimeShare;
  const subscriberLtv = contributionParts.reduce((sum, part) => sum + part.subscriberUnweighted, 0);
  const ltv = monthlyCustomerContribution.reduce((sum, value) => sum + value, 0);
  const ratioResult = cac == null ? null : calculateLtvCacRatio({ ltv, cac });
  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const customerContribution = monthlyCustomerContribution.slice(0, monthIndex + 1).reduce((sum, value) => sum + acquiredCustomers * value, 0);
    const organicContribution = monthlyOrganicContribution.slice(0, monthIndex + 1).reduce((sum, value) => sum + state.organicCustomers * value, 0);
    const existingContribution = state.existingContribution * ((1 - state.existingDecay) ** monthIndex);
    return {
      month: monthIndex + 1,
      revenue: existingContribution + customerContribution + organicContribution,
      variableCosts: 0,
      fixedCosts: state.fixedCosts,
      advertisingSpend,
      otherInflows: 0,
      otherOutflows: advertisingSpend > 0 ? state.agencyFee : 0,
    };
  });
  const cashFlow = calculateMonthlyCashFlow({ initialCash: state.initialCash, months });
  const cashRows = resultValue(cashFlow, (value) => value.months);
  if (!cashRows) return { status: 'insufficient_data', mode };
  const cashSeries = [state.initialCash, ...cashRows.map((row) => row.endingCash)];
  const customerSeries = cac == null ? null : [-cac];
  if (customerSeries) monthlyCustomerContribution.forEach((value) => customerSeries.push(customerSeries.at(-1) + value));
  const paybackResult = cac == null ? null : calculatePaybackFirstWholeMonth({ cac, monthlyContributionMargins: monthlyCustomerContribution });
  const interpolatedPaybackResult = cac == null ? null : calculatePayback({ cac, monthlyContributionMargins: monthlyCustomerContribution });
  const belowFloorMonths = cashSeries.slice(1).filter((value) => value < state.safetyFloor).length;
  const expectedFirstOrderRevenue = offer === 'standard'
    ? state.price * (1 - state.actualDiscount)
    : offer === 'agency'
    ? state.oneTimeShare * state.price * (1 - state.discount) + subscriberShare * state.subscriptionPrice
    : offer === 'pack'
      ? state.oneTimeShare * (state.price * (1 - state.packAdoption) + state.packPrice * state.packAdoption) + subscriberShare * state.subscriptionPrice
      : state.oneTimeShare * state.price + subscriberShare * state.subscriptionPrice;
  const oneTimeFirstPrice = offer === 'agency'
    ? state.price * (1 - state.discount)
    : offer === 'pack'
      ? state.price * (1 - state.packAdoption) + state.packPrice * state.packAdoption
      : state.price * (1 - state.actualDiscount);
  const firstOrderMarginRate = contributionParts[0].oneTimeContribution / oneTimeFirstPrice;
  const scenarioBreakEvenRoas = resultValue(calculateBreakEvenRoas({ contributionMarginRate: firstOrderMarginRate }));
  return {
    status: 'ok', mode, offer, advertisingSpend, acquiredCustomers, cacAds, cac, ltv, oneTimeLtv, subscriberLtv,
    ltvCacRatio: resultValue(ratioResult), cashSeries, customerSeries,
    paybackFirstWholeMonth: resultValue(paybackResult, (value) => value.month),
    paybackInterpolatedMonths: resultValue(interpolatedPaybackResult, (value) => value.months),
    roasFirstOrder: advertisingSpend > 0 ? acquiredCustomers * expectedFirstOrderRevenue / advertisingSpend : null,
    breakEvenRoas: scenarioBreakEvenRoas,
    firstOrderContribution: contributionParts[0].oneTimeContribution,
    firstOrderMarginRate,
    firstMonthContribution: monthlyCustomerContribution[0],
    finalCash: cashSeries.at(-1), minimumCash: Math.min(...cashSeries.slice(1)),
    belowFloorMonths,
  };
}

function difference(current, base) {
  if (!Number.isFinite(current) || !Number.isFinite(base)) return null;
  const absolute = current - base;
  return { absolute, percent: base === 0 ? null : absolute / Math.abs(base) };
}

function compareChange(scenario, base) {
  return {
    scenario,
    deltas: {
      cac: difference(scenario.cac, base.cac),
      ltv: difference(scenario.ltv, base.ltv),
      ltvCacRatio: difference(scenario.ltvCacRatio, base.ltvCacRatio),
      paybackInterpolatedMonths: scenario.paybackInterpolatedMonths == null || base.paybackInterpolatedMonths == null
        ? null
        : difference(scenario.paybackInterpolatedMonths, base.paybackInterpolatedMonths),
      finalCash: difference(scenario.finalCash, base.finalCash),
    },
  };
}

export function calculateInteractiveModel(state) {
  const missing = required.filter((field) => state?.[field] == null);
  const invalidRatios = ['paymentFeePercent', 'churn', 'actualDiscount', 'discount', 'packAdoption', 'existingDecay', 'oneTimeShare']
    .filter((field) => !Number.isFinite(state?.[field]) || state[field] < 0 || state[field] > 1);
  if (missing.length || invalidRatios.length || !Array.isArray(state.oneTimeOrdersByMonth) || state.oneTimeOrdersByMonth.length !== 12) {
    return { status: 'insufficient_data', source: FINANCIAL_SOURCES.SIMULACION_EDITABLE, missing: [...missing, ...invalidRatios] };
  }
  const scenarios = {
    actual: calculateScenario(state, { mode: 'actual', advertisingSpend: state.metaActual, offer: 'standard' }),
    agency: calculateScenario(state, { mode: 'agency', advertisingSpend: state.metaAgency, offer: 'agency' }),
    pack: calculateScenario(state, { mode: 'pack', advertisingSpend: state.metaActual, offer: 'pack' }),
  };
  const packAtAgencySpend = calculateScenario(state, { mode: 'pack_at_agency_spend', advertisingSpend: state.metaAgency, offer: 'pack' });
  const agencyAtActualSpend = calculateScenario(state, { mode: 'agency_at_actual_spend', advertisingSpend: state.metaActual, offer: 'agency' });
  const normalContribution = contribution(state, state.price, 2, state.packaging);
  const contributionAmount = resultValue(normalContribution, (value) => value.amount);
  const marginRate = contributionAmount == null ? null : resultValue(calculateContributionMarginRate({ contributionMargin: contributionAmount, revenue: state.price }));
  const breakEvenRoas = marginRate == null ? null : resultValue(calculateBreakEvenRoas({ contributionMarginRate: marginRate }));
  const subscriptionContribution = resultValue(contribution(state, state.subscriptionPrice, 2, state.packaging), (value) => value.amount);
  const subscriptionMarginRate = subscriptionContribution == null ? null : resultValue(calculateContributionMarginRate({ contributionMargin: subscriptionContribution, revenue: state.subscriptionPrice }));
  const subscriptionBreakEvenRoas = subscriptionMarginRate == null ? null : resultValue(calculateBreakEvenRoas({ contributionMarginRate: subscriptionMarginRate }));
  const discountedContribution = resultValue(contribution(state, state.price * (1 - state.discount), 2, state.packaging), (value) => value.amount);
  const marginalCacSegments = state.acquisitionHistory.slice(1).map(([toSpend, toCustomers], index) => {
    const [fromSpend, fromCustomers] = state.acquisitionHistory[index];
    return { fromSpend, toSpend, fromCustomers, toCustomers, value: resultValue(calculateMarginalCac({ fromSpend, toSpend, fromCustomers, toCustomers })) };
  });
  const marginalCac8to16 = resultValue(calculateMarginalCac({ fromSpend: 8000, toSpend: 16000, fromCustomers: 165, toCustomers: 235 }));
  if ([...Object.values(scenarios), packAtAgencySpend, agencyAtActualSpend].some((scenario) => scenario.status !== 'ok') || breakEvenRoas == null) {
    return { status: 'insufficient_data', source: FINANCIAL_SOURCES.SIMULACION_EDITABLE, missing: ['calculationInputs'] };
  }
  return {
    status: 'ok', source: FINANCIAL_SOURCES.SIMULACION_EDITABLE, state,
    contributionAmount, contributionMarginRate: marginRate, breakEvenRoas,
    subscriptionContribution, subscriptionMarginRate, subscriptionBreakEvenRoas,
    discountedContribution, marginalCacSegments, marginalCac8to16, scenarios,
    proposedChanges: {
      baseline: scenarios.agency,
      changeA: compareChange(packAtAgencySpend, scenarios.agency),
      changeB: compareChange(agencyAtActualSpend, scenarios.agency),
      combined: compareChange(scenarios.pack, scenarios.agency),
    },
  };
}
