import { TUESTE_REFERRAL_CASE, calculateAverageCac, calculateGrowthPayback, calculateReferralFunnel, calculateViralCoefficient, evaluateIce, projectCohortRetention } from './growthEngine.js';
import { getRewardsSummary } from './rewardsDemo.js';
export { DEFAULT_GROWTH_PLAN as GROWTH_PLAN } from './growthPlan.js';

export const DEFAULT_GROWTH_SCENARIO = Object.freeze({ metaSpend: 4000, agencyFee: 1000, metaCustomers: 100, expectedContribution: 15.89, monthlyContribution: 12.64, churn: 0.09, horizon: 12 });

export const DEMO_EXPERIMENTS = Object.freeze([{ id: 'post-delivery-referral', hypothesis: 'Si invitamos tras la entrega, la visita al programa aumenta sin elevar el costo por referido.', variantA: 'Correo un día después del pago', variantB: 'Invitación después de entrega DEMO', primaryMetric: 'Visitas al programa', counterMetric: 'Costo por referido', sampleSize: 0, result: 'Sin resultados observados', status: 'propuesto', conclusion: 'Pendiente de muestra y evaluación estadística.' }]);
export const DEMO_IDEAS = Object.freeze([{ id: 'referral', name: 'Invitación post-entrega', impact: 8, confidence: 5, ease: 7 }, { id: 'conversion', name: 'Beneficio aplicado para amigo', impact: 7, confidence: 4, ease: 8 }, { id: 'retention', name: 'Pausa de suscripción', impact: 6, confidence: 4, ease: 5 }]);
export const CHANNEL_MATRIX = Object.freeze([{ name: 'Referidos DEMO', category: 'Probar', reason: 'Costo y conversión deben validarse antes de escalar.' }, { name: 'Meta Ads', category: 'Siempre activo', reason: 'Canal existente, pero con dependencia externa y CAC a vigilar.' }, { name: 'Contenido orgánico', category: 'Largo plazo', reason: 'Canal complementario sin resultado atribuido todavía.' }, { name: 'Duplicar inversión Meta', category: 'Descartar por ahora', reason: 'El CAC marginal debe verificarse antes de ampliar gasto.' }]);

export function buildGrowthDashboard(rewardsState, scenario = DEFAULT_GROWTH_SCENARIO) {
  const rewards = getRewardsSummary(rewardsState);
  const funnel = calculateReferralFunnel(TUESTE_REFERRAL_CASE.funnel).value;
  const metaCac = calculateAverageCac({ acquisitionCosts: scenario.metaSpend + scenario.agencyFee, validNewCustomers: scenario.metaCustomers }).value;
  const referralCac = rewards.costs?.costPerValidReferral ?? null;
  const viral = calculateViralCoefficient({ inviterShare: funnel.rates.inviterActivationRate, invitationsPerInviter: funnel.rates.invitationsPerInviter, friendPurchaseRate: funnel.rates.friendPurchaseRate }).value;
  const retention = projectCohortRetention({ initialCustomers: 100, monthlyChurn: scenario.churn, months: scenario.horizon }).value;
  const payback = calculateGrowthPayback({ cac: referralCac ?? metaCac, monthlyContributionMargins: Array.from({ length: scenario.horizon }, () => scenario.monthlyContribution) });
  return { rewards, funnel, metaCac, marginalMetaCac: null, referralCac, viral, retention, expectedContribution: scenario.expectedContribution, ltvCac: referralCac ? (scenario.expectedContribution * 3) / referralCac : null, payback, scenario };
}

export function rankGrowthIdeas(ideas = DEMO_IDEAS) { return ideas.map((idea) => ({ ...idea, ice: evaluateIce(idea).value })).sort((a, b) => b.ice - a.ice); }
