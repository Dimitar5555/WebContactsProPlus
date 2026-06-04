<script lang="ts">
    import { _ } from 'svelte-i18n';
    import type { PageProps } from './$types';
    import { ContactStore } from '$lib/state/contacts.svelte.ts';
    import { ToastStore } from '$lib/state/toasts.svelte.ts';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import Contacts from '$lib/components/Contacts.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';

    let { data }: PageProps = $props();
    const toastStore = new ToastStore();
    let store = new ContactStore(data.contacts, toastStore);
</script>

<InternalNavigation />
<button onclick={() => window.location.href = '/contacts/new'}>{$_('contacts.add')}</button>

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>{$_('contacts.my_contacts')}</h1>
    <Contacts {store} />
</div>
<ToastPanel data={toastStore} />