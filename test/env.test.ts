import { JWT_SECRET } from '$env/static/private';
import { expect, test } from 'vitest';

test('should have JWT_SECRET defined', () => {
    expect(JWT_SECRET).toBeDefined();
    expect(typeof JWT_SECRET).toBe('string');
    expect(JWT_SECRET.length).toBeGreaterThan(0);
});
