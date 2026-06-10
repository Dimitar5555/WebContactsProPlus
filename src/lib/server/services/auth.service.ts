import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { userRepository } from '../repositories/user.repository';
import {
    ConflictError,
    UnauthorizedError,
    ValidationError
} from '../errors';

if(!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set');
}

export type JwtPayload = {
    id: number;
    username: string;
};

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
    login: async (rawUsername: string | undefined, rawPassword: string | undefined): Promise<{ token: string; maxAge: number }> => {
        const username = rawUsername?.toString().trim();
        const password = rawPassword?.toString() ?? '';

        if(!username || !password) {
            throw new ValidationError('api.login.missing_credentials');
        }

        const user = await userRepository.findByUsername(username);
        if(!user || !bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedError('api.login.invalid_credentials');
        }

        const payload: JwtPayload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return { token, maxAge: 3600 };
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
