<script lang="ts">
    let { successMessage, errorMessage }: { successMessage: string, errorMessage: string } = $props();
</script>
<div class="alert alert-success" role="alert" hidden={!successMessage}>
    {successMessage}
</div>
<div class="alert alert-danger" role="alert" hidden={!errorMessage}>
    {errorMessage}
</div>
