import {
  calculateBreakEvenRoas,
  calculateCac,
  calculateContributionMargin,
  calculateContributionMarginRate,
  calculateLtv12Months,
  calculateLtvCacRatio,
  calculatePayback,
  calculatePaybackFirstWholeMonth,
  calculateRoas,
} from '../calculations/financialEngine.js';
import { FINANCIAL_SOURCES } from './contracts.js';

const insufficient = (missing) => ({ status: 'insufficient_data', missing });
const resultValue = (result, selector = (value) => value) => result?.status === 'ok' ? selector(result.value) : null;

function requiredAssumptions(assumptions) {
  const fields = [
    'pricePerBag', 'bagsPerOrder', 'coffeeCostPerBag', 'shippingCost',
    'paymentFeePercent', 'paymentFeeFixed', 'orderPackagingCost',
    'subscriptionPrice', 'monthlyChurnRate', 'advertisingSpend', 'agencyFees',
    'acquiredCustomers', 'attributedRevenue', 'oneTimeCustomerShare',
    'subscriberShare', 'oneTimeOrdersByMonth',
  ];
  return fields.filter((field) => assumptions?.[field] == null);
}

export function calculateFinancialSnapshot(contract) {
  const missing = requiredAssumptions(contract?.assumptions);
  if (!contract?.source || missing.length) {
    return {
      source: contract?.source ?? null,
      label: contract?.label ?? 'Fuente financiera incompleta',
      status: 'insufficient_data',
      missing: [...(!contract?.source ? ['source'] : []), ...missing],
      metrics: {},
    };
  }

  if (![FINANCIAL_SOURCES.EXCEL_ORIGINAL, FINANCIAL_SOURCES.SIMULACION_EDITABLE].includes(contract.source)) {
    return {
      source: contract.source,
      label: contract.label,
      status: 'not_applicable',
      missing: ['financialAssumptions'],
      metrics: {},
    };
  }

  const assumptions = contract.assumptions;
  const orderPrice = assumptions.pricePerBag * assumptions.bagsPerOrder;
  const productCosts = [assumptions.coffeeCostPerBag * assumptions.bagsPerOrder];
  const sharedMarginInput = {
    productVariableCosts: productCosts,
    shippingCost: assumptions.shippingCost,
    paymentFeePercent: assumptions.paymentFeePercent,
    paymentFeeFixed: assumptions.paymentFeeFixed,
    otherOrderCost: assumptions.orderPackagingCost,
  };
  const contributionMargin = calculateContributionMargin({ sellingPrice: orderPrice, ...sharedMarginInput });
  const contributionAmount = resultValue(contributionMargin, (value) => value.amount);
  const contributionMarginRate = contributionAmount == null
    ? insufficient(['contributionMargin'])
    : calculateContributionMarginRate({ contributionMargin: contributionAmount, revenue: orderPrice });
  const marginRate = resultValue(contributionMarginRate);
  const breakEvenRoas = marginRate == null
    ? insufficient(['contributionMarginRate'])
    : calculateBreakEvenRoas({ contributionMarginRate: marginRate });
  const subscriptionMargin = calculateContributionMargin({ sellingPrice: assumptions.subscriptionPrice, ...sharedMarginInput });
  const subscriptionAmount = resultValue(subscriptionMargin, (value) => value.amount);
  const cac = calculateCac({
    advertisingSpend: assumptions.advertisingSpend,
    agencyFees: assumptions.agencyFees,
    acquiredCustomers: assumptions.acquiredCustomers,
  });
  const roas = calculateRoas({
    attributedRevenue: assumptions.attributedRevenue,
    advertisingSpend: assumptions.advertisingSpend,
  });

  const monthlyContributionMargins = contributionAmount == null || subscriptionAmount == null
    ? null
    : assumptions.oneTimeOrdersByMonth.map((orders, index) => (
      assumptions.oneTimeCustomerShare * orders * contributionAmount
      + assumptions.subscriberShare * ((1 - assumptions.monthlyChurnRate) ** index) * subscriptionAmount
    ));
  const ltv12Months = monthlyContributionMargins
    ? calculateLtv12Months({
      initialContributionMargin: 0,
      months: monthlyContributionMargins.map((value, index) => ({
        month: index + 1,
        repurchaseProbability: 1,
        quantity: 1,
        contributionMargin: value,
      })),
    })
    : insufficient(['monthlyContributionMargins']);
  const ltv = resultValue(ltv12Months, (value) => value.ltv);
  const cacValue = resultValue(cac);
  const ltvCacRatio = ltv == null || cacValue == null
    ? insufficient(['ltv12Months', 'cac'])
    : calculateLtvCacRatio({ ltv, cac: cacValue });
  const paybackInterpolated = monthlyContributionMargins && cacValue != null
    ? calculatePayback({ cac: cacValue, monthlyContributionMargins })
    : insufficient(['monthlyContributionMargins', 'cac']);
  const paybackFirstWholeMonth = monthlyContributionMargins && cacValue != null
    ? calculatePaybackFirstWholeMonth({ cac: cacValue, monthlyContributionMargins })
    : insufficient(['monthlyContributionMargins', 'cac']);

  return {
    source: contract.source,
    label: contract.label,
    status: 'ok',
    assumptions,
    monthlyContributionMargins,
    metrics: {
      contributionMargin,
      contributionMarginRate,
      breakEvenRoas,
      cac,
      roas,
      ltv12Months,
      ltvCacRatio,
      paybackInterpolated,
      paybackFirstWholeMonth,
    },
  };
}
