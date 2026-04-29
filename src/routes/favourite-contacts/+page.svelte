<script lang="ts">
    import type { PageProps } from './$types';
    import Contacts from '$lib/components/Contacts.svelte';
    import LogoutButton from '$lib/components/LogoutButton.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';

    let { data }: PageProps = $props();
</script>

<InternalNavigation />

<LogoutButton />

<h1>Моите любими контакти</h1>
<Contacts contacts={data.contacts} />
