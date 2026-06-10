import type { PageServerLoad } from './$types';
import { tagService } from '$lib/server/services/tag.service';

export const load: PageServerLoad = async ({ locals }: { locals: any }): Promise<{ tags: TagWithCount[] }> => {
    const tags = await tagService.listForUserWithCounts(locals.user.id);
    return { tags };
};
