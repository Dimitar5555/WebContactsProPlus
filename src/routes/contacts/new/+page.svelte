<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import LogoutButton from '$lib/components/LogoutButton.svelte';
    import MessageBox from "$lib/components/MessageBox.svelte";

    let successMessage: string = $state('');
    let errorMessage: string = $state('');
    let dataState = $state({
        contact: {
            first_name: '',
            last_name: '',
            notes: ''
        },
        phone_numbers: [{id: null, phone_number: '', label: null}]
    });

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
        .then(data => {
            if (data.error) {
                errorMessage = data.error;
                successMessage = '';
            }
            else {
                successMessage = data.message;
                errorMessage = '';
                setTimeout(() => {
                    window.location.href = '/contacts';
                }, 1000);
            }
        })
        .catch(() => {
            errorMessage = 'Грешка при създаването на контакта';
            successMessage = '';
        });
    }
</script>

<InternalNavigation />
<LogoutButton />

<form onsubmit={handleSubmit}>
    <MessageBox successMessage={successMessage} errorMessage={errorMessage} />
    <ContactForm bind:data={dataState} />
    <button>Създай контакт</button>
</form>
