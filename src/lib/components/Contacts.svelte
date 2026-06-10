<script lang="ts">
    import "$lib/assets/contacts.css";
    import { _ } from "svelte-i18n";
    import { ContactStore } from "$lib/state/contacts.svelte";

    let { store }: { store: ContactStore } = $props();
    let searchQuery: string = $state('');
    let filteredContacts = $derived(store.contacts.filter(contact => {
        return searchQuery === "" ||
            `${contact.first_name} ${contact.last_name}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
    }));
    // https://svelte.dev/playground/6fb90919e24942b2b47d9ad154386b0c?version=5.56.0
    // pos is cursor position when right click occur
    let pos = { x: 0, y: 0 }
    // menu is dimension (height and width) of context menu
    let menu = { h: 0, w: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, w: 0 }
    // showMenu is state of context-menu visibility
    let showMenu = $state(false);
    let menuItems = [
        {
            'name': 'view',
            'onClick': () => window.location.href = `/contacts/${currentContactId}`,
            'displayText': $_('contacts.actions.view'),
            'class': 'bi bi-eye-fill'
        },
        {
            'name': 'edit',
            'onClick': () => window.location.href = `/contacts/${currentContactId}/edit`,
            'displayText': $_('contacts.actions.edit'),
            'class': 'bi bi-pencil-square'
        },
        {
            'name': 'favourite',
            'onClick': () => handleFavourite(),
            'displayTextFunction': (contact: Contact) => contact.is_favourite ? $_('contacts.actions.unfavourite') : $_('contacts.actions.favourite'),
            'displayText': false,
            'class': 'bi bi-heart-fill'
        },
        {
            'name': 'hr',
        },
        {
            'name': 'trash',
            'onClick': () => handleDelete(),
            'displayText': $_('contacts.actions.delete'),
            'class': 'bi bi-trash3-fill'
        }
    ];
    let currentContactId: number = $state(0);
    async function handleFavourite() {
        await store.toggleFav(currentContactId);
    }
    async function handleDelete() {
        await store.delete(currentContactId);
    }
    function rightClickContextMenu(e: MouseEvent) {
        e.preventDefault();
        currentContactId = parseInt((e.currentTarget as HTMLAnchorElement).dataset.contactId!);
        showMenu = true;
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        pos = {
            x: e.clientX,
            y: e.clientY
        };
        // If bottom part of context menu will be displayed
        // after right-click, then change the position of the
        // context menu. This position is controlled by `top` and `left`
        // at inline style. 
        // Instead of context menu is displayed from top left of cursor position
        // when right-click occur, it will be displayed from bottom left.
        if (browser.h -  pos.y < menu.h)
            pos.y = pos.y - menu.h
        if (browser.w -  pos.x < menu.w)
            pos.x = pos.x - menu.w
    }
    function onPageClick(e: MouseEvent){
        // To make context menu disappear when
        // mouse is clicked outside context menu
        showMenu = false;
    }

    function getContextMenuDimension(node: HTMLElement) {
        // This function will get context menu dimension
        // when navigation is shown => showMenu = true
        let height = node.offsetHeight
        let width = node.offsetWidth
        menu = {
            h: height,
            w: width
        }
    }
</script>

{#if showMenu}
<nav use:getContextMenuDimension style="position: absolute; top:{pos.y}px; left:{pos.x}px">
    <div class="right-click-menu">
        <ul>
            {#each menuItems as item}
                {#if item.name == "hr"}
                    <hr>
                {:else}
                <li>
                    <button onclick={item.onClick} data-name={item.name}>
                        <i class={item.class}></i>
                        {#if item.displayTextFunction}
                            {item.displayTextFunction(store.contacts.find(c => c.id === currentContactId)!)}
                        {:else if item.displayText}
                            {item.displayText}
                        {/if}
                    </button>
                </li>
                {/if}
            {/each}
        </ul>
    </div>
</nav>
{/if}

<input type="text" placeholder={$_('contacts.search')} bind:value={searchQuery} class="form-control mb-3" />
{#if filteredContacts.length > 0}
    <div>
        {#each filteredContacts as contact}
            <a
                href={`/contacts/${contact.id}`}
                class="contact-item d-flex justify-content-between"
                oncontextmenu={rightClickContextMenu}    
                data-contact-id={contact.id}
            >
                <span>
                    {#if contact.photo_url}
                        <img src={'/api/v1/photos/thumb_' + contact.photo_url} class="rounded-circle me-2 contact-photo-thumb" />
                    {:else}
                        <div class="rounded-circle me-2 d-inline-block text-center align-middle contact-photo-thumb contact-photo-placeholder">
                            <i class="bi bi-person-fill"></i>
                        </div>
                    {/if}
                    {contact.first_name} {contact.last_name}
                </span>
                <span>
                    {#if contact.is_favourite}
                    <i class="bi bi-heart-fill"></i>
                    {/if}
                </span>
            </a>
        {/each}
    </div>
{:else if searchQuery.length > 0}
    <div>{$_('contacts.no_results')}</div>
{:else}
    <div>{$_('contacts.no_contacts')}</div>
{/if}

<svelte:window onclick={onPageClick} />