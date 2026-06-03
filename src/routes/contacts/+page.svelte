<script lang="ts">
    import { _ } from 'svelte-i18n';
    import type { PageProps } from './$types';
    import { ContactStore } from '$lib/state/contacts.svelte.ts';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import Contacts from '$lib/components/Contacts.svelte';

    let { data }: PageProps = $props();

    let store = new ContactStore(data.contacts);
</script>

<InternalNavigation />
<button onclick={() => window.location.href = '/contacts/new'}>{$_('contacts.add')}</button>

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>{$_('contacts.my_contacts')}</h1>
    <Contacts {store} />
</div>
