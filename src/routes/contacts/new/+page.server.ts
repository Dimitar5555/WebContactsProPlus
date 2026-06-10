import type { PageServerLoad } from './$types';
import { tagService } from '$lib/server/services/tag.service';

export const load: PageServerLoad = async ({ locals }: { locals: any }): Promise<{ tags: Tag[] }> => {
    const tags = await tagService.listForUser(locals.user.id);
    return { tags };
};
