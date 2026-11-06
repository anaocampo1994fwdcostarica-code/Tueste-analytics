import { calculateContributionMargin } from '../calculations/financialEngine.js';
import { SIMULATION_DEFAULTS } from './contracts.js';
import { interpolateAcquiredCustomers } from './simulationModel.js';

export const LEVEL_THREE_MONTHS = 24;
export const INVESTMENT_MIN = 0;
export const INVESTMENT_MAX = 20000;
export const TIE_TOLERANCE = 0.01;

const repeat = (value) => Array.from({ length: LEVEL_THREE_MONTHS }, () => value);
const block = (first, second) => [...Array(12).fill(first), ...Array(12).fill(second)];

export const LEVEL_THREE_DEFAULTS = Object.freeze({
  ...SIMULATION_DEFAULTS,
  months: LEVEL_THREE_MONTHS,
});

const baseChanges = () => ({
  pack: false,
  packFromMonth: 1,
  alternativeShipping: false,
  shippingFromMonth: 1,
  discount: false,
  discountFromMonth: 1,
  discountThroughMonth: 24,
});

export function createDefaultPlans() {
  return [
    { id: 'actual', name: 'Plan 1 · Actual', investments: repeat(8000), subscriberShare: 0.15, churn: 0.09, changes: baseChanges(), locked: true },
    { id: 'agency', name: 'Plan 2 · Agencia', investments: repeat(16000), subscriberShare: 0.15, churn: 0.09, changes: { ...baseChanges(), discount: true }, locked: true },
    { id: 'ownA', name: 'Plan 3 · Estrategia propia A', investments: repeat(8000), subscriberShare: 0.15, churn: 0.09, changes: { ...baseChanges(), pack: true, alternativeShipping: true }, locked: false },
    { id: 'ownB', name: 'Plan 4 · Estrategia propia B', investments: block(4000, 6000).map((value, index) => index >= 6 && index < 12 ? 8000 : value), subscriberShare: 0.15, churn: 0.09, changes: { ...baseChanges(), pack: true, alternativeShipping: true, packFromMonth: 7, shippingFromMonth: 7 }, locked: false },
  ];
}

const valueOf = (result) => result?.status === 'ok' ? result.value.amount : null;

function transactionContribution(state, { price, bags, packaging, sellerPaysShipping }) {
  return valueOf(calculateContributionMargin({
    sellingPrice: price,
    productVariableCosts: [bags * state.bagCost],
    shippingCost: sellerPaysShipping ? state.shipping : 0,
    paymentFeePercent: state.paymentFeePercent,
    paymentFeeFixed: 0,
    otherOrderCost: packaging,
  }));
}

export function calculateLevelThreeUnitEconomics(state = LEVEL_THREE_DEFAULTS) {
  return {
    standard: transactionContribution(state, { price: state.price, bags: 2, packaging: state.packaging, sellerPaysShipping: true }),
    subscription: transactionContribution(state, { price: state.subscriptionPrice, bags: 2, packaging: state.packaging, sellerPaysShipping: true }),
    pack: transactionContribution(state, { price: state.packPrice, bags: 3, packaging: state.packPackaging, sellerPaysShipping: state.packPrice >= state.freeShippingThreshold }),
  };
}

const active = (enabled, from, month, through = 24) => Boolean(enabled) && month >= from && month <= through;

function contributionsAt(state, plan, month, age) {
  const shippingPolicy = active(plan.changes.alternativeShipping, plan.changes.shippingFromMonth, month);
  const packActive = active(plan.changes.pack, plan.changes.packFromMonth, month);
  const discountActive = age === 0 && active(plan.changes.discount, plan.changes.discountFromMonth, month, plan.changes.discountThroughMonth);
  const standardPrice = discountActive ? state.price * (1 - state.discount) : state.price;
  const standard = transactionContribution(state, {
    price: standardPrice,
    bags: 2,
    packaging: state.packaging,
    sellerPaysShipping: !shippingPolicy || standardPrice >= state.freeShippingThreshold,
  });
  const subscription = transactionContribution(state, {
    price: state.subscriptionPrice,
    bags: 2,
    packaging: state.packaging,
    sellerPaysShipping: !shippingPolicy || state.subscriptionPrice >= state.freeShippingThreshold,
  });
  const packContribution = transactionContribution(state, {
    price: state.packPrice,
    bags: 3,
    packaging: state.packPackaging,
    sellerPaysShipping: !shippingPolicy || state.packPrice >= state.freeShippingThreshold,
  });
  const oneTime = packActive ? standard * (1 - state.packAdoption) + packContribution * state.packAdoption : standard;
  return { oneTime, subscription };
}

