<script lang="ts">
    import { deserialize } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { locale, _ } from 'svelte-i18n';

    let isChangingLang = $state(false);

    // Reactively look up the active language directly from svelte-i18n store
    let currentLocale = $derived($locale || 'en');

    async function changeLanguage(newLocale: string) {
        if (isChangingLang || newLocale === currentLocale) return;
        isChangingLang = true;

        const formData = new FormData();
        formData.append('locale', newLocale);

        const response = await fetch('/?/setLanguage', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());

        if (result.type === 'success') {
            locale.set(newLocale);
            await invalidateAll();
        }

        isChangingLang = false;
    }
</script>

<div class="dropdown">
    <!-- Main Dropdown Toggle Button -->
    <button 
        class="btn btn-white border shadow-sm dropdown-toggle d-flex align-items-center gap-2 fw-medium text-dark dropdown-capsule" 
        type="button" 
        id="languageDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        disabled={isChangingLang}
    >
        {#if isChangingLang}
            <span class="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>
        {:else if currentLocale === 'bg'}
            <span>🇧🇬</span> <span class="d-none d-sm-inline">Български</span>
        {:else}
            <span>🇬🇧</span> <span class="d-none d-sm-inline">English</span>
        {/if}
    </button>

    <!-- Dropdown Options Menu -->
    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2" aria-labelledby="languageDropdown">
        <li>
            <h6 class="dropdown-header small text-uppercase tracking-wider fw-bold text-muted px-3 pt-2 pb-1">
                {$_('navigation.select_language')}
            </h6>
        </li>
        <li>
            <button 
                class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 fw-medium" 
                class:active={currentLocale === 'en'}
                type="button" 
                onclick={() => changeLanguage('en')}
            >
                <span class="fs-5">🇬🇧</span> English
                {#if currentLocale === 'en'}
                    <i class="bi bi-check-lg ms-auto text-primary"></i>
                {/if}
            </button>
        </li>
        <li>
            <button 
                class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 fw-medium" 
                class:active={currentLocale === 'bg'}
                type="button" 
                onclick={() => changeLanguage('bg')}
            >
                <span class="fs-5">🇧🇬</span> Български
                {#if currentLocale === 'bg'}
                    <i class="bi bi-check-lg ms-auto text-primary"></i>
                {/if}
            </button>
        </li>
    </ul>
</div>

<style>
    /* Premium visual polish to make it match your cards */
    .dropdown-capsule {
        border-radius: 8px;
        transition: all 0.15s ease-in-out;
        background-color: #fff;
    }

    .dropdown-capsule:hover:not(:disabled) {
        background-color: #f8fafc;
        border-color: #cbd5e1;
    }

    /* Tracking for header label */
    .tracking-wider {
        letter-spacing: 0.05em;
        font-size: 0.75rem;
    }

    /* Style tweak for Bootstrap's active items to match modern design specs */
    :global(.dropdown-item.active) {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
    }
    
    :global(.dropdown-item:hover:not(.active)) {
        background-color: #f8fafc;
    }
</style>