<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import MessageBox from "$lib/components/MessageBox.svelte";
    import { _ } from 'svelte-i18n';

    let message: Message = $state({ text: null, type: '' });
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
                message = { text: contactsData.message, type: 'error' };
                return;
            }
            if(photo_file) {
                const photoRes = await fetch(`/api/v1/contacts/${contactsData.contactId}/photo`, {
                    method: 'POST',
                    body: photo_file
                });
                const photoData = await photoRes.json();
                if(!photoRes.ok) {
                    message = { text: photoData.message, type: 'error' };
                    return;
                }
            }
            message = { text: contactsData.message, type: 'success' };
            setTimeout(() => {
                window.location.href = `/contacts/${contactsData.contactId}`;
            }, 1000);
        }
        catch(err) {
            message = { text: 'contacts.errors.create', type: 'error' };
            return;
        }
    }
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <form onsubmit={handleSubmit}>
        <MessageBox message={message} />
        <ContactForm
            bind:data={dataState}
            bind:photo_file={photo_file}
            bind:remove_photo={remove_photo}
            saveBtnLabel={'contacts.actions.create'}    
        />
    </form>
</div>
