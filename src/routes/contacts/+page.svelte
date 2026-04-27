<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<h1>Моите контакти</h1>

<table>
    <thead>
        <tr>
            <th>Име</th>
            <th>Имейл</th>
            <th>Телефон</th>
        </tr>
    </thead>
    <tbody>
        {#each data.contacts as contact}
            <tr>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
            </tr>
        {/each}
    </tbody>
</table>

{#if data.contacts.length === 0}
    <p>Няма контакти. Започнете да добавяте!</p>
{/if}
