<script lang="ts">
    import { _ } from "svelte-i18n";
</script>

<button class="btn btn-outline-primary" onclick={() => history.back()}>
    <i class="bi bi-arrow-left"></i>
    {$_('contacts.actions.back')}
</button>
