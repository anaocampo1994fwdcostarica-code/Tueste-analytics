import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGrowthDashboard, rankGrowthIdeas } from './growthDashboardModel.js';
import { createInitialRewardsState, createDemoReferral, registerDemoReferral, simulateEligiblePurchase } from './rewardsDemo.js';
import { completeGuestReferralPurchase, createDemoProfile, loadAllProfileRewardsStates } from './demoProfiles.js';

test('panel lee el mismo estado Rewards y separa métricas DEMO de supuestos', () => { let state = createInitialRewardsState(); state = createDemoReferral(state, { friendId: 'cliente-1' }).value; state = registerDemoReferral(state, 'ref-1').value; state = simulateEligiblePurchase(state, 'ref-1').value; const dashboard = buildGrowthDashboard(state); assert.equal(dashboard.rewards.validReferrals, 1); assert.equal(dashboard.referralCac, 6.6); assert.equal(dashboard.metaCac, 50); assert.equal(dashboard.funnel.rates.referredBuyersPerEligibleCustomer, 0.06); });
test('cohortes, payback e ICE se derivan de parámetros explícitos', () => { const dashboard = buildGrowthDashboard(createInitialRewardsState(), { metaSpend: 4000, agencyFee: 1000, metaCustomers: 100, expectedContribution: 15.89, monthlyContribution: 12.64, churn: 0.1, horizon: 3 }); assert.equal(dashboard.retention[2].retainedCustomers, 81); assert.equal(dashboard.payback.status, 'not_recovered'); assert.equal(rankGrowthIdeas()[0].name, 'Invitación post-entrega'); });
test('recorrido invitado actualiza Rewards del perfil y se refleja una sola vez en Growth', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
  const profile = createDemoProfile(storage, { name: 'Ana', email: 'ana@demo.tueste.local' }).profile;
  const session = { getItem: (key) => values.get(`session:${key}`) ?? null, setItem: (key, value) => values.set(`session:${key}`, String(value)) };
  assert.equal(completeGuestReferralPurchase(storage, session, profile.code, { at: '2026-11-09T12:00:00Z' }).status, 'ok');
  const dashboard = buildGrowthDashboard(loadAllProfileRewardsStates(storage));
  assert.equal(dashboard.rewards.validReferrals, 1);
  assert.equal(dashboard.referralCac, 6.6);
  assert.equal(completeGuestReferralPurchase(storage, session, profile.code).reason, 'duplicate_guest_purchase');
  assert.equal(buildGrowthDashboard(loadAllProfileRewardsStates(storage)).rewards.validReferrals, 1);
});
