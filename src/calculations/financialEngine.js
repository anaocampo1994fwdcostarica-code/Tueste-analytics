const ok = (value) => ({ status: 'ok', value });
const insufficient = (missing) => ({ status: 'insufficient_data', missing: [...new Set(missing)] });
const invalid = (errors) => ({ status: 'invalid_data', errors });

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const missingFields = (input, fields) => fields.filter((field) => input?.[field] == null);
const invalidNonNegative = (input, fields) => fields.filter((field) => !isNumber(input[field]) || input[field] < 0);

export function calculateContributionMargin(input = {}) {
  const required = ['sellingPrice', 'productVariableCosts', 'shippingCost', 'paymentFeePercent', 'paymentFeeFixed', 'otherOrderCost'];
  const missing = missingFields(input, required);
  if (missing.length) return insufficient(missing);
  if (!Array.isArray(input.productVariableCosts)) return invalid(['productVariableCosts debe ser un arreglo.']);
  const scalarFields = required.filter((field) => field !== 'productVariableCosts');
  const badFields = invalidNonNegative(input, scalarFields);
  const badCosts = input.productVariableCosts.some((cost) => !isNumber(cost) || cost < 0);
  if (badFields.length || badCosts || input.paymentFeePercent > 1) {
    return invalid([
      ...badFields.map((field) => `${field} debe ser un numero no negativo.`),
      ...(badCosts ? ['Cada costo de producto debe ser un numero no negativo.'] : []),
      ...(input.paymentFeePercent > 1 ? ['paymentFeePercent debe expresarse entre 0 y 1.'] : []),
    ]);
  }
  const productCost = input.productVariableCosts.reduce((total, cost) => total + cost, 0);
  const paymentFee = input.sellingPrice * input.paymentFeePercent + input.paymentFeeFixed;
  const variableCost = productCost + input.shippingCost + paymentFee + input.otherOrderCost;
  return ok({ amount: input.sellingPrice - variableCost, variableCost, productCost, paymentFee });
}

export function calculateContributionMarginRate(input = {}) {
  const missing = missingFields(input, ['contributionMargin', 'revenue']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.contributionMargin) || !isNumber(input.revenue) || input.revenue <= 0) {
    return invalid(['contributionMargin debe ser numerico y revenue debe ser mayor que cero.']);
  }
  return ok(input.contributionMargin / input.revenue);
}

export function calculateCac(input = {}) {
  const required = ['advertisingSpend', 'agencyFees', 'acquiredCustomers'];
  const missing = missingFields(input, required);
  if (missing.length) return insufficient(missing);
  if (invalidNonNegative(input, required).length || input.acquiredCustomers <= 0) {
    return invalid(['Los importes deben ser no negativos y acquiredCustomers debe ser mayor que cero.']);
  }
  return ok((input.advertisingSpend + input.agencyFees) / input.acquiredCustomers);
}

// El CAC marginal del caso usa únicamente el incremento de inversión
// publicitaria. El fee fijo se informa por separado porque se cancela entre
// dos tramos con agencia activa y no debe confundirse con CAC promedio real.
export function calculateMarginalCac(input = {}) {
  const required = ['fromSpend', 'toSpend', 'fromCustomers', 'toCustomers'];
  const missing = missingFields(input, required);
  if (missing.length) return insufficient(missing);
  if (invalidNonNegative(input, required).length || input.toSpend <= input.fromSpend || input.toCustomers <= input.fromCustomers) {
    return invalid(['El tramo debe aumentar tanto la inversión como los clientes.']);
  }
  return ok((input.toSpend - input.fromSpend) / (input.toCustomers - input.fromCustomers));
}

export function calculateRoas(input = {}) {
  const required = ['attributedRevenue', 'advertisingSpend'];
  const missing = missingFields(input, required);
  if (missing.length) return insufficient(missing);
  if (invalidNonNegative(input, required).length || input.advertisingSpend <= 0) {
    return invalid(['attributedRevenue debe ser no negativo y advertisingSpend debe ser mayor que cero.']);
  }
  return ok(input.attributedRevenue / input.advertisingSpend);
}

export function calculateBreakEvenRoas(input = {}) {
  const missing = missingFields(input, ['contributionMarginRate']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.contributionMarginRate) || input.contributionMarginRate <= 0 || input.contributionMarginRate > 1) {
    return invalid(['contributionMarginRate debe estar en el intervalo (0, 1].']);
  }
  return ok(1 / input.contributionMarginRate);
}

export function calculateLtv12Months(input = {}) {
  const missing = missingFields(input, ['initialContributionMargin', 'months']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.initialContributionMargin) || !Array.isArray(input.months)) {
    return invalid(['initialContributionMargin debe ser numerico y months debe ser un arreglo.']);
  }
  const byMonth = new Map(input.months.map((month) => [month.month, month]));
  const absentMonths = Array.from({ length: 12 }, (_, index) => index + 1).filter((month) => !byMonth.has(month));
  if (absentMonths.length) return insufficient(absentMonths.map((month) => `months[${month}]`));

  let repeatContribution = 0;
  for (let monthNumber = 1; monthNumber <= 12; monthNumber += 1) {
    const month = byMonth.get(monthNumber);
    const fields = ['repurchaseProbability', 'quantity', 'contributionMargin'];
    const monthMissing = missingFields(month, fields);
    if (monthMissing.length) return insufficient(monthMissing.map((field) => `months[${monthNumber}].${field}`));
    if (invalidNonNegative(month, fields).length || month.repurchaseProbability > 1) {
      return invalid([`Los valores del mes ${monthNumber} no son validos.`]);
    }
    repeatContribution += month.repurchaseProbability * month.quantity * month.contributionMargin;
  }
  return ok({ ltv: input.initialContributionMargin + repeatContribution, initialContribution: input.initialContributionMargin, repeatContribution });
}

