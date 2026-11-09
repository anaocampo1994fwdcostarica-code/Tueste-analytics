import { calculateMarginalCac, calculatePayback } from '../calculations/financialEngine.js';

export const GROWTH_SOURCES = Object.freeze({
  OFFICIAL_CASE: 'OFFICIAL_CASE',
  PROPOSED_ASSUMPTION: 'PROPOSED_ASSUMPTION',
  DEMO_LOCAL: 'DEMO_LOCAL',
});

export const TUESTE_REFERRAL_CASE = Object.freeze({
  source: GROWTH_SOURCES.OFFICIAL_CASE,
  period: 'Por cada 1.000 primeras compras elegibles',
  funnel: Object.freeze({ delivered: 1000, opened: 350, referralPageVisits: 120, inviters: 100, invitations: 300, friendVisits: 150, friendPurchases: 60 }),
  referralRewardCap: Object.freeze({ cacMeta: 50, capPerValidReferral: 25, currency: 'USD', status: 'derived_pending_part1_fee_verification' }),
  observedFacts: Object.freeze({ whatsappShare: 0.85, mobileTrafficShare: 0.82, deliveryDays: 3, spontaneousPostingShare: 0.06, oneTimeRepurchase90Days: 0.30, subscriptionMonthlyChurn: 0.09 }),
});

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const nonNegative = (value) => isFiniteNumber(value) && value >= 0;
const percent = (numerator, denominator) => denominator > 0 ? numerator / denominator : null;

export function calculateReferralFunnel(funnel = {}) {
  const required = ['delivered', 'opened', 'referralPageVisits', 'inviters', 'invitations', 'friendVisits', 'friendPurchases'];
  const missing = required.filter((key) => !nonNegative(funnel[key]));
  if (missing.length) return { status: 'invalid_data', errors: missing };
  if (funnel.delivered === 0 || funnel.opened === 0 || funnel.referralPageVisits === 0 || funnel.inviters === 0 || funnel.invitations === 0 || funnel.friendVisits === 0) {
    return { status: 'insufficient_data', errors: ['Las bases del embudo deben ser mayores que cero.'] };
  }
  const rates = {
    emailOpenRate: percent(funnel.opened, funnel.delivered),
    referralPageVisitRate: percent(funnel.referralPageVisits, funnel.opened),
    inviterActivationRate: percent(funnel.inviters, funnel.referralPageVisits),
    invitationsPerInviter: funnel.invitations / funnel.inviters,
    friendVisitRate: percent(funnel.friendVisits, funnel.invitations),
    friendPurchaseRate: percent(funnel.friendPurchases, funnel.friendVisits),
    referredBuyersPerEligibleCustomer: percent(funnel.friendPurchases, funnel.delivered),
  };
  const losses = {
    unopenedEmail: funnel.delivered - funnel.opened,
    openedWithoutReferralVisit: funnel.opened - funnel.referralPageVisits,
    friendVisitsWithoutPurchase: funnel.friendVisits - funnel.friendPurchases,
  };
  const largestRateLoss = Object.entries({
    emailOpen: 1 - rates.emailOpenRate,
    referralPageVisit: 1 - rates.referralPageVisitRate,
    friendPurchase: 1 - rates.friendPurchaseRate,
  }).sort((a, b) => b[1] - a[1])[0];
  return { status: 'ok', value: { funnel: { ...funnel }, rates, losses, largestRateLoss: { step: largestRateLoss[0], rate: largestRateLoss[1] } } };
}

export function calculateAverageCac({ acquisitionCosts, validNewCustomers } = {}) {
  if (!nonNegative(acquisitionCosts) || !isFiniteNumber(validNewCustomers) || validNewCustomers <= 0) {
    return { status: 'invalid_data', errors: ['acquisitionCosts debe ser no negativo y validNewCustomers mayor que cero.'] };
  }
  return { status: 'ok', value: acquisitionCosts / validNewCustomers };
}

export function calculateReferralMarginalCac(input) {
  return calculateMarginalCac(input);
}

