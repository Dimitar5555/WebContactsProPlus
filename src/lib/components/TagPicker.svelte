<script lang="ts">
    import { _ } from 'svelte-i18n';
    let {
        availableTags = [],
        selectedTags = $bindable([]),
        onToggle
    }: {
        availableTags: Tag[];
        selectedTags?: Tag[];
        onToggle: (tagId: number) => void | Promise<void>;
    } = $props();

    function hasTag(tagId: number): boolean {
        return selectedTags.some((tag) => tag.id === tagId);
    }
</script>

<div class="d-flex flex-column gap-2">
    {#if availableTags.length === 0}
        <p class="text-muted small mb-0">{$_('contacts.no_tags')}</p>
    {:else}
        <div class="d-flex flex-wrap gap-2">
            {#each availableTags as tag}
                <button
                    type="button"
                    class="btn btn-sm {hasTag(tag.id) ? 'btn-dark' : 'btn-outline-secondary'}"
                    onclick={() => onToggle(tag.id)}
                >
                    <span class="contact-tag-chip me-2" style={`background-color: ${tag.color};`}>{tag.label}</span>
                    <i class={hasTag(tag.id) ? 'bi bi-check2' : 'bi bi-plus'}></i>
                </button>
            {/each}
        </div>
    {/if}
</div>
