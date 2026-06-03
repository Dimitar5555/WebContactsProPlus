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

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>{$_('favourite_contacts.title')}</h1>
    <Contacts {store} />
</div>
