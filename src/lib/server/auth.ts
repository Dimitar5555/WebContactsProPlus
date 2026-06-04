import { error } from '@sveltejs/kit';

export function getAuthenticatedUser(locals: App.Locals) {
    if(!locals.user) {
        throw error(401, 'api.generic.unauthorised_user');
    }
    return locals.user;
}
