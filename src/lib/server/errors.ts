import { error } from '@sveltejs/kit';

export class DomainError extends Error {
    constructor(public status: number, public key: string) {
        super(key);
    }
}

export class NotFoundError extends DomainError {
    constructor(key = 'api.generic.not_found') {
        super(404, key);
    }
}

export class UnauthorizedError extends DomainError {
    constructor(key = 'api.generic.unauthorised_user') {
        super(401, key);
    }
}

export class ValidationError extends DomainError {
    constructor(key: string) {
        super(400, key);
    }
}

export class ConflictError extends DomainError {
    constructor(key: string) {
        super(409, key);
    }
}

// Re-throws domain errors as SvelteKit http errors at the route boundary.
// Anything we don't recognise is rethrown untouched.
export function rethrowAsHttp(e: unknown): never {
    if (e instanceof DomainError) {
        console.error('Domain error:', e);
        throw error(e.status, e.key);
    }
    console.error('Unhandled error:', e);
    throw e;
}
