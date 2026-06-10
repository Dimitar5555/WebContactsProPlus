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
    let store = $derived(new ContactStore(data.contacts, data.tags, toastStore));
    const showOnlyFavourites = $derived($page.url.searchParams.get('filter') === 'favourites')
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <h1 class="m-0">{$_(showOnlyFavourites ? 'contacts.favourite_contacts' : 'contacts.all_contacts')}</h1>
        <a href="/contacts/new" class="btn btn-outline-primary">
            <i class="bi bi-plus-lg"></i>
            {$_('contacts.add')}
        </a>
    </div>

    <Contacts {store} availableTags={data.tags} selectedTagId={data.selectedTagId} {showOnlyFavourites} />
</div>
<ToastPanel data={toastStore} />
