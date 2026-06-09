import type { PageServerLoad } from './$types';
import { contactService } from '$lib/server/services/contact.service';

export const load: PageServerLoad = async ({ locals, url }: { locals: any; url: URL }): Promise<{ contacts: Contact[] }> => {
    const showOnlyFavourites = url.searchParams.get('filter') === 'favourites';
    const contacts = await contactService.listForUser(locals.user.id, { favouritesOnly: showOnlyFavourites });
    return { contacts };
};
