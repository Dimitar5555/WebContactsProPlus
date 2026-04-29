<script lang="ts">
    let { contacts }: { contacts: Contact[] } = $props();
    let searchQuery: string = $state('');
    let filteredContacts = $derived(
        contacts.map((contact) => ({
            ...contact,
            is_visible: 
                searchQuery === "" ||
                `${contact.first_name} ${contact.last_name}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        }))
    );
</script>

<input type="text" placeholder="Търсене..." bind:value={searchQuery} />
{#if filteredContacts.length > 0}
    <table>
        <tbody>
            {#each filteredContacts as contact}
                {#if contact.is_visible}
                    <tr>
                        <td>
                            <a href={`/contacts/${contact.id}`}>
                                {contact.first_name} {contact.last_name}
                            </a>
                        </td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
{:else}
    <p>Няма контакти. Започнете да добавяте!</p>
{/if}
