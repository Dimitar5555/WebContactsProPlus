<script lang="ts">
    import { _ } from 'svelte-i18n';
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import type { PageProps } from './$types';
    import BackButton from '$lib/components/BackButton.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';
    import { removeContactPhoto, updateContact, uploadContactPhoto, validateContactForm } from '$lib/api/contacts';

    const toastStore = new ToastStore();
    let { data }: PageProps = $props();
    let dataState = $state(data.contact as ContactWithPhones);
    let photo_file = $state(null);
    let remove_photo = $state(false);

    async function submitForm(event: Event) {
        event.preventDefault();
        const validation = await validateContactForm(dataState);
        if(validation.type === 'error') {
            toastStore.add(validation.message, 'error');
            return;
        }
        try {
            const updateResult = await updateContact(dataState);
            if(updateResult.type === 'error') {
                toastStore.add(updateResult.message, 'error');
                return;
            }
            if(photo_file) {
                const photoResult = await uploadContactPhoto(dataState.id, photo_file);
                if(photoResult.type === 'error') {
                    toastStore.add(photoResult.message, 'error');
                    return;
                }
            }
            else if(remove_photo) {
                const removePhotoResult = await removeContactPhoto(dataState.id);
                if(removePhotoResult.type === 'error') {
                    toastStore.add(removePhotoResult.message, 'error');
                    return;
                }
            }
            toastStore.add('api.contacts.update.success', 'success');
            setTimeout(() => {
                window.location.href = `/contacts/${dataState.id}`;
            }, 1000);
        }
        catch(err) {
            console.error('Error updating contact:', err);
            toastStore.add('api.contacts.update.failed', 'error');
            return;
        }
    }
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <BackButton />
    {#if !data.contact}
        <p>{$_('contacts.not_found')}</p>
    {:else}
        <form onsubmit={submitForm}>
            <ContactForm 
                bind:data={dataState}
                bind:photo_file={photo_file}
                bind:remove_photo={remove_photo}
                availableTags={data.tags}
                saveBtnLabel={'contacts.actions.save'}
            />
        </form>
    {/if}
</div>
<ToastPanel data={toastStore} />
