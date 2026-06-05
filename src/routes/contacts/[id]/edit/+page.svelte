<script lang="ts">
    import { _ } from 'svelte-i18n';
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import type { PageProps } from './$types';
    import BackButton from '$lib/components/BackButton.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';

    const toastStore = new ToastStore();
    let { data }: PageProps = $props();
    let dataState = $state(data);
    let photo_file = $state(null);
    let remove_photo = $state(false);

    async function submitForm(event: Event) {
        event.preventDefault();
        const contactsRes = await fetch(`/api/v1/contacts/${dataState.contact.id}`, {
            method: 'PUT',
            body: JSON.stringify({...dataState.contact, phone_numbers: dataState.phone_numbers})
        });
        let secondaryRes = true;
        if(photo_file) {
            const photoRes = await fetch(`/api/v1/contacts/${dataState.contact.id}/photo`, {
                method: 'POST',
                body: photo_file
            });
            const data = await photoRes.json();
            secondaryRes = photoRes.ok;
        }
        else if(remove_photo) {
            const removePhotoRes = await fetch(`/api/v1/contacts/${dataState.contact.id}/photo`, {
                method: 'DELETE'
            });
            const data = await removePhotoRes.json();
            secondaryRes = removePhotoRes.ok;
        }
        try {
            if(contactsRes.ok && secondaryRes) {
                const contactsData = await contactsRes.json();
                toastStore.add('contacts.edit.success_update', 'success');
                setTimeout(() => {
                    window.location.href = `/contacts/${dataState.contact.id}`;
                }, 1000);
            }
            else {
                toastStore.add('contacts.edit.failed_update', 'error');
            }
        }
        catch(err) {
            toastStore.add('contacts.edit.failed_update', 'error');
        }
    }
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <BackButton />
    {#if !data.contact}
        <p>{$_('contact.not_found')}</p>
    {:else}
        <form onsubmit={submitForm}>
            <ContactForm 
                bind:data={dataState}
                bind:photo_file={photo_file}
                bind:remove_photo={remove_photo}
                saveBtnLabel={'contacts.save'}
            />
        </form>
    {/if}
</div>
<ToastPanel data={toastStore} />
