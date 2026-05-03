<script lang="ts">
    import type { PageProps } from './$types';
    import Contacts from '$lib/components/Contacts.svelte';
    import LogoutButton from '$lib/components/LogoutButton.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';

    let { data }: PageProps = $props();
</script>

<InternalNavigation />
<LogoutButton />
<button on:click={() => window.location.href = '/contacts/new'}>Добави контакт</button>

<h1>Моите контакти</h1>
<Contacts contacts={data.contacts} />
