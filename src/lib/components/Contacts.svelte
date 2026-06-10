<script lang="ts">
    import "$lib/assets/contacts.css";
    import { goto } from '$app/navigation';
    import { _ } from "svelte-i18n";
    import { ContactStore } from "$lib/state/contacts.svelte";

    let { store, availableTags = [], selectedTagId = null, showOnlyFavourites = false }: { store: ContactStore; availableTags?: Tag[]; selectedTagId?: number | null; showOnlyFavourites?: boolean } = $props();
    let searchQuery: string = $state('');
    let filteredContacts = $derived(store.contacts.filter(contact => {
        return searchQuery === "" ||
            `${contact.first_name} ${contact.last_name}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
    }));

    function updateTagFilter(value: string) {
        const url = new URL(window.location.href);
        if(value) {
            url.searchParams.set('tag', value);
        }
        else {
            url.searchParams.delete('tag');
        }
        if(showOnlyFavourites) {
            url.searchParams.set('filter', 'favourites');
        }
        else {
            url.searchParams.delete('filter');
        }
        goto(`${url.pathname}${url.search}${url.hash}`);
    }
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

<div class="card border-0 shadow-sm rounded-4 p-3 mb-3">
    <div class="row g-2 align-items-end">
        <div class="col-12 col-md-7">
            <label class="form-label small fw-semibold" for="contactSearch">{$_('contacts.search')}</label>
            <input id="contactSearch" type="text" placeholder={$_('contacts.search')} bind:value={searchQuery} class="form-control" />
        </div>
        <div class="col-12 col-md-5">
            <label class="form-label small fw-semibold" for="tagFilter">{$_('contacts.filter_by_tag')}</label>
            <select
                class="form-select"
                id="tagFilter"
                bind:value={selectedTagId}
                onchange={(event) => updateTagFilter((event.currentTarget as HTMLSelectElement).value)}
            >
                <option value={0} selected>{$_('contacts.all_tags')}</option>
                {#each availableTags as tag}
                    <option value={tag.id}>{tag.label}</option>
                {/each}
            </select>
        </div>
    </div>
</div>
{#if filteredContacts.length > 0}
    <div>
        {#each filteredContacts as contact}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="contact-item d-flex justify-content-between"
                oncontextmenu={rightClickContextMenu}    
                data-contact-id={contact.id}
            >
                <a href={`/contacts/${contact.id}`} class="text-decoration-none text-reset flex-grow-1">
                    <div class="d-flex flex-row gap-1">
                        {#if contact.photo_url}
                            <!-- svelte-ignore a11y_missing_attribute -->
                            <img src={'/api/v1/photos/thumb_' + contact.photo_url} class="rounded-circle me-2 contact-photo-thumb" />
                        {:else}
                            <div class="rounded-circle me-2 d-inline-block text-center align-middle contact-photo-thumb contact-photo-placeholder">
                                <i class="bi bi-person-fill"></i>
                            </div>
                        {/if}
                        <div class="d-flex flex-column">
                            <span>{contact.first_name} {contact.last_name}</span>
                            <div>
                                {#if contact.tags && contact.tags.length > 0}
                                    <span class="tag-chip-row">
                                        {#each contact.tags as tag}
                                            <span class="contact-tag-chip" style={`background-color: ${tag.color};`}>{tag.label}</span>
                                        {/each}
                                    </span>
                                {/if}
                            </div>
                        </div>
                    </div>
                </a>
                <div class="d-flex align-items-center gap-2 ms-3">
                    {#if contact.is_favourite}
                        <i class="bi bi-heart-fill"></i>
                    {/if}
                    {#if store.tags.length > 0}
                        <details class="tag-picker-details">
                            <summary class="btn btn-sm btn-outline-secondary">{$_('contacts.tags.manage_title')}</summary>
                            <div class="tag-picker-popover shadow-sm">
                                {#each store.tags as tag}
                                    <button
                                        type="button"
                                        class:active={(contact.tags || []).some((item) => item.id === tag.id)}
                                        class="btn btn-sm btn-outline-secondary w-100 text-start mb-1"
                                        onclick={() => store.toggleTag(contact.id, tag.id)}
                                    >
                                        <span class="contact-tag-chip me-2" style={`background-color: ${tag.color};`}>{tag.label}</span>
                                        <i class={((contact.tags || []).some((item) => item.id === tag.id) ? 'bi bi-check2' : 'bi bi-plus')}></i>
                                    </button>
                                {/each}
                            </div>
                        </details>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
{:else if searchQuery.length > 0}
    <div>{$_('contacts.no_results')}</div>
{:else}
    <div>{$_('contacts.no_contacts')}</div>
{/if}

<svelte:window onclick={onPageClick} />