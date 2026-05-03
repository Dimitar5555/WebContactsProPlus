<script lang="ts">
    import type { PageProps } from './$types';

    let { data = $bindable() }: PageProps = $props();
    let contact = $state(data.contact);
    let phoneNumbers = $state(data.phone_numbers);
</script>

<input type="hidden" name="contact_id" bind:value={contact.id} />
<label>
    Име:
    <input type="text" name="first_name" bind:value={contact.first_name} />
</label>
<br>
<label>
    Фамилия:
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
<label>Бележки:</label>
<textarea name="notes" bind:value={contact.notes}></textarea>