export function ordersForCohortAge(ageIndex, distribution = SIMULATION_DEFAULTS.oneTimeOrdersByMonth) {
  if (!Number.isInteger(ageIndex) || ageIndex < 0 || ageIndex >= LEVEL_THREE_MONTHS) return 0;
  return ageIndex < 12 ? distribution[ageIndex] : 0.10;
}

function normalizePlan(plan) {
  return {
    ...plan,
    investments: Array.isArray(plan.investments) ? [...plan.investments] : [],
    subscriberShare: Number.isFinite(plan.subscriberShare) ? plan.subscriberShare : 0.15,
    churn: Number.isFinite(plan.churn) ? plan.churn : 0.09,
    changes: { ...baseChanges(), ...plan.changes },
  };
}

export function simulateLevelThreePlan(rawPlan, state = LEVEL_THREE_DEFAULTS) {
  const plan = normalizePlan(rawPlan);
  if (plan.investments.length !== LEVEL_THREE_MONTHS) return { status: 'invalid_input', plan, reasons: ['El plan debe contener exactamente 24 inversiones.'] };
  const cohorts = [];
  const rows = [];
  const budgetViolations = [];
  let openingCash = state.initialCash;

  for (let month = 1; month <= LEVEL_THREE_MONTHS; month += 1) {
    const investment = Number(plan.investments[month - 1]);
    if (!Number.isFinite(investment) || investment < INVESTMENT_MIN || investment > INVESTMENT_MAX) budgetViolations.push(month);
    const safeInvestment = Number.isFinite(investment) ? investment : 0;
    const metaCustomers = interpolateAcquiredCustomers(Math.max(INVESTMENT_MIN, Math.min(INVESTMENT_MAX, safeInvestment)), state.acquisitionHistory);
    const organicCustomers = state.organicCustomers;
    const totalNewCustomers = metaCustomers + organicCustomers;
    const subscribers = totalNewCustomers * plan.subscriberShare;
    const oneTimeCustomers = totalNewCustomers - subscribers;
    cohorts.push({ month, totalNewCustomers, subscribers, oneTimeCustomers });

    let cohortContribution = 0;
    let activeSubscribers = 0;
    for (const cohort of cohorts) {
      const age = month - cohort.month;
      const unit = contributionsAt(state, plan, month, age);
      const retainedSubscribers = cohort.subscribers * ((1 - plan.churn) ** age);
      activeSubscribers += retainedSubscribers;
      cohortContribution += cohort.oneTimeCustomers * ordersForCohortAge(age, state.oneTimeOrdersByMonth) * unit.oneTime;
      cohortContribution += retainedSubscribers * unit.subscription;
    }

    const existingContribution = state.existingContribution * ((1 - state.existingDecay) ** (month - 1));
    const agencyFee = safeInvestment > 0 ? state.agencyFee : 0;
    const totalOutflows = safeInvestment + agencyFee + state.fixedCosts;
    const endingCash = openingCash + existingContribution + cohortContribution - totalOutflows;
    rows.push({
      month,
      investment: safeInvestment,
      metaCustomers,
      organicCustomers,
      totalNewCustomers,
      oneTimeCustomers,
      newSubscribers: subscribers,
      existingContribution,
      cohortContribution,
      advertisingSpend: safeInvestment,
      agencyFee,
      fixedCosts: state.fixedCosts,
      totalOutflows,
      openingCash,
      endingCash,
      activeSubscribers,
      safetyAlert: endingCash < state.safetyFloor,
    });
    openingCash = endingCash;
  }

  const averageFirst12Investment = plan.investments.slice(0, 12).reduce((sum, value) => sum + Number(value), 0) / 12;
  const postMonth12Violations = plan.investments.slice(12).map(Number).map((value, index) => value + 1e-9 < averageFirst12Investment ? index + 13 : null).filter(Boolean);
  const floorViolations = rows.filter((row) => row.endingCash < state.safetyFloor).map((row) => row.month);
  const reasons = [];
  if (budgetViolations.length) reasons.push(`Inversión fuera de USD 0–20.000 en mes(es): ${budgetViolations.join(', ')}.`);
  if (floorViolations.length) reasons.push(`Caja bajo USD ${state.safetyFloor.toLocaleString('es-CR')} en mes(es): ${floorViolations.join(', ')}.`);
  if (postMonth12Violations.length) reasons.push(`Inversión inferior al promedio de meses 1–12 (${averageFirst12Investment.toFixed(2)}) en mes(es): ${postMonth12Violations.join(', ')}.`);
  const minimumRow = rows.reduce((minimum, row) => row.endingCash < minimum.endingCash ? row : minimum, rows[0]);
  return {
    status: 'ok',
    plan,
    rows,
    cashSeries: [state.initialCash, ...rows.map((row) => row.endingCash)],
    valid: reasons.length === 0,
    reasons,
    violations: { budget: budgetViolations, floor: floorViolations, postMonth12: postMonth12Violations },
    averageFirst12Investment,
    minimumCash: minimumRow.endingCash,
    minimumCashMonth: minimumRow.month,
    finalCash: rows.at(-1).endingCash,
    activeSubscribersMonth24: rows.at(-1).activeSubscribers,
    totalInvestment: plan.investments.reduce((sum, value) => sum + Number(value), 0),
  };
}

