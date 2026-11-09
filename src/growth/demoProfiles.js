import { createDemoReferral, createInitialRewardsState, hydrateRewardsState, loadRewardsState, registerDemoReferral, REWARDS_STORAGE_KEY, saveRewardsState, simulateEligiblePurchase } from './rewardsDemo.js';

export const DEMO_PROFILES_STORAGE_KEY = 'tueste-demo-profiles-v1';
export const ACTIVE_DEMO_PROFILE_STORAGE_KEY = 'tueste-active-demo-profile';
export const GUEST_REFERRAL_STORAGE_KEY = 'tueste-guest-referral-v1';

export const MAR_PROFILE_ID = 'cliente-demo-mar';

const normalize = (value) => String(value ?? '').trim();

export function createProfileCode(name, id) {
  const prefix = normalize(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 12) || 'CLIENTE';
  const suffix = String(id).replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase() || 'DEMO';
  return `${prefix}-${suffix}`;
}

export function getRewardStorageKey(profileId) {
  return profileId === MAR_PROFILE_ID ? REWARDS_STORAGE_KEY : `${REWARDS_STORAGE_KEY}:${profileId}`;
}

export function loadDemoProfiles(storage) {
  try {
    const raw = storage?.getItem(DEMO_PROFILES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.every((item) => item.id && item.name && item.code)) return parsed;
  } catch {
    // A corrupt profile list is repaired from the DEMO profiles below.
  }

  const legacyState = storage ? loadRewardsState(storage) : createInitialRewardsState();
  const mar = { id: MAR_PROFILE_ID, name: legacyState.inviter?.name || 'Mar', email: 'mar@demo.tueste.local', code: legacyState.inviter?.code || 'MAR-CAFE-24', createdAt: '2026-11-01T10:00:00.000Z' };
  saveDemoProfiles(storage, [mar]);
  return [mar];
}

export function saveDemoProfiles(storage, profiles) {
  storage?.setItem(DEMO_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  return profiles;
}

export function createDemoProfile(storage, { name, email }) {
  const profiles = loadDemoProfiles(storage);
  const cleanName = normalize(name);
  const cleanEmail = normalize(email).toLowerCase();
  if (!cleanName) return { status: 'rejected', reason: 'missing_name' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { status: 'rejected', reason: 'invalid_email' };
  if (profiles.some((profile) => profile.email.toLowerCase() === cleanEmail)) return { status: 'rejected', reason: 'duplicate_email' };
  const id = `cliente-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const profile = { id, name: cleanName, email: cleanEmail, code: createProfileCode(cleanName, id), createdAt: new Date().toISOString() };
  const nextProfiles = [...profiles, profile];
  saveDemoProfiles(storage, nextProfiles);
  saveRewardsState(storage, createInitialRewardsState({
    id: profile.id,
    name: profile.name,
    code: profile.code,
  }), getRewardStorageKey(profile.id));
  return { status: 'ok', profile };
}

export function setActiveDemoProfile(storage, profileId) {
  storage?.setItem(ACTIVE_DEMO_PROFILE_STORAGE_KEY, profileId);
}

export function clearActiveDemoProfile(storage) {
  storage?.removeItem?.(ACTIVE_DEMO_PROFILE_STORAGE_KEY);
}

export function getActiveDemoProfile(storage) {
  const profiles = loadDemoProfiles(storage);
  const activeId = storage?.getItem(ACTIVE_DEMO_PROFILE_STORAGE_KEY);
  return profiles.find((profile) => profile.id === activeId) ?? null;
}

export function findDemoProfileByCode(storage, code) {
  const normalized = normalize(code);
  return loadDemoProfiles(storage).find((profile) => profile.code === normalized) ?? null;
}

export function loadGuestReferralState(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(GUEST_REFERRAL_STORAGE_KEY) ?? 'null');
    if (parsed?.version === 1 && parsed.code && parsed.friendId && ['viewed', 'purchased'].includes(parsed.status)) return parsed;
  } catch {
    // Corrupt guest state is treated as a fresh invitation session.
  }
  return null;
}

export function saveGuestReferralState(storage, state) {
  storage?.setItem(GUEST_REFERRAL_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function loadProfileRewardsState(storage, profile) {
  const storageKey = getRewardStorageKey(profile.id);
  const raw = storage?.getItem(storageKey);
  let state = raw ? hydrateRewardsState(raw) : createInitialRewardsState({ id: profile.id, name: profile.name, code: profile.code });
  if (profile.id !== MAR_PROFILE_ID && state.inviter.id !== profile.id) {
    state = createInitialRewardsState({ id: profile.id, name: profile.name, code: profile.code });
    saveRewardsState(storage, state, storageKey);
  } else if (!raw) {
    saveRewardsState(storage, state, storageKey);
  }
  return state;
}

export function completeGuestReferralPurchase(localStorage, sessionStorage, code, { at = new Date().toISOString() } = {}) {
  const profile = findDemoProfileByCode(localStorage, code);
  const existing = loadGuestReferralState(sessionStorage);
  if (existing?.code === code && existing.status === 'purchased') return { status: 'rejected', reason: 'duplicate_guest_purchase' };
  if (!profile) {
    saveGuestReferralState(sessionStorage, { version: 1, code: normalize(code), friendId: existing?.friendId ?? `invitado-${normalize(code).toLowerCase()}`, status: 'viewed' });
    return { status: 'rejected', reason: 'inviter_unavailable' };
  }
  let state = loadProfileRewardsState(localStorage, profile);
  const friendId = existing?.friendId ?? `invitado-${normalize(code).toLowerCase()}`;
  const invited = createDemoReferral(state, { friendId, at });
  if (invited.status !== 'ok') return invited;
  const referralId = invited.value.referrals.at(-1).id;
  const registered = registerDemoReferral(invited.value, referralId, at);
  if (registered.status !== 'ok') return registered;
  const purchased = simulateEligiblePurchase(registered.value, referralId, { at, eventId: `guest-purchase-${friendId}` });
  if (purchased.status !== 'ok') return purchased;
  saveRewardsState(localStorage, purchased.value, getRewardStorageKey(profile.id));
  saveGuestReferralState(sessionStorage, { version: 1, code: profile.code, friendId, status: 'purchased', purchasedAt: at });
  return { status: 'ok', profile, state: purchased.value, friendId };
}

export function loadAllProfileRewardsStates(storage) {
  const profiles = loadDemoProfiles(storage);
  const states = profiles.map((profile) => loadProfileRewardsState(storage, profile));
  return {
    ...states[0],
    inviter: states[0]?.inviter ?? { id: MAR_PROFILE_ID, name: 'Tueste', code: 'TUESTE-DEMO' },
    referrals: states.flatMap((state) => state.referrals),
    rewards: states.flatMap((state) => state.rewards),
    events: states.flatMap((state) => state.events),
    sequence: Math.max(1, ...states.map((state) => state.sequence)),
  };
}
