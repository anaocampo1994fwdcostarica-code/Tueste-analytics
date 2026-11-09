import test from 'node:test';
import assert from 'node:assert/strict';
import { clearActiveDemoProfile, completeGuestReferralPurchase, createDemoProfile, getRewardStorageKey, loadDemoProfiles, loadGuestReferralState, loadProfileRewardsState, MAR_PROFILE_ID, setActiveDemoProfile, getActiveDemoProfile, ACTIVE_DEMO_PROFILE_STORAGE_KEY } from './demoProfiles.js';

function memoryStorage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: (key) => data.delete(key) };
}

test('los perfiles DEMO conservan identidades y estados independientes', () => {
  const storage = memoryStorage();
  const profiles = loadDemoProfiles(storage);
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].id, MAR_PROFILE_ID);

  const created = createDemoProfile(storage, { name: 'Ana Solís', email: 'ana@demo.tueste.local' });
  assert.equal(created.status, 'ok');
  assert.notEqual(created.profile.id, MAR_PROFILE_ID);
  assert.match(created.profile.code, /^ANA-SOLIS-/);

  const anaState = loadProfileRewardsState(storage, created.profile);
  assert.equal(anaState.inviter.name, 'Ana Solís');
  assert.notEqual(getRewardStorageKey(created.profile.id), getRewardStorageKey(MAR_PROFILE_ID));

  setActiveDemoProfile(storage, created.profile.id);
  assert.equal(getActiveDemoProfile(storage).id, created.profile.id);
});

test('el registro DEMO rechaza correo duplicado e incompleto', () => {
  const storage = memoryStorage();
  createDemoProfile(storage, { name: 'Ana', email: 'ana@demo.tueste.local' });
  assert.equal(createDemoProfile(storage, { name: 'Otra Ana', email: 'ana@demo.tueste.local' }).reason, 'duplicate_email');
  assert.equal(createDemoProfile(storage, { name: '', email: 'ana@demo.tueste.local' }).reason, 'missing_name');
  assert.equal(createDemoProfile(storage, { name: 'Ana', email: 'invalido' }).reason, 'invalid_email');
});

test('cerrar sesión limpia el perfil activo sin borrar perfiles ni Rewards', () => {
  const storage = memoryStorage();
  const created = createDemoProfile(storage, { name: 'Ana', email: 'ana@demo.tueste.local' });
  setActiveDemoProfile(storage, created.profile.id);
  const profilesBefore = loadDemoProfiles(storage);
  clearActiveDemoProfile(storage);
  assert.equal(storage.getItem(ACTIVE_DEMO_PROFILE_STORAGE_KEY), null);
  assert.deepEqual(loadDemoProfiles(storage), profilesBefore);
  assert.equal(loadProfileRewardsState(storage, created.profile).inviter.id, created.profile.id);
});

test('compra DEMO del invitado actualiza solo al invitador correcto y es idempotente', () => {
  const local = memoryStorage();
  const session = memoryStorage();
  const ana = createDemoProfile(local, { name: 'Ana', email: 'ana@demo.tueste.local' }).profile;
  const first = completeGuestReferralPurchase(local, session, ana.code, { at: '2026-11-09T10:00:00Z' });
  assert.equal(first.status, 'ok');
  assert.equal(first.profile.id, ana.id);
  assert.equal(loadProfileRewardsState(local, ana).referrals[0].friendId, first.friendId);
  assert.equal(loadGuestReferralState(session).status, 'purchased');
  assert.equal(completeGuestReferralPurchase(local, session, ana.code).reason, 'duplicate_guest_purchase');
});

test('invitado de otro navegador conserva beneficio local pero no inventa sincronización', () => {
  const local = memoryStorage();
  const session = memoryStorage();
  const result = completeGuestReferralPurchase(local, session, 'ANA-DEMO');
  assert.equal(result.reason, 'inviter_unavailable');
  assert.equal(loadGuestReferralState(session).status, 'viewed');
});
