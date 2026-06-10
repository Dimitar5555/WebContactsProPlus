<script lang="ts">
    import ExternalNavigation from "$lib/components/ExternalNavigation.svelte";
    import ToastPanel from "$lib/components/ToastPanel.svelte";
    import { ToastStore } from "$lib/state/toasts.svelte";
    import { _ } from 'svelte-i18n';

    let email: string = $state('');    
    let username: string = $state('');
    let password: string = $state('');
    let toastStore = new ToastStore();

    function validateForm(): boolean {
        if (!email || !username || !password) {
            toastStore.add('register.validation_error', 'warning');
            return false;
        }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toastStore.add('register.email_invalid_error', 'warning');
            return false;
        }
        if(password.length < 8) {
            toastStore.add('register.password_length_error', 'warning');
            return false;
        }
        if(username.length < 3 || username.length > 20) {
            toastStore.add('register.username_length_error', 'warning');
            return false;
        }
        if(/^[a-zA-Z0-9_]+$/.test(username) === false) {
            toastStore.add('register.username_invalid_error', 'warning');
            return false;
        }
        return true;
    }

    async function submitRegisterForm(event: Event) {
        event.preventDefault();
        if(!validateForm()) {
            return;
        }
        const url = '/api/v1/register';
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ email, username, password }),
        });
        const data = await res.json();
        toastStore.add(data.message, res.ok ? 'success' : 'error');
    }
</script>

<ExternalNavigation />

<div class="d-flex align-items-center justify-content-center h-100">
    <form class="border border-3 py-2 px-3 rounded shadow bg-light" onsubmit={submitRegisterForm}>
        <h2 class="text-center mb-4">{$_('register.title')}</h2>
        <div class="form-group mb-3">
            <label for="email" class="form-label">{$_('register.email')}</label>
            <input type="text" id="email" bind:value={email} class="form-control">
        </div>
        <div class="form-group mb-3">
            <label for="username" class="form-label">{$_('register.username')}</label>
            <input type="text" id="username" bind:value={username} class="form-control">
        </div>
        <div class="form-group mb-3">
            <label for="password" class="form-label">{$_('register.password')}</label>
            <input type="password" id="password" bind:value={password} class="form-control">
        </div>
        <div class="text-center">
            <input type="submit" value="{$_('register.submit')}" class="btn btn-primary">
        </div>
        <p class="mt-3 text-muted text-center">{$_('register.already_have_account')} <a href="/login">{$_('register.login_link')}</a></p>
    </form>
</div>
<ToastPanel data={toastStore} />
