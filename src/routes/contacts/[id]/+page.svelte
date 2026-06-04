<script lang="ts">
    import { _ } from 'svelte-i18n';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import MessageBox from '$lib/components/MessageBox.svelte';
    import type { PageProps } from './$types';
    import { deleteContact } from "$lib/api/contacts";
    import Button from '$lib/components/Button.svelte';
    import EditButton from '$lib/components/EditButton.svelte';
    import BackButton from '$lib/components/BackButton.svelte';

    let message: Message = $state({ text: null, type: '' });
    async function handleDelete(contactId: number) {
        message = await deleteContact(contactId);
        if(message.type === 'success') {
            setTimeout(() => {
                window.location.href = '/contacts';
            }, 3000);
        }
        else {
            setTimeout(() => {
                message = { text: null, type: '' };
            }, 3000);
        }
    }

    let { data }: PageProps = $props();
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <BackButton />
{#if !data.contact}
    <p>{$_('contacts.not_found')}</p>
{:else}
    {@const contact = data.contact}
        <EditButton contactId={data.contact.id} />
        <Button
            type="danger"
            outline={true}
            size=""
            string="contacts.actions.delete"
            onClick={() => handleDelete(contact.id)}
            icon="bi-trash3-fill"
        />
        <MessageBox message={message} />
        <img 
            src={`/api/v1/photos/${contact.photo_url}`}
            alt={$_('contacts.photo_alt')}
            width="200"
            height="200"
            class:d-none={!contact.photo_url}
        />
        <h2>{contact.first_name} {contact.last_name}</h2>
        <ul>
            {#each data.phone_numbers as phone}
                <li>{phone.phone_number} {phone.label ? `(${phone.label})` : ''}</li>
            {/each}
        </ul>
        {#if contact.is_favourite}
            <p>{$_('contacts.is_favourite')}</p>
        {/if}
        {#if contact.notes}
            <p>{$_('contacts.notes')}: {contact.notes}</p>
        {/if}
    {/if}
</div>
