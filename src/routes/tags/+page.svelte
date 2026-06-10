<script lang="ts">
    import { _ } from 'svelte-i18n';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import TagManager from '$lib/components/TagManager.svelte';
    import { createTag } from '$lib/api/tags';

    let { data }: { data: { tags: TagWithCount[] } } = $props();
    const toastStore = new ToastStore();
    let tags = $state<TagWithCount[]>(data.tags);
    let label = $state('');
    let color = $state('#3b82f6');

    async function handleCreate() {
        const result = await createTag({ label, color });
        toastStore.add(result.message.message, result.message.type);
        if(result.message.type === 'success' && result.tag) {
            tags = [...tags, { ...result.tag, contact_count: 0 }];
            label = '';
            color = '#3b82f6';
        }
    }
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="m-0">{$_('navigation.manage_tags')}</h1>
        <a class="btn btn-outline-primary" href="/contacts">{$_('contacts.all_contacts')}</a>
    </div>

    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <div class="row g-2 align-items-end">
            <div class="col-12 col-md-5">
                <label class="form-label small fw-semibold">{$_('contacts.tags.label')}</label>
                <input class="form-control" bind:value={label} />
            </div>
            <div class="col-12 col-md-3">
                <label class="form-label small fw-semibold">{$_('contacts.tags.color')}</label>
                <input class="form-control form-control-color w-100" type="color" bind:value={color} />
            </div>
            <div class="col-12 col-md-auto">
                <button class="btn btn-outline-primary" type="button" onclick={handleCreate}>{$_('tags.actions.create')}</button>
            </div>
        </div>
    </div>

    <TagManager tags={tags} {toastStore} onChange={(nextTags) => tags = nextTags} />
</div>

<ToastPanel data={toastStore} />
