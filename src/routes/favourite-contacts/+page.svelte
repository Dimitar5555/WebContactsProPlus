<script lang="ts">
    import { _ } from 'svelte-i18n';
    import type { PageProps } from './$types';
    import { ContactStore } from '$lib/state/contacts.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import Contacts from '$lib/components/Contacts.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';

    let { data }: PageProps = $props();
    const toastStore = new ToastStore();
    let store = new ContactStore(data.contacts, toastStore);
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>{$_('favourite_contacts.title')}</h1>
    <Contacts {store} />
</div>
<ToastPanel data={toastStore} />
