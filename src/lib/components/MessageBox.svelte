<script lang="ts">
    let { successMessage, errorMessage }: { successMessage: string, errorMessage: string } = $props();
</script>
<div style="background-color: lightgreen; padding: 10px; margin-bottom: 10px;" hidden={!successMessage}>
    {successMessage}
</div>
<div style="background-color: lightcoral; padding: 10px; margin-bottom: 10px;" hidden={!errorMessage}>
    {errorMessage}
</div>
