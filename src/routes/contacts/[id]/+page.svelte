<script lang="ts">
    import LogoutButton from '$lib/components/LogoutButton.svelte';
import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<LogoutButton />

<button on:click={() => history.back()}>Назад</button>
{#if !data.contact}
    <p>Контактът не е намерен.</p>
{:else}
    <h2>{data.contact.first_name} {data.contact.last_name}</h2>
    <ul>
        {#each data.phone_numbers as phone}
            <li>{phone.phone_number} {phone.label ? `(${phone.label})` : ''}</li>
        {/each}
    </ul>
    {#if data.contact.is_favourite}
        <p>Този контакт е в любими.</p>
    {/if}
    {#if data.contact.notes}
        <p>Бележки: {data.contact.notes}</p>
    {/if}
{/if}
