<script lang="ts">
    let { message }: { message: Message } = $props();
</script>
{#if message.text !== null}
<div 
    class="alert"
    class:alert-success={message.type === 'success'}
    class:alert-danger={message.type === 'error'}
    role="alert"
    >
    {message.text}
</div>
{/if}
