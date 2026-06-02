<script lang="ts">
    import ExternalNavigation from "$lib/components/ExternalNavigation.svelte";
    import MessageBox from "$lib/components/MessageBox.svelte";
    import { _ } from 'svelte-i18n';

    let email: string = $state('');    
    let username: string = $state('');
    let password: string = $state('');
    let message: Message = $state({ text: null, type: '' });

    function submitRegisterForm(event: Event) {
        event.preventDefault();
        const url = '/api/v1/register';
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            message = { text: data.message, type: data.success ? 'success' : 'error' };
        })
        .catch(error => {
            message = { text: 'Възникна грешка при регистрацията. Моля, опитайте отново. Грешка: ' + error.message, type: 'error' };
        });
    }
</script>

<ExternalNavigation />

<div class="d-flex align-items-center justify-content-center h-100">
    <form class="border border-3 py-2 px-3 rounded shadow bg-light" onsubmit={submitRegisterForm}>
        <h2 class="text-center">{$_('register.title')}</h2>
        <MessageBox message={message} />
        <div class="form-group mb-3">
            <label for="email" class="form-label">{$_('register.email')}</label>
            <input type="email" name="email" required bind:value={email} class="form-control">
        </div>
        <div class="form-group mb-3">
            <label for="username" class="form-label">{$_('register.username')}</label>
            <input type="text" name="username" required bind:value={username} class="form-control">
        </div>
        <div class="form-group mb-3">
            <label for="password" class="form-label">{$_('register.password')}</label>
            <input type="password" name="password" required bind:value={password} class="form-control">
        </div>
        <input type="submit" value="{$_('register.submit')}" class="btn btn-primary">
        <p class="mt-3 text-muted text-center">{$_('register.already_have_account')} <a href="/login">{$_('register.login_link')}</a></p>
    </form>
</div>