export function simulateFourPlans(plans = createDefaultPlans(), state = LEVEL_THREE_DEFAULTS) {
  const results = plans.map((plan) => simulateLevelThreePlan(plan, state));
  return { status: results.every((result) => result.status === 'ok') ? 'ok' : 'invalid_input', results, ranking: rankValidPlans(results), chart: { months: Array.from({ length: 25 }, (_, index) => index), floor: state.safetyFloor, initialCash: state.initialCash, series: results.map((result) => ({ id: result.plan.id, name: result.plan.name, data: result.cashSeries, violationMonths: result.violations?.floor ?? [] })) } };
}

export function rankValidPlans(results, tolerance = TIE_TOLERANCE) {
  return results.filter((result) => result.status === 'ok' && result.valid).sort((a, b) => {
    if (Math.abs(b.finalCash - a.finalCash) > tolerance) return b.finalCash - a.finalCash;
    return b.activeSubscribersMonth24 - a.activeSubscribersMonth24;
  });
}

export function verifyManualMonthOne(state = LEVEL_THREE_DEFAULTS) {
  const metaSpend = 8000;
  const metaCustomers = 165;
  const organicCustomers = 47;
  const totalNewCustomers = metaCustomers + organicCustomers; // 212
  const oneTimeShare = 0.85;
  const subscriberShare = 0.15;
  const oneTimeCustomers = totalNewCustomers * oneTimeShare; // 180.2
  const subscribers = totalNewCustomers * subscriberShare; // 31.8

  // Margen unitario calculado manualmente de forma independiente
  const manualOneTimeUnit = 34 - (2 * 5.44) - 4.50 - (34 * 0.045) - 1.20; // 15.89
  const manualSubscriptionUnit = 30.60 - (2 * 5.44) - 4.50 - (30.60 * 0.045) - 1.20; // 12.643

  // Contribución de cohorte en mes 1 (edad 0: 1.0 pedido suelto y 100% retención suscripción)
  const oneTimeContributionTotal = oneTimeCustomers * 1.0 * manualOneTimeUnit; // 2863.378
  const subscriptionContributionTotal = subscribers * 1.0 * manualSubscriptionUnit; // 402.0474
  const cohortContribution = oneTimeContributionTotal + subscriptionContributionTotal; // 3265.4254

  const existingContribution = 9000;
  const investment = metaSpend;
  const agencyFee = 1000;
  const fixedCosts = 6500;
  const totalOutflows = investment + agencyFee + fixedCosts; // 15500

  const openingCash = 35000;
  const endingCash = openingCash + existingContribution + cohortContribution - totalOutflows; // 31765.4254

  const engineResult = simulateLevelThreePlan(createDefaultPlans()[0], state);
  const engineRow = engineResult.rows[0];
  const engineEndingCash = engineRow.endingCash;
  const difference = Math.abs(engineEndingCash - endingCash);
  const matchesEngine = difference < 1e-6;

  const steps = [
    {
      step: 1,
      title: 'Clientes adquiridos en mes 1',
      formula: 'Total nuevos = Clientes Meta (8.000) + Clientes orgánicos',
      substitution: `Total nuevos = ${metaCustomers} + ${organicCustomers} = ${totalNewCustomers} clientes`,
      result: `${totalNewCustomers} clientes`,
    },
    {
      step: 2,
      title: 'Segmentación de clientes nuevos',
      formula: 'Sueltos (85%) = Total × 0.85 | Suscriptores (15%) = Total × 0.15',
      substitution: `Sueltos = ${totalNewCustomers} × 0.85 = ${oneTimeCustomers.toFixed(1)} | Suscriptores = ${totalNewCustomers} × 0.15 = ${subscribers.toFixed(1)}`,
      result: `${oneTimeCustomers.toFixed(1)} sueltos, ${subscribers.toFixed(1)} suscriptores`,
    },
    {
      step: 3,
      title: 'Margen de contribución unitario',
      formula: 'Contribución = Precio − Café(2 bolsas) − Envío − Pasarela(4.5%) − Empaque',
      substitution: `Suelto = 34.00 − 10.88 − 4.50 − 1.53 − 1.20 = 15.89 | Suscripción = 30.60 − 10.88 − 4.50 − 1.377 − 1.20 = 12.643`,
      result: `Suelto: $${manualOneTimeUnit.toFixed(2)}, Suscripción: $${manualSubscriptionUnit.toFixed(3)}`,
    },
    {
      step: 4,
      title: 'Contribución total de la nueva cohorte',
      formula: 'Cohorte = (Sueltos × 1.0 × Margen suelto) + (Suscriptores × 1.0 × Margen suscripción)',
      substitution: `(${oneTimeCustomers.toFixed(1)} × 15.89) + (${subscribers.toFixed(1)} × 12.643) = ${oneTimeContributionTotal.toFixed(3)} + ${subscriptionContributionTotal.toFixed(4)} = ${cohortContribution.toFixed(4)}`,
      result: `$${cohortContribution.toFixed(2)}`,
    },
    {
      step: 5,
      title: 'Contribución de clientes existentes',
      formula: 'Contribución mes 1 = USD 9.000 fijos (decae 3% mensual en meses posteriores)',
      substitution: `Existentes mes 1 = 9.000.00`,
      result: '$9,000.00',
    },
    {
      step: 6,
      title: 'Salidas de caja del mes 1',
      formula: 'Salidas = Inversión Meta + Fee agencia + Costos fijos',
      substitution: `${investment} + ${agencyFee} + ${fixedCosts} = ${totalOutflows}`,
      result: `$${totalOutflows.toLocaleString('es-CR')}`,
    },
    {
      step: 7,
      title: 'Caja final calculada independientemente',
      formula: 'Caja final = Caja inicial + Existentes + Cohorte − Salidas',
      substitution: `${openingCash} + ${existingContribution} + ${cohortContribution.toFixed(4)} − ${totalOutflows} = ${endingCash.toFixed(4)}`,
      result: `$${endingCash.toFixed(2)}`,
    },
    {
      step: 8,
      title: 'Contraste riguroso con motor de simulación',
      formula: '|Caja manual − Caja motor| < 0.000001',
      substitution: `|${endingCash.toFixed(4)} − ${engineEndingCash.toFixed(4)}| = ${difference.toFixed(8)}`,
      result: matchesEngine ? 'Coincidencia exacta demostrada (100% paridad)' : 'Discrepancia detectada',
    },
  ];

  return {
    metaCustomers,
    organicCustomers,
    totalNewCustomers,
    oneTimeCustomers,
    subscribers,
    oneTimeUnitContribution: manualOneTimeUnit,
    subscriptionUnitContribution: manualSubscriptionUnit,
    oneTimeContribution: manualOneTimeUnit,
    subscriptionContribution: manualSubscriptionUnit,
    oneTimeContributionTotal,
    subscriptionContributionTotal,
    cohortContribution,
    existingContribution,
    investment,
    agencyFee,
    fixedCosts,
    totalOutflows,
    openingCash,
    endingCash,
    engineEndingCash,
    difference,
    matchesEngine,
    steps,
  };
}

