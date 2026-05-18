<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import LogoutButton from '$lib/components/LogoutButton.svelte';
    import MessageBox from '$lib/components/MessageBox.svelte';
    import type { PageProps } from './$types';

    let messageType = $state('');
    let message = $state('');
    let { data }: PageProps = $props();
    let dataState = $state(data);

    function submitForm(event: Event) {
        event.preventDefault();
        fetch(`/api/v1/contacts/${dataState.contact.id}`, {
            method: 'PUT',
            body: JSON.stringify({...dataState.contact, phone_numbers: dataState.phone_numbers})
        })
        .then(response => {
            if(response.ok) {
                successMessage = 'Контактът беше успешно обновен.';
                errorMessage = '';
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
<LogoutButton />

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
