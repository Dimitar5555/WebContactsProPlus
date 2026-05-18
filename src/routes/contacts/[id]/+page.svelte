<script lang="ts">
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import LogoutButton from '$lib/components/LogoutButton.svelte';
    import MessageBox from '$lib/components/MessageBox.svelte';
    import type { PageProps } from './$types';

    let message = $state('');
    let messageType = $state('');

    let { data }: PageProps = $props();

    function deleteContact() {
        if (confirm('Сигурни ли сте, че искате да изтриете този контакт?')) {
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
                    message = 'Контактът беше успешно изтрит.';
                    messageType = 'success';
                    window.setTimeout(() => {
                        window.location.href = '/contacts';
                    }, 2000);
                }
                else {
                    message = 'Възникна грешка при изтриването на контакта.';
                    messageType = 'error';
                }
            })
            .catch(() => {
                message = 'Възникна грешка при изтриването на контакта.';
                messageType = 'error';
            });
        }
    }
</script>

<InternalNavigation />

<LogoutButton />

<button on:click={() => history.back()}>Назад</button>
{#if !data.contact}
    <p>Контактът не е намерен.</p>
{:else}
    {@const contact = data.contact}
    <button on:click={() => window.location.href = `/contacts/${data.contact.id}/edit`}>Редактирай</button>
    <button on:click={deleteContact}>Изтрий</button>
    <MessageBox message={message} messageType={messageType} />
    <img 
        src={`/api/v1/photos/${contact.photo_url}`}
        alt="Снимка на контакта"
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
        <p>Този контакт е в любими.</p>
    {/if}
    {#if contact.notes}
        <p>Бележки: {contact.notes}</p>
    {/if}
{/if}
