<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import MessageBox from "$lib/components/MessageBox.svelte";

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

    function handleSubmit(event: Event) {
        event.preventDefault();
        const all_data = {
            ...dataState.contact,
            phone_numbers: dataState.phone_numbers.filter(p => p.phone_number.trim() !== '')
        }
        fetch('/api/v1/contacts', {
            method: 'POST',
            body: JSON.stringify(all_data)
        })
        .then(response => response.json())
        .then(async (data) => {
            if(data.error) {
                throw data.error;
            }
            if(!photo_file) {
                return data;
            }
            const photoCall = await fetch(`/api/v1/contacts/${data.contactId}/photo`, {
                method: 'POST',
                body: photo_file
            });
            const newData = await photoCall.json();
            if(newData.error) {
                throw newData.error;
            }
            return data;
        })
        .then((data) => {
            message = { text: data.message, type: 'success' };
            setTimeout(() => {
                window.location.href = `/contacts/${data.contactId}`;
            }, 1000);
        })
        .catch((err) => {
            message = { text: err, type: 'error' };
        });
    }
</script>

<InternalNavigation />

<form onsubmit={handleSubmit}>
    <MessageBox message={message} messageType={messageType} />
    <ContactForm bind:data={dataState} bind:photo_file={photo_file} bind:remove_photo={remove_photo} />
    <button>Създай контакт</button>
</form>
