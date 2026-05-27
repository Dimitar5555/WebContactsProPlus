<script lang="ts">
import {_} from 'svelte-i18n';
    import type { PageProps } from './$types';
    import Contacts from '$lib/components/Contacts.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';

    let { data }: PageProps = $props();
</script>

<InternalNavigation />
<button on:click={() => window.location.href = '/contacts/new'}>{$_('contacts.add')}</button>

<div class="container bg-white p-4 mt-3 rounded shadow">
    <h1>{$_('contacts.my_contacts')}</h1>
    <Contacts contacts={data.contacts} />
</div>
