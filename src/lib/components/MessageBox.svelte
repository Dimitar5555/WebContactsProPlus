<script lang="ts">
    let { message, messageType }: { message: string | null, messageType: string } = $props();
</script>
<div 
    class="alert"
    class:alert-success={messageType === 'success'}
    class:alert-danger={messageType === 'error'}
    class:d-none={message === null}
    role="alert"
    >
    {message}
</div>
