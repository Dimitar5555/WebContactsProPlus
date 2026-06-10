<script lang="ts">
    import "$lib/assets/contacts.css";
    import { _ } from 'svelte-i18n';
    let { data = $bindable(), photo_file = $bindable(), remove_photo = $bindable(), saveBtnLabel }: any = $props();
    let contact = $state(data.contact);
    let phoneNumbers = $state(data.phone_numbers);
    let canvas: HTMLCanvasElement;
</script>

<input type="hidden" name="contact_id" bind:value={contact.id} />
<div class="row">
    <div class="col-12 col-md-3">
        <div class="d-flex flex-column align-items-center">
            <label for="contactPhoto">{$_('contacts.photo_alt')}</label>
            {#if contact.photo_url && !remove_photo && !photo_file}
                <img src={`/api/v1/photos/thumb_${contact.photo_url}`} alt="Contact Photo" class="border mb-2 contact-photo-thumb" />
            {/if}
            <canvas width="90" height="90" class="border" bind:this={canvas}></canvas>
            <input class="form-control" type="file" id="contactPhoto" name="contactPhoto" accept="image/*" onchange={async (e) => {
                const fileReader = new FileReader();
                photo_file = (e.target as HTMLInputElement).files[0] as File;
                if(photo_file) {
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
            <input type="hidden" name="photoURL" bind:value={contact.photo_url} />
            <input type="hidden" name="remove_photo" bind:value={remove_photo} />
            <br/>
            <button type="button" onclick={() => {
                contact.photo_url = null;
                canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if(photoInput) {
                    photoInput.value = '';
                    remove_photo = true;
                }
            }}>{$_('contacts.remove_photo')}</button>
        </div>
    </div>
    <div class="col-12 col-md-9">
        <label for="firstNameInput">
            {$_('contacts.first_name')}
        </label>
        <input class="form-control" type="text" name="first_name" id="firstNameInput" bind:value={contact.first_name} />
        <br>
        <label for="lastNameInput">
            {$_('contacts.last_name')}
        </label>
        <input class="form-control" type="text" name="last_name" id="lastNameInput" bind:value={contact.last_name} />
        <br>
        <label>{$_('contacts.phone_numbers')}</label>
        <div class="d-flex flex-column gap-2 mb-2">
            {#each phoneNumbers as unused, index}
            <div class="d-flex flex-row gap-2">
                <div class="flex-shrink-1">
                    <input class="form-control" type="text" name="phone_numbers[]" placeholder={`${$_('contacts.phone_number')} ${index + 1}`} required bind:value={phoneNumbers[index].phone_number} />
                </div>
                <div class="flex-shrink-1">
                    <select class="form-control" name="phone_label[]" bind:value={phoneNumbers[index].label}>
                        <option value={null}>{$_('contacts.label.no_label')}</option>
                        <option value="MOBILE">{$_('contacts.label.mobile')}</option>
                        <option value="HOME">{$_('contacts.label.home')}</option>
                        <option value="WORK">{$_('contacts.label.work')}</option>
                    </select>
                </div>
                <button class="btn btn-outline-danger" type="button" onclick={() => phoneNumbers.splice(index, 1)}>
                    <i class="bi bi-trash-fill"></i> {$_('contacts.remove_phone')}
                </button>
            </div>
            {/each}
            <button class="btn btn-outline-primary flex-shrink-1" type="button" onclick={() => phoneNumbers.push({id: null, phone_number: '', label: null})}>
                <i class="bi bi-plus"></i> {$_('contacts.add_phone')}
            </button>
        </div>
        <label>{$_('contacts.notes')}
            <textarea class="form-control" name="notes" bind:value={contact.notes}></textarea>
        </label>
        <button class="btn btn-primary" type="submit">{$_(saveBtnLabel)}</button>
    </div>
</div>
