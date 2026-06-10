<script lang="ts">
    import "$lib/assets/contacts.css";
    import { _ } from 'svelte-i18n';
    let { data = $bindable(), photo_file = $bindable(), remove_photo = $bindable(), saveBtnLabel }: any = $props();
    let contact = $state(data);
    let canvas: HTMLCanvasElement;
</script>
<input type="hidden" name="contact_id" bind:value={contact.id} />
<input type="hidden" name="photoURL" bind:value={contact.photo_url} />
<input type="hidden" name="remove_photo" bind:value={remove_photo} />

<div class="row g-4">
    <!-- Left Column: Photo Upload Section -->
    <div class="col-12 col-md-4 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100 d-flex flex-column align-items-center">
            <span class="form-section-label mb-3">{$_('contacts.photo_alt')}</span>
            
            <!-- Dynamic Avatar Display Window -->
            <div class="edit-avatar-preview shadow-sm mb-3">
                {#if contact.photo_url && !remove_photo && !photo_file}
                    <img src={`/api/v1/photos/thumb_${contact.photo_url}`} alt="Contact Thumbnail" class="contact-photo" />
                {:else if !photo_file}
                    <div class="contact-photo-thumb contact-photo-placeholder rounded-circle">
                        <i class="bi bi-person-fill"></i>
                    </div>
                {/if}
                <!-- Canvas renders on top only when a file is picked -->
                <canvas width="120" height="120" class="contact-photo" class:d-none={!photo_file} bind:this={canvas}></canvas>
            </div>

            <!-- Custom Clean File Input styling -->
            <div class="w-100 mb-3">
                <input class="form-control form-control-sm" type="file" id="contactPhoto" name="contactPhoto" accept="image/*" onchange={async (e) => {
                    const fileReader = new FileReader();
                    photo_file = (e.target as HTMLInputElement).files[0] as File;
                    if(photo_file) {
                        remove_photo = false;
                        fileReader.readAsDataURL(photo_file);
                        fileReader.onload = (event) => {
                            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                            const img = new Image();
                            img.onload = () => {
                                const ctx = canvas.getContext('2d');
                                if(ctx) {
                                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                                    const y = (canvas.height / 2) - (img.height / 2) * scale;
                                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                                }
                            };
                            img.src = event.target?.result as string;
                        };
                    }
                }} />
            </div>

            {#if contact.photo_url || photo_file}
                <button type="button" class="btn btn-sm btn-outline-secondary w-100" onclick={() => {
                    if(contact.photo_url) {
                        remove_photo = true;
                    }
                    contact.photo_url = null;
                    photo_file = null;
                    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                    const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if(photoInput) photoInput.value = '';
                }}>
                    <i class="bi bi-image-alt me-1"></i>{$_('contacts.remove_photo')}
                </button>
            {/if}
        </div>
    </div>

    <!-- Right Column: Text & Dynamic Form Fields Data -->
    <div class="col-12 col-md-8 col-lg-9">
        <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            
            <!-- Name Block Row -->
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6">
                    <label class="form-label fw-semibold text-dark small" for="firstNameInput">
                        {$_('contacts.first_name')}
                    </label>
                    <input class="form-control px-3 py-2" type="text" name="first_name" id="firstNameInput" required bind:value={contact.first_name} />
                </div>
                <div class="col-12 col-sm-6">
                    <label class="form-label fw-semibold text-dark small" for="lastNameInput">
                        {$_('contacts.last_name')}
                    </label>
                    <input class="form-control px-3 py-2" type="text" name="first_name" id="lastNameInput" required bind:value={contact.last_name} />
                </div>
            </div>

            <!-- Phone Number Management Array Block -->
            <div class="mb-4">
                <label class="form-label fw-semibold text-dark small d-block mb-2">{$_('contacts.phone_numbers')}</label>
                
                <div class="d-flex flex-column gap-2 align-items-stretch bg-white p-2 rounded-3 border row-capsule">
                    {#each contact.phone_numbers as UNSUSED, index}
                        {@const phoneNumber = contact.phone_numbers[index]}
                        <div class="d-flex flex-column flex-sm-row gap-2 align-items-stretch bg-light p-2 rounded-3 border">
                            <div class="flex-grow-1">
                                <input class="form-control border-sm-0 shadow-none fw-medium text-dark" type="text" name="phone_numbers[]" placeholder={`${$_('contacts.phone_number')}} ${index + 1}`} required bind:value={phoneNumber.phone_number} />
                            </div>
                            <div class="phone-label-select-wrapper">
                                <select class="form-select border-sm-0 bg-white fw-semibold text-dark shadow-none" name="phone_label[]" bind:value={phoneNumber.label}>
                                    <option value={null}>{$_('contacts.label.no_label')}</option>
                                    <option value="MOBILE">{$_('contacts.label.mobile')}</option>
                                    <option value="HOME">{$_('contacts.label.home')}</option>
                                    <option value="WORK">{$_('contacts.label.work')}</option>
                                </select>
                            </div>
                            <button class="btn btn-outline-danger px-3" type="button" onclick={() => contact.phone_numbers.splice(index, 1)} title={$_('contacts.remove_phone')}>
                                <i class="bi bi-trash3"></i> <span class="d-sm-none ms-1">{$_('contacts.remove_phone')}</span>
                            </button>
                        </div>
                    {/each}
                </div>

                <button class="btn btn-sm btn-outline-primary px-3 rounded-pill" type="button" onclick={() => contact.phone_numbers.push({id: null, phone_number: '', label: null})}>
                    <i class="bi bi-plus-lg me-1"></i> {$_('contacts.add_phone')}
                </button>
            </div>

            <!-- Notes Field Box Section -->
            <div class="mb-4">
                <label class="form-label fw-semibold text-dark small" for="notesInput">{$_('contacts.notes')}</label>
                <textarea class="form-control px-3 py-2" id="notesInput" name="notes" rows="4" bind:value={contact.notes}></textarea>
            </div>

            <!-- Submission Actions Layout footer -->
            <div class="border-top pt-4 text-end">
                <button class="btn btn-primary" type="submit">
                    <i 
                        class="bi"
                        class:bi-floppy-fill={saveBtnLabel === 'contacts.actions.save'}
                        class:bi-plus-lg={saveBtnLabel === 'contacts.actions.create'}    
                    ></i>
                    {$_(saveBtnLabel)}
                </button>
            </div>

        </div>
    </div>
</div>
