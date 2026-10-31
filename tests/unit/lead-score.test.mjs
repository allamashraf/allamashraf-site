// Lead Field draft scorer: Allam's prototype rules and keyword lists (22 Oct 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelFor, nextRep, scoreLead } from '../../src/lib/lead-score.ts';

const ids = (r) => r.fired.map((f) => f.id).sort();

test('every rule fires with its exact points, and the total clamps to 100', () => {
  // 25 + 20 + 30 + 10 + 20 = 105 -> 100
  const r = scoreLead('Price? Site visit ASAP', true, true);
  assert.deepEqual(ids(r), ['budget', 'phone', 'price', 'urgency', 'visit']);
  assert.equal(r.score, 100);
  assert.equal(r.label, 'Hot');
  assert.equal(r.followUpDays, 1);
});

test('empty or under 5 characters is -15, clamped at 0', () => {
  for (const msg of ['', '   ', 'hi', 'سعر']) {
    const r = scoreLead(msg, false, false);
    assert.ok(ids(r).includes('short'), JSON.stringify(msg));
    assert.equal(r.score, Math.max(0, r.fired.reduce((s, f) => s + f.points, 0)));
  }
  assert.equal(scoreLead('hi', false, false).score, 0);
  // 4 characters but a keyword: price +20 -15 = 5
  assert.equal(scoreLead('cash', false, false).score, 5);
});

test('thresholds: 60+ Hot, 30 to 59 Warm, under 30 Cold, with follow-up 1/2/3 days', () => {
  assert.equal(labelFor(60), 'Hot');
  assert.equal(labelFor(59), 'Warm');
  assert.equal(labelFor(30), 'Warm');
  assert.equal(labelFor(29), 'Cold');
  const warm = scoreLead('Can I book a viewing?', false, false); // 30
  assert.deepEqual([warm.score, warm.label, warm.followUpDays], [30, 'Warm', 2]);
  const cold = scoreLead('Hello, more info please', false, true); // 10
  assert.deepEqual([cold.score, cold.label, cold.followUpDays], [10, 'Cold', 3]);
});

test('Arabic keywords match as substrings', () => {
  const r = scoreLead('عايز أعمل معاينة النهارده وأعرف التقسيط', false, false);
  assert.deepEqual(ids(r), ['price', 'urgency', 'visit']);
  assert.equal(r.score, 70);
  assert.equal(r.label, 'Hot');
});

test('matching is case-insensitive substring, exactly like the prototype', () => {
  assert.deepEqual(ids(scoreLead('URGENT: PAYMENT', false, false)), ['price', 'urgency']);
  // Substring semantics: "cashier" contains "cash".
  assert.deepEqual(ids(scoreLead('ask the cashier', false, false)), ['price']);
});

test('round-robin cycles through three fictional reps', () => {
  assert.deepEqual([0, 1, 2, 3].map(nextRep), ['Rep A', 'Rep B', 'Rep C', 'Rep A']);
});
