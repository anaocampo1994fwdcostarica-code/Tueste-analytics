export const FINANCIAL_SOURCES = Object.freeze({
  EXCEL_ORIGINAL: 'EXCEL_ORIGINAL',
  SIMULACION_EDITABLE: 'SIMULACION_EDITABLE',
  MYSQL_DEMO: 'MYSQL_DEMO',
});

const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const excelAssumptions = {
  pricePerBag: 17,
  bagsPerOrder: 2,
  coffeeCostPerBag: 5.44,
  shippingCost: 4.5,
  paymentFeePercent: 0.045,
  paymentFeeFixed: 0,
  orderPackagingCost: 1.2,
  subscriptionPrice: 30.6,
  monthlyChurnRate: 0.09,
  advertisingSpend: 8000,
  agencyFees: 1000,
  acquiredCustomers: 165,
  attributedRevenue: 24000,
  oneTimeCustomerShare: 0.85,
  subscriberShare: 0.15,
  oneTimeOrdersByMonth: [1, 0.15, 0.2, 0.2, 0.2, 0.2, 0.2, 0.15, 0.15, 0.15, 0.2, 0.2],
};

export const EXCEL_ORIGINAL = deepFreeze({
  source: FINANCIAL_SOURCES.EXCEL_ORIGINAL,
  label: 'Modelo financiero original del Excel',
  reference: 'Tueste_Calculadora_Con_Caja_Empresarial.xlsx',
  assumptions: excelAssumptions,
  verifiedResults: {
    contributionMargin: 15.89,
    contributionMarginRate: 0.4673529411764705,
    breakEvenRoas: 2.139710509754563,
    cac: 54.54545454545455,
    roas: 3,
    ltv12Months: 54.79607068771631,
    ltvCacRatio: 1.004594629274799,
    paybackFirstWholeMonth: 12,
    paybackInterpolatedMonths: 11.925706878185695,
  },
});

export const SIMULATION_DEFAULTS = deepFreeze({
  metaActual: 8000,
  metaAgency: 16000,
  price: 34,
  bagCost: 5.44,
  shipping: 4.5,
  paymentFeePercent: 0.045,
  packaging: 1.2,
  subscriptionPrice: 30.6,
  churn: 0.09,
  actualDiscount: 0,
  discount: 0.30,
  packPrice: 48,
  packAdoption: 1,
  packPackaging: 1.4,
  freeShippingThreshold: 45,
  initialCash: 35000,
  fixedCosts: 6500,
  agencyFee: 1000,
  existingContribution: 9000,
  existingDecay: 0.03,
  organicCustomers: 47,
  oneTimeShare: 0.85,
  safetyFloor: 5000,
  oneTimeOrdersByMonth: [...EXCEL_ORIGINAL.assumptions.oneTimeOrdersByMonth],
  acquisitionHistory: [[0, 0], [4000, 100], [8000, 165], [12000, 210], [16000, 235], [20000, 250]],
});

export function createEditableSimulation(overrides = {}) {
  return {
    source: FINANCIAL_SOURCES.SIMULACION_EDITABLE,
    label: 'Simulación editable del usuario',
    basedOn: FINANCIAL_SOURCES.EXCEL_ORIGINAL,
    assumptions: { ...EXCEL_ORIGINAL.assumptions, ...overrides },
  };
}

export function createMysqlDemoContract(commercialData, meta = {}) {
  return {
    source: FINANCIAL_SOURCES.MYSQL_DEMO,
    label: 'Datos comerciales ficticios de MySQL',
    commercialData: commercialData ?? null,
    meta: { ...meta },
  };
}
