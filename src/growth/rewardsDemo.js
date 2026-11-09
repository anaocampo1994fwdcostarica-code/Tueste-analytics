import { GROWTH_SOURCES, TUESTE_REFERRAL_CASE, calculateRewardCost, evaluateReferralConversion } from './growthEngine.js';

export const REWARDS_STORAGE_KEY = 'tueste-rewards-demo-v1';
export const REWARDS_SCHEMA_VERSION = 1;
export const DEMO_INVITER = Object.freeze({ id: 'cliente-demo-mar', name: 'Mar', code: 'MAR-CAFE-24' });

export const REWARD_CONFIG = Object.freeze({
  source: GROWTH_SOURCES.PROPOSED_ASSUMPTION,
  friendBenefit: Object.freeze({ id: 'friend-welcome', label: 'USD 5 de bienvenida para tu amigo', cost: 5 }),
  levels: Object.freeze([
    Object.freeze({ id: 'level-one-sample', threshold: 1, label: 'Muestra de 100 g en tu próximo pedido', cost: 1.6, fulfillment: 'pending' }),
    Object.freeze({ id: 'level-three-bonus', threshold: 3, label: 'Bono de USD 6 por tres amigos válidos', cost: 6, fulfillment: 'earned' }),
  ]),
});

const initialEvents = Object.freeze([{ id: 'event-delivery-demo', type: 'delivery_confirmed', at: '2026-11-01T10:00:00.000Z', message: 'Entrega DEMO confirmada: el programa se habilitó después de recibir el café.' }]);
const clone = (value) => JSON.parse(JSON.stringify(value));
const event = (id, type, message, at) => ({ id, type, message, at });

export function createInitialRewardsState(inviter = DEMO_INVITER) {
  return { version: REWARDS_SCHEMA_VERSION, inviter: { ...inviter }, referrals: [], rewards: [], events: clone(initialEvents), sequence: 1 };
}

export function createReferralLink(code, origin = 'https://tueste.demo') {
  return `${origin.replace(/\/$/, '')}/#tueste-rewards?ref=${encodeURIComponent(code)}`;
}

export function createWhatsAppShareLink({ referralLink, inviterName = DEMO_INVITER.name } = {}) {
  const message = `${inviterName} te invita a descubrir Tueste. Tu beneficio DEMO ya está aplicado: USD 5 de bienvenida en tu primera compra simulada. ${referralLink}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function createDemoReferral(state, { friendId, at = new Date().toISOString() } = {}) {
  const normalized = String(friendId ?? '').trim();
  const referralId = `ref-${state.sequence}`;
  const check = evaluateReferralConversion({ inviterId: state.inviter.id, friendId: normalized, referralId, existingConversions: state.referrals.filter((item) => item.purchaseEventId) });
  if (!normalized) return { status: 'rejected', reason: 'missing_friend' };
  if (normalized === state.inviter.id || state.referrals.some((item) => item.friendId === normalized)) return { status: 'rejected', reason: normalized === state.inviter.id ? 'self_referral' : 'duplicate_referral' };
  if (check.status === 'invalid_data' || check.reason === 'self_referral') return check;
  const referral = { id: referralId, code: `${state.inviter.code}-${String(state.sequence).padStart(2, '0')}`, friendId: normalized, invitedAt: at, registeredAt: null, purchaseEventId: null, purchasedAt: null };
  return { status: 'ok', value: { ...state, referrals: [...state.referrals, referral], events: [...state.events, event(`event-invite-${referralId}`, 'invitation_created', `Invitación DEMO creada para ${normalized}.`, at)], sequence: state.sequence + 1 } };
}

export function registerDemoReferral(state, referralId, at = new Date().toISOString()) {
  const referral = state.referrals.find((item) => item.id === referralId);
  if (!referral) return { status: 'rejected', reason: 'unknown_referral' };
  if (referral.registeredAt) return { status: 'rejected', reason: 'duplicate_registration' };
  return { status: 'ok', value: { ...state, referrals: state.referrals.map((item) => item.id === referralId ? { ...item, registeredAt: at } : item), events: [...state.events, event(`event-register-${referralId}`, 'referral_registered', `${referral.friendId} se registró en el DEMO.`, at)] } };
}

export function simulateEligiblePurchase(state, referralId, { eventId = `purchase-${referralId}`, at = new Date().toISOString() } = {}) {
  const referral = state.referrals.find((item) => item.id === referralId);
  if (!referral) return { status: 'rejected', reason: 'unknown_referral' };
  const conversion = evaluateReferralConversion({ inviterId: state.inviter.id, friendId: referral.friendId, referralId, existingConversions: state.referrals.filter((item) => item.purchaseEventId), eligible: Boolean(referral.registeredAt) });
  if (conversion.status !== 'eligible') return conversion;
  if (state.events.some((item) => item.id === eventId)) return { status: 'rejected', reason: 'duplicate_purchase_event' };
  const validBefore = state.referrals.filter((item) => item.purchaseEventId).length;
  const rewards = [...state.rewards, { id: `reward-friend-${referralId}`, levelId: REWARD_CONFIG.friendBenefit.id, status: 'incurred', cost: REWARD_CONFIG.friendBenefit.cost, referralId, at }];
  const events = [...state.events, event(eventId, 'eligible_purchase', `Compra DEMO válida de ${referral.friendId}; no se procesó ningún pago real.`, at)];
  const validAfter = validBefore + 1;
  REWARD_CONFIG.levels.filter((level) => validBefore < level.threshold && validAfter >= level.threshold).forEach((level) => {
    rewards.push({ id: `reward-${level.id}-${referralId}`, levelId: level.id, status: level.fulfillment, cost: level.cost, referralId, at });
    events.push(event(`event-${level.id}-${referralId}`, `reward_${level.fulfillment}`, `Recompensa DEMO: ${level.label}.`, at));
  });
  return { status: 'ok', value: { ...state, referrals: state.referrals.map((item) => item.id === referralId ? { ...item, purchaseEventId: eventId, purchasedAt: at } : item), rewards, events } };
}

export function getRewardsSummary(state) {
  const validReferrals = state.referrals.filter((item) => item.purchaseEventId).length;
  const costs = calculateRewardCost({ rewards: state.rewards, validReferrals, capPerValidReferral: TUESTE_REFERRAL_CASE.referralRewardCap.capPerValidReferral });
  const nextLevel = REWARD_CONFIG.levels.find((level) => level.threshold > validReferrals) ?? null;
  return { invited: state.referrals.length, registered: state.referrals.filter((item) => item.registeredAt).length, validReferrals, rewards: state.rewards.length, nextLevel, costs: costs.status === 'ok' ? costs.value : null };
}

export function hydrateRewardsState(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || parsed.version !== REWARDS_SCHEMA_VERSION || !Array.isArray(parsed.referrals) || !Array.isArray(parsed.rewards) || !Array.isArray(parsed.events) || !parsed.inviter?.id || !Number.isInteger(parsed.sequence)) return createInitialRewardsState();
    return parsed;
  } catch { return createInitialRewardsState(); }
}

export function loadRewardsState(storage, storageKey = REWARDS_STORAGE_KEY) { return hydrateRewardsState(storage?.getItem(storageKey)); }
export function saveRewardsState(storage, state, storageKey = REWARDS_STORAGE_KEY) { storage?.setItem(storageKey, JSON.stringify(state)); return state; }
export function resetRewardsState(storage, storageKey = REWARDS_STORAGE_KEY) { const state = createInitialRewardsState(); saveRewardsState(storage, state, storageKey); return state; }
