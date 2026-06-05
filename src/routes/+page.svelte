<script lang="ts">
    import { _ } from 'svelte-i18n';
    import ExternalNavigation from "$lib/components/ExternalNavigation.svelte";
</script>

<ExternalNavigation />

<main class="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-light py-5">
    
    <!-- Hero Section -->
    <div class="text-center mb-5">
        <h1 class="display-3 fw-bold mb-3">{$_('home.title')}</h1>
        <p class="lead" style="color: rgba(255, 255, 255, 0.8);">
            {$_('home.lead')}
        </p>
    </div>

    <!-- Feature Highlights -->
    <div class="row g-4 mb-5 w-100 justify-content-center">
        <!-- I added the 'glass-card' class here -->
        <div class="col-md-3">
            <div class="glass-card p-4 text-center">
                <h5>🔒 {$_('home.feature_security')}</h5>
                <p class="small mb-0">{$_('home.feature_security_description')}</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="glass-card p-4 text-center">
                <h5>⚡ {$_('home.feature_speed')}</h5>
                <p class="small mb-0">{$_('home.feature_speed_description')}</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="glass-card p-4 text-center">
                <h5>☁️ {$_('home.feature_cloud')}</h5>
                <p class="small mb-0">{$_('home.feature_cloud_description')}</p>
            </div>
        </div>
    </div>

    <!-- Call to Action -->
    <div class="d-flex gap-3 mt-4">
        <a href="/register" class="btn btn-primary btn-lg px-5">{$_('navigation.register')}</a>
        <a href="/login" class="btn btn-outline-light btn-lg px-5">{$_('navigation.login')}</a>
    </div>
</main>

<style>
    .glass-card {
        /* Semi-transparent white background */
        background: rgba(255, 255, 255, 0.15);
        /* Frosted glass blur effect */
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        /* Subtle border to define the card */
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        color: white;
        transition: transform 0.3s ease;
    }

    .glass-card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.25);
    }
</style>
