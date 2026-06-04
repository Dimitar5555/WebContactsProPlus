<script lang="ts">
    import { _ } from 'svelte-i18n';
    let { data = $bindable(), photo_file = $bindable(), remove_photo = $bindable(), saveBtnLabel }: any = $props();
    let contact = $state(data.contact);
    let phoneNumbers = $state(data.phone_numbers);
</script>

<input type="hidden" name="contact_id" bind:value={contact.id} />
<div class="row">
    <div class="col-12 col-md-3">
        <div class="d-flex flex-column align-items-center">
            <label>Снимка</label>
            <canvas width="90" height="90" class="border"></canvas>
            <input type="file" name="contactPhoto" accept="image/*" onchange={async (e) => {
                const canvasEl = document.querySelector('canvas') as HTMLCanvasElement;
                const fileReader = new FileReader();
                photo_file = (e.target as HTMLInputElement).files[0] as File;
                if(photo_file) {
                    fileReader.readAsDataURL(photo_file);
                    fileReader.onload = (event) => {
                        canvasEl?.getContext('2d')?.clearRect(0, 0, canvasEl.width, canvasEl.height);
                        const img = new Image();
                        img.onload = () => {
                            const ctx = canvasEl?.getContext('2d');
                            if(ctx) {
                                const scale = Math.min(canvasEl.width / img.width, canvasEl.height / img.height);
                                const x = (canvasEl.width / 2) - (img.width / 2) * scale;
                                const y = (canvasEl.height / 2) - (img.height / 2) * scale;
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
                const canvasEl = document.querySelector('canvas') as HTMLCanvasElement;
                canvasEl?.getContext('2d')?.clearRect(0, 0, canvasEl.width, canvasEl.height);
                const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if(photoInput) {
                    photoInput.value = '';
                    remove_photo = true;
                }
            }}>Премахни снимката</button>
        </div>
    </div>
    <div class="col-12 col-md-9">
        <label>
            Име
            <input type="text" name="first_name" bind:value={contact.first_name} />
        </label>
        <br>
        <label>
            Фамилия
            <input type="text" name="last_name" bind:value={contact.last_name} />
        </label>
        <br>
        <button type="button" onclick={() => phoneNumbers.push({id: null, phone_number: '', label: null})}>+</button>
        {#each phoneNumbers as _, index}
            <input type="text" name="phone_numbers[]" placeholder={`Телефонен номер ${index + 1}`} required bind:value={phoneNumbers[index].phone_number} />
            <select name="phone_label[]" bind:value={phoneNumbers[index].label}>
                <option value={null}>Без етикет</option>
                <option value="MOBILE">Мобилен</option>
                <option value="HOME">Домашен</option>
                <option value="WORK">Работен</option>
            </select>
            <button type="button" onclick={() => phoneNumbers.splice(index, 1)}>Премахни</button>
            <br>
        {/each}
        <label>Бележки
            <textarea name="notes" bind:value={contact.notes}></textarea>
        </label>
        <button type="submit">{$_(saveBtnLabel)}</button>
    </div>
</div>
