import { describe, it, expect } from 'vitest';

describe('minimal test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});

// Also try without describe
it('standalone test', () => {
  expect(true).toBe(true);
});
