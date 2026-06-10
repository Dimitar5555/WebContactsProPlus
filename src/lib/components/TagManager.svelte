<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { goto } from '$app/navigation';
    import { createTag, deleteTag, renameTag } from '$lib/api/tags';
    import type { ToastStore } from '$lib/state/toasts.svelte';

    let { tags = $bindable([]), toastStore, onChange }: { tags?: TagWithCount[]; toastStore: ToastStore; onChange?: (tags: TagWithCount[]) => void } = $props();

    let editingTagId = $state<number | null>(null);
    let editingLabel = $state('');
    let editingColor = $state('#3b82f6');

    function startEdit(tag: Tag) {
        editingTagId = tag.id;
        editingLabel = tag.label;
        editingColor = tag.color;
    }

    async function handleSave(tagId: number) {
        const result = await renameTag(tagId, { label: editingLabel, color: editingColor });
        toastStore.add(result.message.message, result.message.type);
        if(result.message.type === 'success' && result.tag) {
            tags = tags.map((tag) => tag.id === tagId ? { ...result.tag!, contact_count: tag.contact_count } : tag);
            onChange?.(tags);
            editingTagId = null;
        }
    }

    async function handleDelete(tagId: number) {
        if(!confirm($_('contacts.tags.delete_confirm'))) {
            return;
        }
        const result = await deleteTag(tagId);
        toastStore.add(result.message, result.type);
        if(result.type === 'success') {
            tags = tags.filter((tag) => tag.id !== tagId);
            onChange?.(tags);
        }
    }
</script>

<div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 m-0">{$_('contacts.tags.manage_title')}</h2>
    </div>

    {#if tags.length === 0}
        <p class="text-muted small mb-0">{$_('contacts.tags.empty')}</p>
    {:else}
        <div class="d-flex flex-column gap-2">
            {#each tags as tag}
                <div class="d-flex flex-column flex-md-row align-items-md-center gap-2 justify-content-between border rounded-3 p-2">
                    {#if editingTagId === tag.id}
                        <div class="d-flex flex-column flex-md-row gap-2 flex-grow-1">
                            <input class="form-control" bind:value={editingLabel} />
                            <input class="form-control form-control-color" type="color" bind:value={editingColor} />
                        </div>
                    {:else}
                        <a class="text-decoration-none" href={`/contacts?tag=${tag.id}`}>
                            <span class="contact-tag-chip" style={`background-color: ${tag.color};`}>
                                {tag.label}
                                <span class="ms-2 badge bg-light text-dark">{tag.contact_count}</span>
                            </span>
                        </a>
                    {/if}

                    <div class="d-flex gap-2">
                        {#if editingTagId === tag.id}
                            <button class="btn btn-sm btn-success" type="button" onclick={() => handleSave(tag.id)}>{$_('tags.actions.save')}</button>
                            <button class="btn btn-sm btn-outline-secondary" type="button" onclick={() => editingTagId = null}>{$_('tags.actions.cancel')}</button>
                        {:else}
                            <button class="btn btn-sm btn-outline-secondary" type="button" onclick={() => startEdit(tag)}>{$_('tags.actions.edit')}</button>
                            <button class="btn btn-sm btn-outline-danger" type="button" onclick={() => handleDelete(tag.id)}>{$_('tags.actions.delete')}</button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
