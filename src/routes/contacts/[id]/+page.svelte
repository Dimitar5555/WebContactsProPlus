<script lang="ts">
    import "$lib/assets/contacts.css";
    import { _ } from 'svelte-i18n';
    import InternalNavigation from '$lib/components/InternalNavigation.svelte';
    import type { PageProps } from './$types';
    import { deleteContact } from "$lib/api/contacts";
    import Button from '$lib/components/Button.svelte';
    import EditButton from '$lib/components/EditButton.svelte';
    import BackButton from '$lib/components/BackButton.svelte';
    import ToastPanel from '$lib/components/ToastPanel.svelte';
    import { ToastStore } from '$lib/state/toasts.svelte';

    const toastStore = new ToastStore();
    async function handleDelete(contactId: number) {
        const result = await deleteContact(contactId);
        if(result.type === 'success') {
            toastStore.add(result.message, 'success');
            setTimeout(() => {
                window.location.href = '/contacts';
            }, 3000);
        }
        else {
            toastStore.add(result.message, 'error');
        }
    }

    let { data }: PageProps = $props();
</script>

<InternalNavigation />

<div class="container bg-white p-4 mt-3 rounded shadow">
    <BackButton />
    {#if !data.contact}
        <div class="alert alert-warning text-center p-4 rounded shadow-sm">
            <i class="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
            <p class="m-0 fw-semibold">{$_('contacts.not_found')}</p>
        </div>
    {:else}
        {@const contact: ContactWithPhones = data.contact}
        
        <div class="card bg-white border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="profile-banner bg-light border-bottom p-4">
                <div class="d-flex flex-column flex-md-row align-items-center gap-4 text-center text-sm-start position-relative">
                    
                    <div>
                        {#if contact.photo_url}
                            <img 
                                src={`/api/v1/photos/thumb_${contact.photo_url}`}
                                alt={$_('contacts.photo_alt')}
                                class="contact-photo-large rounded-circle"
                            />
                        {:else}
                            <div class="contact-photo-thumb contact-photo-placeholder rounded-circle">
                                <i class="bi bi-person-fill"></i>
                            </div>
                        {/if}
                    </div>

                    <div class="flex-grow-1 mt-2 mt-sm-0">
                        <div class="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                            <h2 class="m-0 fw-bold text-dark">{contact.first_name} {contact.last_name}</h2>
                            {#if contact.is_favourite}
                                <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                                    <i class="bi bi-heart-fill me-1"></i>{$_('contacts.is_favourite')}
                                </span>
                            {/if}
                        </div>
                        <p class="text-muted small m-0">ID: #{contact.id}</p>
                    </div>

                    <div class="align-self-sm-end btn-group">
                        <EditButton contactId={data.contact.id} />
                        <Button
                            type="danger"
                            outline={true}
                            size=""
                            string="contacts.actions.delete"
                            onClick={() => handleDelete(contact.id)}
                            icon="bi-trash3-fill"
                        />
                    </div>
                </div>
            </div>

            <div class="card-body p-4 p-md-5">
                <div class="row g-4">
                    
                    <div class="col-12 col-md-6">
                        <h5 class="text-secondary uppercase-tracking mb-3">
                            <i class="bi bi-telephone me-2 text-primary"></i>{$_('contacts.phone_numbers') || 'Phone Numbers'}
                        </h5>
                        {#if data.contact.phone_numbers && data.contact.phone_numbers.length > 0}
                            <ul class="list-group list-group-flush border rounded-3 overflow-hidden">
                                {#each data.contact.phone_numbers as phone}
                                    <li class="list-group-item d-flex justify-content-between align-items-center p-2">
                                        <a href={`tel:${phone.phone_number}`} class="text-decoration-none">
                                            {phone.phone_number}
                                        </a>
                                        {#if phone.label}
                                            <span class="badge text-bg-primary">
                                                {$_(`contacts.label.${phone.label.toLowerCase()}`)}
                                            </span>
                                        {/if}
                                    </li>
                                {/each}
                            </ul>
                        {:else}
                            <p class="text-muted italic small">{$_('contacts.no_phone_numbers')}</p>
                        {/if}
                    </div>

                    <div class="col-12 col-md-6">
                        <h5 class="text-secondary uppercase-tracking mb-3">
                            <i class="bi bi-sticky me-2 text-primary"></i>{$_('contacts.notes')}
                        </h5>
                        <div class="p-3 bg-light rounded-3 border h-100 min-height-notes">
                            {#if contact.notes}
                                <p class="m-0 text-dark whitespace-pre-line">{contact.notes}</p>
                            {:else}
                                <p class="m-0 text-muted small fst-italic">{$_('contacts.no_notes') || 'No notes added for this contact.'}</p>
                            {/if}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    {/if}
</div>
<ToastPanel data={toastStore} />
