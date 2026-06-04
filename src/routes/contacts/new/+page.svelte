<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';
    import { _ } from 'svelte-i18n';

    const toastStore = new ToastStore();
    let dataState = $state({
        contact: {
            first_name: '',
            last_name: '',
            notes: ''
        },
        phone_numbers: [{id: null, phone_number: '', label: null}]
    });
    let photo_file = $state(null);
    let remove_photo = $state(false);

    async function handleSubmit(event: Event) {
        event.preventDefault();
        const all_data = {
            ...dataState.contact,
            phone_numbers: dataState.phone_numbers.filter(p => p.phone_number.trim() !== '')
        }
        try {
            const contactsRes = await fetch('/api/v1/contacts', {
                method: 'POST',
                body: JSON.stringify(all_data)
            });
            const contactsData = await contactsRes.json();
            if(!contactsRes.ok) {
                toastStore.add(contactsData.message, 'error');
                return;
            }
            if(photo_file) {
                const photoRes = await fetch(`/api/v1/contacts/${contactsData.contactId}/photo`, {
                    method: 'POST',
                    body: photo_file
                });
                const photoData = await photoRes.json();
                if(!photoRes.ok) {
                    toastStore.add(photoData.message, 'error');
                    return;
                }
            }
            toastStore.add(contactsData.message, 'success');
            setTimeout(() => {
                window.location.href = `/contacts/${contactsData.contactId}`;
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
