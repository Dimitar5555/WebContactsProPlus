<script lang="ts">
    import { _ } from 'svelte-i18n';
    let { message }: { message: Message } = $props();
</script>
{#if message.text !== null}
<div 
    class="alert"
    class:alert-success={message.type === 'success'}
    class:alert-danger={message.type === 'error'}
    role="alert"
    >
    {$_(message.text)}
</div>
{/if}
