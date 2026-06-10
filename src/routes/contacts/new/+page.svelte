<script lang="ts">
    import { createContact, uploadContactPhoto, validateContactForm } from '$lib/api/contacts';
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import { _ } from 'svelte-i18n';

    const toastStore = new ToastStore();
    let dataState = $state({
        first_name: '',
        last_name: '',
        notes: '',
        phone_numbers: [{phone_number: '', label: null}]
    } as CreateContactPayload);
    let photo_file = $state(null);
    let remove_photo = $state(false);

    async function handleSubmit(event: Event) {
        event.preventDefault();
        const validation = await validateContactForm(dataState);
        if(validation.type === 'error') {
            toastStore.add(validation.message, 'error');
            return;
        }
        try {
            const createResult = await createContact(dataState);
            if(createResult.message.type === 'error' || !createResult.contactId) {
                toastStore.add(createResult.message.message, 'error');
                return;
            }
            if(photo_file) {
                const photoResult = await uploadContactPhoto(createResult.contactId, photo_file);
                if(photoResult.type === 'error') {
                    toastStore.add(photoResult.message, 'error');
                    return;
                }
            }
            toastStore.add(createResult.message.message, 'success');
            setTimeout(() => {
                window.location.href = `/contacts/${createResult.contactId}`;
            }, 1000);
        }
        catch(err) {
            toastStore.add('contacts.errors.create', 'error');
            return;
        }
    }
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <form onsubmit={handleSubmit}>
        <ContactForm
            bind:data={dataState}
            bind:photo_file={photo_file}
            bind:remove_photo={remove_photo}
            saveBtnLabel={'contacts.actions.create'}    
        />
    </form>
</div>
<ToastPanel data={toastStore} />
