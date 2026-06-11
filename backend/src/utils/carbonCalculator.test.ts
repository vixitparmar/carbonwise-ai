import test from 'node:test';
import assert from 'node:assert';
import { calculateCarbon } from './carbonCalculator';

function assertClose(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `Expected ${actual} to be close to ${expected}`);
}

test('calculateCarbon - zero or negative value', () => {
  assert.strictEqual(calculateCarbon({ type: 'travel', value: 0 }), 0);
  assert.strictEqual(calculateCarbon({ type: 'travel', value: -10 }), 0);
});

test('calculateCarbon - travel types', () => {
  assertClose(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'gasoline_car' } }), 2.0);
  assertClose(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'diesel_car' } }), 1.7);
  assertClose(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'hybrid_car' } }), 1.0);
  assertClose(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'electric_car' } }), 0.5);
  assertClose(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'motorcycle' } }), 1.1);
  assertClose(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'unknown' } }), 2.0);
});

test('calculateCarbon - public transport types', () => {
  assertClose(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'bus' } }), 0.8);
  assertClose(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'train' } }), 0.4);
  assertClose(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'metro' } }), 0.4);
  assertClose(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'unknown' } }), 0.6);
});

test('calculateCarbon - flight distance types', () => {
  assertClose(calculateCarbon({ type: 'flight', value: 1000, details: { distance: 'short' } }), 250);
  assertClose(calculateCarbon({ type: 'flight', value: 2000, details: { distance: 'long' } }), 300);
});

test('calculateCarbon - electricity source types', () => {
  assertClose(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'grid' } }), 45);
  assertClose(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'solar' } }), 2);
  assertClose(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'wind' } }), 2);
  assertClose(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'nuclear' } }), 2);
});

test('calculateCarbon - water usage', () => {
  assertClose(calculateCarbon({ type: 'water', value: 1000 }), 0.3);
});

test('calculateCarbon - food types', () => {
  assertClose(calculateCarbon({ type: 'food', value: 2, details: { diet: 'vegan' } }), 1.0);
  assertClose(calculateCarbon({ type: 'food', value: 2, details: { diet: 'vegetarian' } }), 1.6);
  assertClose(calculateCarbon({ type: 'food', value: 2, details: { diet: 'poultry' } }), 3.0);
  assertClose(calculateCarbon({ type: 'food', value: 2, details: { diet: 'red_meat' } }), 6.4);
  assertClose(calculateCarbon({ type: 'food', value: 2, details: { diet: 'unknown' } }), 2.4);
});

test('calculateCarbon - shopping category types', () => {
  assertClose(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'clothing' } }), 24.0);
  assertClose(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'electronics' } }), 180.0);
  assertClose(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'appliances' } }), 360.0);
  assertClose(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'furniture' } }), 90.0);
  assertClose(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'unknown' } }), 4.0);
});

test('calculateCarbon - waste types', () => {
  assertClose(calculateCarbon({ type: 'waste', value: 10, details: { recycled: true } }), 0.8);
  assertClose(calculateCarbon({ type: 'waste', value: 10, details: { recycled: 'true' } }), 0.8);
  assertClose(calculateCarbon({ type: 'waste', value: 10, details: { recycled: false } }), 12.5);
});

test('calculateCarbon - walking and cycling', () => {
  assertClose(calculateCarbon({ type: 'walking', value: 10 }), 0);
  assertClose(calculateCarbon({ type: 'cycling', value: 10 }), 0);
});

test('calculateCarbon - unknown type', () => {
  assertClose(calculateCarbon({ type: 'unknown_type', value: 10 }), 0);
});
