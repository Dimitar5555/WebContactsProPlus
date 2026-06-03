<script lang="ts">
    import { _ } from "svelte-i18n";
    import "$lib/components/Button.svelte";
    import Button from "$lib/components/Button.svelte";
    let {contactId} : {contactId: number} = $props();
</script>

<Button
    type="primary"
    outline={false}
    size=""
    string="contacts.actions.edit"
    onClick={() => window.location.href = `/contacts/${contactId}/edit`}
    icon="bi-pencil-square"
/>