export function calculateViralCoefficient({ inviterShare, invitationsPerInviter, friendPurchaseRate } = {}) {
  const values = { inviterShare, invitationsPerInviter, friendPurchaseRate };
  const invalid = Object.entries(values).filter(([, value]) => !nonNegative(value)).map(([key]) => key);
  if (invalid.length || inviterShare > 1 || friendPurchaseRate > 1) return { status: 'invalid_data', errors: invalid.length ? invalid : ['Las tasas deben estar entre 0 y 1.'] };
  return { status: 'ok', value: inviterShare * invitationsPerInviter * friendPurchaseRate };
}

export function evaluateReferralConversion({ inviterId, friendId, referralId, existingConversions = [], eligible = true } = {}) {
  if (!inviterId || !friendId || !referralId) return { status: 'invalid_data', reason: 'missing_identifier' };
  if (inviterId === friendId) return { status: 'rejected', reason: 'self_referral' };
  if (!eligible) return { status: 'rejected', reason: 'not_eligible' };
  if (existingConversions.some((conversion) => conversion.referralId === referralId || conversion.friendId === friendId)) return { status: 'rejected', reason: 'duplicate_conversion' };
  return { status: 'eligible', value: { inviterId, friendId, referralId } };
}

export function calculateRewardCost({ rewards = [], validReferrals = 0, capPerValidReferral } = {}) {
  if (!Array.isArray(rewards) || !Number.isInteger(validReferrals) || validReferrals < 0 || !nonNegative(capPerValidReferral)) {
    return { status: 'invalid_data', errors: ['Recompensas, referidos válidos y tope no son válidos.'] };
  }
  const invalidReward = rewards.find((reward) => !nonNegative(reward.cost) || !['earned', 'pending', 'incurred'].includes(reward.status));
  if (invalidReward) return { status: 'invalid_data', errors: ['Cada recompensa requiere costo no negativo y estado válido.'] };
  const totals = rewards.reduce((accumulator, reward) => {
    accumulator[reward.status] += reward.cost;
    return accumulator;
  }, { earned: 0, pending: 0, incurred: 0 });
  const attributableCost = totals.earned + totals.pending + totals.incurred;
  const costPerValidReferral = validReferrals ? attributableCost / validReferrals : null;
  return {
    status: 'ok',
    value: { totals, attributableCost, costPerValidReferral, capPerValidReferral, withinCap: costPerValidReferral === null ? null : costPerValidReferral <= capPerValidReferral },
  };
}

export function projectCohortRetention({ initialCustomers, monthlyChurn, months } = {}) {
  if (!nonNegative(initialCustomers) || !nonNegative(monthlyChurn) || monthlyChurn > 1 || !Number.isInteger(months) || months < 1) {
    return { status: 'invalid_data', errors: ['initialCustomers, monthlyChurn o months no son válidos.'] };
  }
  const rows = Array.from({ length: months }, (_, index) => ({ month: index + 1, retainedCustomers: initialCustomers * ((1 - monthlyChurn) ** index), retentionRate: (1 - monthlyChurn) ** index }));
  return { status: 'ok', value: rows };
}

export function compareAcquisitionChannels({ channels = [] } = {}) {
  if (!Array.isArray(channels) || !channels.length) return { status: 'insufficient_data', errors: ['channels'] };
  const normalized = channels.map((channel) => ({ ...channel, cac: calculateAverageCac({ acquisitionCosts: channel.acquisitionCosts, validNewCustomers: channel.validNewCustomers }) }));
  if (normalized.some((channel) => channel.cac.status !== 'ok')) return { status: 'invalid_data', errors: ['Cada canal necesita costo y clientes nuevos válidos.'] };
  return { status: 'ok', value: normalized.sort((a, b) => a.cac.value - b.cac.value) };
}

export function calculateGrowthPayback(input = {}) {
  return calculatePayback(input);
}

export function evaluateIce({ impact, confidence, ease } = {}) {
  const values = { impact, confidence, ease };
  if (Object.values(values).some((value) => !isFiniteNumber(value) || value < 1 || value > 10)) return { status: 'invalid_data', errors: ['impact, confidence y ease deben estar entre 1 y 10.'] };
  return { status: 'ok', value: (impact + confidence + ease) / 3 };
}