export function updatePlanChanges(plan, changes) {
  return { ...plan, changes: { ...plan.changes, ...changes } };
}

export function updatePlanParameters(plan, params) {
  return { ...plan, ...params };
}

export function resetPlan(planId) {
  const defaults = createDefaultPlans();
  return defaults.find((p) => p.id === planId) ?? defaults[0];
}

export function findBestPlan(state = LEVEL_THREE_DEFAULTS, step = 2000) {
  const budgets = Array.from({ length: INVESTMENT_MAX / step + 1 }, (_, index) => index * step);
  const evaluated = [];
  for (const firstBlock of budgets) {
    for (const secondBlock of budgets.filter((value) => value >= firstBlock)) {
      for (const strategy of ['original', 'pack']) {
        const plan = {
          id: `search-${strategy}-${firstBlock}-${secondBlock}`,
          name: `Búsqueda ${strategy} · ${firstBlock}/${secondBlock}`,
          investments: block(firstBlock, secondBlock),
          subscriberShare: 0.15,
          churn: 0.09,
          changes: strategy === 'pack' ? { ...baseChanges(), pack: true, alternativeShipping: true } : baseChanges(),
        };
        evaluated.push(simulateLevelThreePlan(plan, state));
      }
    }
  }
  const ranking = rankValidPlans(evaluated);
  return { method: `Búsqueda heurística reproducible por dos bloques de 12 meses, paso USD ${step.toLocaleString('es-CR')}, con oferta original y Pack.`, exact: false, evaluatedCount: evaluated.length, feasibleCount: ranking.length, best: ranking[0] ?? null, top: ranking.slice(0, 5) };
}

