import { describe, it, expect } from 'vitest';
import { calculateCarbon } from './carbonCalculator';

describe('carbonCalculator', () => {
  it('should return 0 for zero or negative values', () => {
    expect(calculateCarbon({ type: 'travel', value: 0 })).toBe(0);
    expect(calculateCarbon({ type: 'travel', value: -5 })).toBe(0);
  });

  it('should calculate carbon footprint for travel modes correctly', () => {
    expect(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'gasoline_car' } })).toBeCloseTo(2.0);
    expect(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'diesel_car' } })).toBeCloseTo(1.7);
    expect(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'hybrid_car' } })).toBeCloseTo(1.0);
    expect(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'electric_car' } })).toBeCloseTo(0.5);
    expect(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'motorcycle' } })).toBeCloseTo(1.1);
    expect(calculateCarbon({ type: 'travel', value: 10, details: { mode: 'unknown' } })).toBeCloseTo(2.0);
  });

  it('should calculate public transport modes correctly', () => {
    expect(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'bus' } })).toBeCloseTo(0.8);
    expect(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'train' } })).toBeCloseTo(0.4);
    expect(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'metro' } })).toBeCloseTo(0.4);
    expect(calculateCarbon({ type: 'public_transport', value: 10, details: { mode: 'unknown' } })).toBeCloseTo(0.6);
  });

  it('should calculate flights correctly', () => {
    expect(calculateCarbon({ type: 'flight', value: 1000, details: { distance: 'short' } })).toBeCloseTo(250.0);
    expect(calculateCarbon({ type: 'flight', value: 1000, details: { distance: 'long' } })).toBeCloseTo(150.0);
  });

  it('should calculate electricity sources correctly', () => {
    expect(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'grid' } })).toBeCloseTo(45.0);
    expect(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'solar' } })).toBeCloseTo(2.0);
    expect(calculateCarbon({ type: 'electricity', value: 100, details: { source: 'wind' } })).toBeCloseTo(2.0);
  });

  it('should calculate water correctly', () => {
    expect(calculateCarbon({ type: 'water', value: 1000 })).toBeCloseTo(0.3);
  });

  it('should calculate food diets correctly', () => {
    expect(calculateCarbon({ type: 'food', value: 2, details: { diet: 'vegan' } })).toBeCloseTo(1.0);
    expect(calculateCarbon({ type: 'food', value: 2, details: { diet: 'vegetarian' } })).toBeCloseTo(1.6);
    expect(calculateCarbon({ type: 'food', value: 2, details: { diet: 'red_meat' } })).toBeCloseTo(6.4);
    expect(calculateCarbon({ type: 'food', value: 2, details: { diet: 'unknown' } })).toBeCloseTo(2.4);
  });

  it('should calculate shopping categories correctly', () => {
    expect(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'clothing' } })).toBeCloseTo(24.0);
    expect(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'electronics' } })).toBeCloseTo(180.0);
    expect(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'appliances' } })).toBeCloseTo(360.0);
    expect(calculateCarbon({ type: 'shopping', value: 2, details: { category: 'unknown' } })).toBeCloseTo(4.0);
  });

  it('should calculate waste recycled vs not recycled correctly', () => {
    expect(calculateCarbon({ type: 'waste', value: 10, details: { recycled: true } })).toBeCloseTo(0.8);
    expect(calculateCarbon({ type: 'waste', value: 10, details: { recycled: 'true' } })).toBeCloseTo(0.8);
    expect(calculateCarbon({ type: 'waste', value: 10, details: { recycled: false } })).toBeCloseTo(12.5);
  });

  it('should return 0 for cycling or walking', () => {
    expect(calculateCarbon({ type: 'cycling', value: 50 })).toBe(0);
    expect(calculateCarbon({ type: 'walking', value: 12 })).toBe(0);
  });

  it('should return 0 for unknown types', () => {
    expect(calculateCarbon({ type: 'invalid_type', value: 10 })).toBe(0);
  });
});
