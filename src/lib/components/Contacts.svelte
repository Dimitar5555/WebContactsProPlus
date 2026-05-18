<script lang="ts">
    let { contacts }: { contacts: Contact[] } = $props();
    let searchQuery: string = $state('');
    let filteredContacts = $derived(
        contacts.filter((contact) => {
            return searchQuery === "" ||
                `${contact.first_name} ${contact.last_name}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        }));
</script>

<style>
    .contact-item {
        padding: 8px;
        border-bottom: 1px solid #ccc;
        cursor: pointer;
    }
    .contact-item {
        text-decoration: none;
        color: #333;
    }
    .contact-item:hover {
        background-color: #958b8b;
    }
</style>

<input type="text" placeholder="Търсене..." bind:value={searchQuery} class="form-control mb-3" />
{#if filteredContacts.length > 0}
    <div>
        {#each filteredContacts as contact}
            <a href={`/contacts/${contact.id}`} class="contact-item d-block">
                {contact.first_name} {contact.last_name}
            </a>
        {/each}
    </div>
{:else if searchQuery.length > 0}
    <div>Няма намерени контакти.</div>
{:else}
    <div>Няма контакти. Започнете да добавяте!</div>
{/if}
