<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { page } from '$app/stores';
    import type { PageProps } from './$types';
    import { ContactStore } from '$lib/state/contacts.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import Contacts from '$lib/components/Contacts.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';

    let { data }: PageProps = $props();
    const toastStore = new ToastStore();
    let store = $derived(new ContactStore(data.contacts, toastStore));
    const showOnlyFavourites = $derived($page.url.searchParams.get('filter') === 'favourites')
</script>

<InternalNavigation />
<button onclick={() => window.location.href = '/contacts/new'}>{$_('contacts.add')}</button>

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>{$_(showOnlyFavourites ? 'contacts.favourite_contacts' : 'contacts.all_contacts')}</h1>
    <Contacts {store} />
</div>
<ToastPanel data={toastStore} />