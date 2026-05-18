<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import MessageBox from '$lib/components/MessageBox.svelte';
    import type { PageProps } from './$types';

    let messageType = $state('');
    let message = $state('');
    let { data }: PageProps = $props();
    let dataState = $state(data);
    let photo_file = $state(null);
    let remove_photo = $state(false);

    function submitForm(event: Event) {
        event.preventDefault();
        const api_calls = [];
        const contactsCall = fetch(`/api/v1/contacts/${dataState.contact.id}`, {
            method: 'PUT',
            body: JSON.stringify({...dataState.contact, phone_numbers: dataState.phone_numbers})
        });
        api_calls.push(contactsCall);
        if(photo_file) {
            const photoCall = fetch(`/api/v1/contacts/${dataState.contact.id}/photo`, {
                method: 'POST',
                body: photo_file
            });
            api_calls.push(photoCall);
        }
        else if(remove_photo) {
            const removePhotoCall = fetch(`/api/v1/contacts/${dataState.contact.id}/photo`, {
                method: 'DELETE'
            });
            api_calls.push(removePhotoCall);
        }
        Promise.all(api_calls)
        .then(responses => {
            if(responses[0].ok && (responses.length === 1 || responses[1].ok)) {
                messageType = 'success';
                message = 'Контактът беше успешно обновен.';
                setTimeout(() => {
                    window.location.href = `/contacts/${dataState.contact.id}`;
                }, 1000);
            }
            else {
                messageType = 'error';
                message = 'Възникна грешка при обновяването на контакта.';
            }
        })
        .catch(() => {
            messageType = 'error';
            message = 'Възникна грешка при обновяването на контакта.';
        });
    }
</script>

<InternalNavigation />

<button on:click={() => history.back()}>Назад</button>
{#if !data.contact}
    <p>Контактът не е намерен.</p>
{:else}
    <form on:submit={submitForm}>
        <MessageBox message={message} messageType={messageType} />
        <ContactForm bind:data={dataState} bind:photo_file={photo_file} bind:remove_photo={remove_photo} />
        <button type="submit">Запази</button>
    </form>
{/if}
