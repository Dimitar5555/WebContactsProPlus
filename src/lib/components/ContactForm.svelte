<script lang="ts">
    let { data = $bindable(), photo_file = $bindable(), remove_photo = $bindable() }: any = $props();
    let contact = $state(data.contact);
    let phoneNumbers = $state(data.phone_numbers);
</script>

<input type="hidden" name="contact_id" bind:value={contact.id} />

<label>Снимка</label>
<canvas width="360" height="360"></canvas>
<input type="file" name="contactPhoto" accept="image/*" onchange={async (e) => {
    const canvasEl = document.querySelector('canvas') as HTMLCanvasElement | null;
    const fileReader = new FileReader();
    const file = (e.target as HTMLInputElement).files?.[0];
    photo_file = file as File | null;
    if(photo_file) {
        fileReader.readAsDataURL(photo_file);
        fileReader.onload = (event) => {
            canvasEl?.getContext('2d')?.clearRect(0, 0, canvasEl.width, canvasEl.height);
            const img = new Image();
            img.onload = () => {
                const ctx = canvasEl?.getContext('2d');
                if(ctx && canvasEl) {
                    const canvas = canvasEl as HTMLCanvasElement;
                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                    const y = (canvas.height / 2) - (img.height / 2) * scale;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                }
            };
            img.src = (event.target as FileReader).result as string;
        };
    }
}} />
<input type="hidden" name="photoURL" bind:value={contact.photo_url} />
<input type="hidden" name="remove_photo" bind:value={remove_photo} />
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
<br>
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
