import type { PageServerLoad } from './$types';
import { contactService } from '$lib/server/services/contact.service';
import { tagService } from '$lib/server/services/tag.service';

export const load: PageServerLoad = async ({ locals, url }: { locals: any; url: URL }): Promise<{ contacts: Contact[]; tags: Tag[]; selectedTagId: number | null }> => {
    const showOnlyFavourites = url.searchParams.get('filter') === 'favourites';
    const selectedTagId = Number(url.searchParams.get('tag'));
    const tagId = !isNaN(selectedTagId) ? selectedTagId : null;
    const [contacts, tags] = await Promise.all([
        contactService.listForUser(locals.user.id, { favouritesOnly: showOnlyFavourites, tagId: tagId ?? 0 }),
        tagService.listForUser(locals.user.id)
    ]);
    return { contacts, tags, selectedTagId: tagId };
};