export function createInvestmentPitch(result, state = LEVEL_THREE_DEFAULTS) {
  if (!result || result.status !== 'ok') return 'No hay un plan calculado para elaborar el pitch.';
  const average = result.totalInvestment / 24;
  const risk = result.valid ? `La caja mínima es USD ${result.minimumCash.toFixed(2)} en el mes ${result.minimumCashMonth}.` : `El plan es inválido: ${result.reasons.join(' ')}`;
  return `Proponemos invertir en promedio USD ${average.toFixed(2)} mensuales en Meta bajo ${result.plan.name}. `
    + `El plan termina el mes 24 con USD ${result.finalCash.toFixed(2)} y ${result.activeSubscribersMonth24.toFixed(1)} suscriptores activos. ${risk} `
    + `El principal riesgo es que la respuesta histórica de clientes no se mantenga y que los supuestos de Pack o retención no se materialicen. `
    + `Solo aumentaríamos inversión si la caja se mantiene sobre USD ${state.safetyFloor.toFixed(2)}, el CAC marginal sigue cubierto por la contribución y los resultados reales confirman conversión y retención. `
    + `No recomendamos aceptar automáticamente la propuesta de la agencia: su descuento reduce la contribución del primer pedido y cualquier plan que rompa el piso queda descartado.`;
}

export function updatePlanInvestment(plan, month, value) {
  const investments = [...plan.investments];
  investments[month - 1] = Number(value);
  return { ...plan, investments };
}

export function applyInvestmentRange(plan, fromMonth, toMonth, value) {
  const investments = plan.investments.map((current, index) => index + 1 >= fromMonth && index + 1 <= toMonth ? Number(value) : current);
  return { ...plan, investments };
}
