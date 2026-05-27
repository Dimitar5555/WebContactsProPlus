<script lang="ts">
import {_} from 'svelte-i18n';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import MessageBox from '$lib/components/MessageBox.svelte';
    import type { PageProps } from './$types';

    let message = $state('');
    let messageType = $state('');

    let { data }: PageProps = $props();

    function deleteContact() {
        if (confirm($_('contacts.confirm_delete'))) {
            const promises = [];
            if(data.contact.photo_url) {
                const deletePhotoPromise = fetch(`/api/v1/contacts/${data.contact.id}/photo`, {
                    method: 'DELETE'
                });
                promises.push(deletePhotoPromise);
            }
            const deleteContactPromise = fetch(`/api/v1/contacts/${data.contact.id}`, {
                method: 'DELETE'
            });
            promises.push(deleteContactPromise);
            Promise.all(promises)
            .then(responses => {
                if(responses.every(res => res.ok)) {
                    message = $_('contacts.delete_success');
                    messageType = 'success';
                    window.setTimeout(() => {
                        window.location.href = '/contacts';
                    }, 2000);
                }
                else {
                    message = $_('contacts.delete_failed');
                    messageType = 'error';
                }
            })
            .catch(() => {
                message = $_('contacts.delete_failed');
                messageType = 'error';
            });
        }
    }
</script>

<InternalNavigation />

<button on:click={() => history.back()}>{$_('contacts.back')}</button>
{#if !data.contact}
    <p>{$_('contacts.not_found')}</p>
{:else}
    {@const contact = data.contact}
    <button on:click={() => window.location.href = `/contacts/${data.contact.id}/edit`}>{$_('contacts.save')}</button>
    <button on:click={deleteContact}>{$_('contacts.delete')}</button>
    <MessageBox message={message} messageType={messageType} />
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
