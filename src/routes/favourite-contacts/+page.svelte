<script lang="ts">
    import type { PageProps } from './$types';
    import Contacts from '$lib/components/Contacts.svelte';
    import LogoutButton from '$lib/components/LogoutButton.svelte';

    let { data }: PageProps = $props();
</script>

<LogoutButton />

<h1>Моите любими контакти</h1>
<Contacts contacts={data.contacts} />

<div>
    <a href="/contacts">Всички контакти</a>
    |
    <a href="/favourite-contacts">Любими контакти</a>
</div>