export function calculateLtvCacRatio(input = {}) {
  const missing = missingFields(input, ['ltv', 'cac']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.ltv) || input.ltv < 0 || !isNumber(input.cac) || input.cac <= 0) {
    return invalid(['ltv debe ser no negativo y cac debe ser mayor que cero.']);
  }
  return ok(input.ltv / input.cac);
}

export function calculatePayback(input = {}) {
  const missing = missingFields(input, ['cac', 'monthlyContributionMargins']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.cac) || input.cac < 0 || !Array.isArray(input.monthlyContributionMargins) || input.monthlyContributionMargins.length === 0) {
    return invalid(['cac debe ser no negativo y monthlyContributionMargins debe contener al menos un mes.']);
  }
  if (input.monthlyContributionMargins.some((value) => !isNumber(value) || value < 0)) {
    return invalid(['Las contribuciones mensuales deben ser numeros no negativos.']);
  }
  if (input.cac === 0) return ok({ months: 0, cumulativeContribution: 0 });

  let cumulative = 0;
  for (let index = 0; index < input.monthlyContributionMargins.length; index += 1) {
    const contribution = input.monthlyContributionMargins[index];
    if (cumulative + contribution >= input.cac && contribution > 0) {
      const fraction = (input.cac - cumulative) / contribution;
      return ok({ months: index + fraction, cumulativeContribution: cumulative + contribution });
    }
    cumulative += contribution;
  }
  return { status: 'not_recovered', value: { months: null, cumulativeContribution: cumulative } };
}

// Compatible con Excel MATCH(TRUE, curva>=0, 0): devuelve el primer mes entero
// cuyo acumulado recupera el CAC. Se mantiene separado del payback interpolado.
export function calculatePaybackFirstWholeMonth(input = {}) {
  const missing = missingFields(input, ['cac', 'monthlyContributionMargins']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.cac) || input.cac < 0 || !Array.isArray(input.monthlyContributionMargins) || input.monthlyContributionMargins.length === 0) {
    return invalid(['cac debe ser no negativo y monthlyContributionMargins debe contener al menos un mes.']);
  }
  if (input.monthlyContributionMargins.some((value) => !isNumber(value) || value < 0)) {
    return invalid(['Las contribuciones mensuales deben ser numeros no negativos.']);
  }
  if (input.cac === 0) return ok({ month: 0, cumulativeContribution: 0 });

  let cumulative = 0;
  for (let index = 0; index < input.monthlyContributionMargins.length; index += 1) {
    cumulative += input.monthlyContributionMargins[index];
    if (cumulative >= input.cac) return ok({ month: index + 1, cumulativeContribution: cumulative });
  }
  return { status: 'not_recovered', value: { month: null, cumulativeContribution: cumulative } };
}

export function calculateMonthlyCashFlow(input = {}) {
  const missing = missingFields(input, ['initialCash', 'months']);
  if (missing.length) return insufficient(missing);
  if (!isNumber(input.initialCash) || !Array.isArray(input.months) || input.months.length === 0) {
    return invalid(['initialCash debe ser numerico y months debe contener al menos un mes.']);
  }
  let endingCash = input.initialCash;
  const rows = [];
  for (let index = 0; index < input.months.length; index += 1) {
    const month = input.months[index];
    const fields = ['revenue', 'variableCosts', 'fixedCosts', 'advertisingSpend', 'otherInflows', 'otherOutflows'];
    const monthMissing = missingFields(month, fields);
    if (monthMissing.length) return insufficient(monthMissing.map((field) => `months[${index + 1}].${field}`));
    if (invalidNonNegative(month, fields).length) return invalid([`Los flujos del mes ${index + 1} deben ser numeros no negativos.`]);
    const openingCash = endingCash;
    const netCashFlow = month.revenue + month.otherInflows - month.variableCosts - month.fixedCosts - month.advertisingSpend - month.otherOutflows;
    endingCash = openingCash + netCashFlow;
    rows.push({ month: month.month ?? index + 1, openingCash, netCashFlow, endingCash });
  }
  return ok({ months: rows, endingCash });
}

export function compareScenarios(input = {}) {
  if (!Array.isArray(input.scenarios) || input.scenarios.length === 0) return insufficient(['scenarios']);
  const metricKeys = input.metricKeys ?? ['contributionMargin', 'roas', 'ltvCacRatio', 'endingCash'];
  const rankings = {};
  const missing = [];
  for (const metric of metricKeys) {
    const available = input.scenarios.filter((scenario) => isNumber(scenario.metrics?.[metric]));
    if (available.length !== input.scenarios.length) {
      missing.push(...input.scenarios.filter((scenario) => !isNumber(scenario.metrics?.[metric])).map((scenario) => `${scenario.name}.${metric}`));
    }
    rankings[metric] = available
      .map((scenario) => ({ name: scenario.name, value: scenario.metrics[metric] }))
      .sort((a, b) => b.value - a.value);
  }
  const value = { rankings, comparedScenarios: input.scenarios.length };
  return missing.length ? { ...insufficient(missing), partial: value } : ok(value);
}
