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
  const result = simulateLevelThreePlan(createDefaultPlans()[0], state);
  const row = result.rows[0];
  const units = calculateLevelThreeUnitEconomics(state);
  return {
    metaCustomers: 165,
    organicCustomers: 47,
    totalNewCustomers: 212,
    oneTimeCustomers: 180.2,
    subscribers: 31.8,
    oneTimeContribution: units.standard,
    subscriptionContribution: units.subscription,
    cohortContribution: row.cohortContribution,
    existingContribution: 9000,
    investment: 8000,
    agencyFee: 1000,
    fixedCosts: 6500,
    openingCash: 35000,
    endingCash: row.endingCash,
    matchesEngine: Math.abs(row.endingCash - (35000 + 9000 + row.cohortContribution - 8000 - 1000 - 6500)) < 1e-8,
  };
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
