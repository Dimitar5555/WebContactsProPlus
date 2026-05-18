<script lang="ts">
    import { _ } from 'svelte-i18n';

    async function logout() {
        await fetch('/api/v1/logout', {
            method: 'GET'
        });
        window.location.href = '/login';
    }
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        <a class="navbar-brand" href="/">{$_('navigation.home')}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="/contacts">{$_('navigation.contacts')}</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/favourite-contacts">{$_('navigation.favourite_contacts')}</a>
                </li>
            </ul>
            <ul class="navbar-nav ms-auto">
                <li class="nav-item" role="button">
                    <a class="nav-link" onclick={logout}>{$_('navigation.exit')}</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
