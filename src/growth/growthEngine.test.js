import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TUESTE_REFERRAL_CASE,
  calculateAverageCac,
  calculateGrowthPayback,
  calculateReferralFunnel,
  calculateReferralMarginalCac,
  calculateRewardCost,
  calculateViralCoefficient,
  compareAcquisitionChannels,
  evaluateIce,
  evaluateReferralConversion,
  projectCohortRetention,
} from './growthEngine.js';

test('embudo oficial conserva unidades y detecta la mayor pérdida relativa', () => {
  const result = calculateReferralFunnel(TUESTE_REFERRAL_CASE.funnel);
  assert.equal(result.status, 'ok');
  assert.equal(result.value.rates.emailOpenRate, 0.35);
  assert.equal(result.value.rates.referralPageVisitRate, 120 / 350);
  assert.equal(result.value.rates.invitationsPerInviter, 3);
  assert.equal(result.value.rates.referredBuyersPerEligibleCustomer, 0.06);
  assert.deepEqual(result.value.largestRateLoss, { step: 'referralPageVisit', rate: 1 - 120 / 350 });
});

test('CAC promedio y marginal usan costos y clientes nuevos válidos', () => {
  assert.deepEqual(calculateAverageCac({ acquisitionCosts: 5000, validNewCustomers: 100 }), { status: 'ok', value: 50 });
  assert.deepEqual(calculateReferralMarginalCac({ fromSpend: 4000, toSpend: 5000, fromCustomers: 80, toCustomers: 100 }), { status: 'ok', value: 50 });
});

test('coeficiente viral, retención y payback se calculan por horizonte explícito', () => {
  const viral = calculateViralCoefficient({ inviterShare: 0.2, invitationsPerInviter: 3, friendPurchaseRate: 0.4 });
  assert.equal(viral.status, 'ok');
  assert.ok(Math.abs(viral.value - 0.24) < 1e-12);
  const retention = projectCohortRetention({ initialCustomers: 100, monthlyChurn: 0.09, months: 3 });
  assert.equal(retention.value[2].retainedCustomers, 100 * 0.91 ** 2);
  const payback = calculateGrowthPayback({ cac: 25, monthlyContributionMargins: [10, 10, 10] });
  assert.equal(payback.status, 'ok');
  assert.equal(payback.value.months, 2.5);
});

test('conversiones rechazan autoinvitación y duplicados', () => {
  assert.equal(evaluateReferralConversion({ inviterId: 'ana', friendId: 'ana', referralId: 'r1' }).reason, 'self_referral');
  assert.equal(evaluateReferralConversion({ inviterId: 'ana', friendId: 'luis', referralId: 'r1', existingConversions: [{ referralId: 'r1', friendId: 'luis' }] }).reason, 'duplicate_conversion');
  assert.equal(evaluateReferralConversion({ inviterId: 'ana', friendId: 'luis', referralId: 'r2' }).status, 'eligible');
});

test('costos de recompensa distinguen devengado, pendiente e incurrido y respetan tope', () => {
  const result = calculateRewardCost({ rewards: [{ status: 'earned', cost: 5 }, { status: 'pending', cost: 1.6 }, { status: 'incurred', cost: 2 }], validReferrals: 1, capPerValidReferral: 25 });
  assert.equal(result.status, 'ok');
  assert.equal(result.value.attributableCost, 8.6);
  assert.equal(result.value.withinCap, true);
});

test('comparación de canales e ICE no convierten supuestos en resultados observados', () => {
  const channels = compareAcquisitionChannels({ channels: [{ name: 'Referidos simulados', acquisitionCosts: 13.6, validNewCustomers: 1 }, { name: 'Meta caso', acquisitionCosts: 50, validNewCustomers: 1 }] });
  assert.equal(channels.status, 'ok');
  assert.equal(channels.value[0].name, 'Referidos simulados');
  assert.deepEqual(evaluateIce({ impact: 8, confidence: 7, ease: 6 }), { status: 'ok', value: 7 });
});
