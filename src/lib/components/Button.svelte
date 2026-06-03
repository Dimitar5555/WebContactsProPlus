<script lang="ts">
    import { _ } from "svelte-i18n";
    let { type, outline, size, string, onClick, icon }: {
        type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark',
        outline: boolean,
        size: 'sm' | 'lg' | '',
        string: string,
        onClick: () => void,
        icon?: string
    } = $props();
</script>

<button
    class="btn {outline ? `btn-outline-${type}` : `btn-${type}`} {size ? `btn-${size}` : ''}"
    onclick={onClick}
>
    {#if icon}
        <i class={`bi ${icon}`}></i>
    {/if}
    {$_(string)}
</button>
