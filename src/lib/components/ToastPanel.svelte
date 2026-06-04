<script lang="ts">
    import { _ } from 'svelte-i18n';
    import type { ToastStore } from '$lib/state/toasts.svelte.ts';

    let { data }: { data: ToastStore } = $props();
    function removeToast(event: MouseEvent, id: number) {
        if(event) {
            event.preventDefault();
        }
        data.remove(id);
    }
</script>
<div style="position: fixed; top: 1rem; right: 1rem; bottom: 1rem; z-index: 1000;" class="d-flex flex-column-reverse flex-end">
    {#each data.toasts as toast}
        <div
            class="alert"
            class:alert-success={toast.type === 'success'}
            class:alert-warning={toast.type === 'warning'}
            class:alert-danger={toast.type === 'error'}
            oncontextmenu={(e) => removeToast(e, toast.id)}
            onclick={() => removeToast(null, toast.id)}
            >
            {$_(toast.message)}
        </div>
    {/each}
</div>
