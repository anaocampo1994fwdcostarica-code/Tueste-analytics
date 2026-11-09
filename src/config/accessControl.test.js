import test from 'node:test';
import assert from 'node:assert/strict';
import { clearActiveDemoRole, DEMO_ROLE, DEMO_ROLE_STORAGE_KEY, canAccessRoute, getActiveDemoRole, setActiveDemoRole } from './accessControl.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

test('guest can visit landing and rewards but not Growth', () => {
  assert.equal(canAccessRoute('inicio', DEMO_ROLE.GUEST), true);
  assert.equal(canAccessRoute('tueste-rewards', DEMO_ROLE.GUEST), true);
  assert.equal(canAccessRoute('panel-growth', DEMO_ROLE.GUEST), false);
});

test('client can use Rewards but not administrative modules', () => {
  assert.equal(canAccessRoute('tueste-rewards', DEMO_ROLE.CLIENT), true);
  assert.equal(canAccessRoute('panel-growth', DEMO_ROLE.CLIENT), false);
  assert.equal(canAccessRoute('panel-principal', DEMO_ROLE.CLIENT), false);
});

test('admin can access Growth and financial modules', () => {
  assert.equal(canAccessRoute('panel-growth', DEMO_ROLE.ADMIN), true);
  assert.equal(canAccessRoute('panel-principal', DEMO_ROLE.ADMIN), true);
  assert.equal(canAccessRoute('nivel-3', DEMO_ROLE.ADMIN), true);
});

test('demo role persistence defaults to guest', () => {
  const storage = memoryStorage();
  assert.equal(getActiveDemoRole(storage), DEMO_ROLE.GUEST);
  setActiveDemoRole(DEMO_ROLE.ADMIN, storage);
  assert.equal(storage.getItem(DEMO_ROLE_STORAGE_KEY), DEMO_ROLE.ADMIN);
  assert.equal(getActiveDemoRole(storage), DEMO_ROLE.ADMIN);
});

test('cerrar sesión elimina solo el rol activo y vuelve a guest', () => {
  const storage = memoryStorage();
  setActiveDemoRole(DEMO_ROLE.ADMIN, storage);
  clearActiveDemoRole(storage);
  assert.equal(storage.getItem(DEMO_ROLE_STORAGE_KEY), null);
  assert.equal(getActiveDemoRole(storage), DEMO_ROLE.GUEST);
});
