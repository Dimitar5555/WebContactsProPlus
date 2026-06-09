import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import {
    ConflictError,
    UnauthorizedError,
    ValidationError
} from '../errors';

if(!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set');
}

// Pre-computed bcrypt hash used to keep login timing constant when the
// supplied username does not exist. Without this, attackers could
// enumerate valid usernames by observing the response-time difference
// between "no user found" (no bcrypt work) and "wrong password" (one
// bcrypt comparison).
const DUMMY_HASH = bcrypt.hashSync('this-is-a-dummy-password-for-constant-time', 10);

export type JwtPayload = {
    id: number;
    username: string;
};

// Access tokens are short-lived; the refresh-token cookie covers a long
// session. 15m matches the typical "short-lived JWT" recommendation.
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 3600;

function signAccessToken(userId: number, username: string): string {
    const payload: JwtPayload = { id: userId, username };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS });
}

async function mintRefreshToken(userId: number): Promise<{ token: string; maxAge: number }> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_MAX_AGE_SECONDS;
    await refreshTokenRepository.create({ token, userId, expiresAt });
    return { token, maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS };
}

function validateRegistration(email: string, username: string, password: string): boolean {
    if(!email || !username || !password) {
        return false;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return false;
    }
    if(password.length < 8) {
        return false;
    }
    if(username.length < 3 || username.length > 20) {
        return false;
    }
    if(/^[a-zA-Z0-9_]+$/.test(username) === false) {
        return false;
    }
    return true;
}

export const authService = {
    login: async (rawUsername: string | undefined, rawPassword: string | undefined): Promise<{ token: string; maxAge: number; userId: number }> => {
        const username = rawUsername?.toString().trim();
        const password = rawPassword?.toString() ?? '';

        if(!username || !password) {
            throw new ValidationError('api.login.missing_credentials');
        }

        const user = await userRepository.findByUsername(username);
        if(!user) {
            // Burn the same bcrypt cycles regardless of whether the user
            // exists. The return value is intentionally discarded.
            bcrypt.compareSync(password, DUMMY_HASH);
            throw new UnauthorizedError('api.login.invalid_credentials');
        }
        if(!bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedError('api.login.invalid_credentials');
        }

        const token = signAccessToken(user.id, user.username);
        return { token, maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS, userId: user.id };
    },

    issueRefreshToken: async (userId: number): Promise<{ token: string; maxAge: number }> => {
        return mintRefreshToken(userId);
    },

    consumeRefreshToken: async (
        token: string
    ): Promise<{ accessToken: string; accessMaxAge: number; refreshToken: string; refreshMaxAge: number }> => {
        const existing = await refreshTokenRepository.findByToken(token);
        const nowSec = Math.floor(Date.now() / 1000);
        if(!existing || existing.expires_at < nowSec) {
            // Best-effort cleanup of an expired row.
            if(existing) {
                await refreshTokenRepository.delete(token);
            }
            throw new UnauthorizedError('api.refresh.invalid');
        }

        // Single-use rotation: drop the consumed token before issuing fresh ones.
        await refreshTokenRepository.delete(token);

        // The refresh row stores user_id; resolve username for the JWT payload.
        const userRow = await userRepository.findById(existing.user_id);
        if(!userRow) {
            throw new UnauthorizedError('api.refresh.invalid');
        }

        const accessToken = signAccessToken(userRow.id, userRow.username);
        const newRefresh = await mintRefreshToken(userRow.id);

        return {
            accessToken,
            accessMaxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
            refreshToken: newRefresh.token,
            refreshMaxAge: newRefresh.maxAge
        };
    },

    revokeRefreshToken: async (token: string): Promise<void> => {
        await refreshTokenRepository.delete(token);
    },

    revokeAllRefreshTokensForUser: async (userId: number): Promise<void> => {
        await refreshTokenRepository.deleteAllForUser(userId);
    },

    register: async (input: { email?: string; username?: string; password?: string }): Promise<void> => {
        const username = input.username?.toString().trim() ?? '';
        const email = input.email?.toString().trim() ?? '';
        const password = input.password?.toString() ?? '';

        if(!validateRegistration(email, username, password)) {
            throw new ValidationError('api.register.invalid_email_username_password');
        }

        const [byEmail, byUsername] = await Promise.all([
            userRepository.findByEmail(email),
            userRepository.findByUsername(username)
        ]);
        if(byEmail || byUsername) {
            throw new ConflictError('api.register.already_exists');
        }

        const hashed = bcrypt.hashSync(password, 10);
        await userRepository.create({ username, password: hashed, email });
    },

    verifyToken: (token: string): JwtPayload | null => {
        try {
            return jwt.verify(token, JWT_SECRET) as JwtPayload;
        }
        catch {
            return null;
        }
    }
};
