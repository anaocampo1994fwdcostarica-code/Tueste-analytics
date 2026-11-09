import test from 'node:test';
import assert from 'node:assert/strict';
import { getReferralCode, normalizeHashRoute } from './routing.js';

test('landing is the default route and legacy hashes remain compatible', () => {
  assert.equal(normalizeHashRoute(''), 'inicio');
  assert.equal(normalizeHashRoute('#tueste-rewards'), 'tueste-rewards');
  assert.equal(normalizeHashRoute('#panel-growth'), 'panel-growth');
});

test('referral links preserve and decode their invitation code', () => {
  assert.equal(normalizeHashRoute('#tueste-rewards?ref=MAR-CAFE-24'), 'tueste-rewards');
  assert.equal(getReferralCode('#tueste-rewards?ref=MAR-CAFE-24'), 'MAR-CAFE-24');
});
