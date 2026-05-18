<script lang="ts">
    import { _ } from 'svelte-i18n';
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
                    <a class="nav-link" href="/">{$_('navigation.home')}</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/login">{$_('navigation.login')}</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/register">{$_('navigation.register')}</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
