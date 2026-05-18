<script lang="ts">
    import type { PageProps } from './$types';
    import Contacts from '$lib/components/Contacts.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';

    let { data }: PageProps = $props();
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>Моите любими контакти</h1>
    <Contacts contacts={data.contacts} />
</div>
