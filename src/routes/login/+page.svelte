<script lang="ts">
    import ExternalNavigation from "$lib/components/ExternalNavigation.svelte";
    import MessageBox from "$lib/components/MessageBox.svelte";
    import { _ } from 'svelte-i18n';

    let message: string | null = $state(null);
    let messageType: string = $state('');
    let submitBtn: HTMLButtonElement;

    let username: string = $state('');
    let password: string = $state('');

    function loginAs(userToLogin: string) {
        const users = [
            { username: 'user1', password: 'password1' },
            { username: 'user2', password: 'password2' }
        ];
        const user = users.find(u => u.username === userToLogin);
        if(user) {
            username = user.username;
            password = user.password;
            // wait for the state to settle and then submit the form
            setTimeout(() => {
                submitBtn.click();
            }, 50);
        }
    }

    async function submitLoginForm(event: Event) {
        event.preventDefault();
        const url = '/api/v1/login';
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        try {
            const result = await fetch(url, {
                method: 'POST',
                body: formData
            })

            const data = await result.json();
            message = data.message;
            messageType = data.success ? 'success' : 'error';
            if (data.success) {
                setTimeout(() => {
                    window.location.href = '/contacts';
                }, 1000);
            }
        }
        catch (error) {
            message = 'Грешка при влизане. Моля, опитайте отново.';
            messageType = 'error';
        }
    }

    function clearMessage() {
        message = null;
    }
</script>

<ExternalNavigation />

<div class="d-flex align-items-center justify-content-center h-100">
    <form class="border border-3 py-2 px-3 rounded shadow bg-light" onsubmit={submitLoginForm}>
        <h2 class="text-center">{$_('login.title')}</h2>
        <MessageBox message={message} messageType={messageType} />
        <div class="form-group mb-3">
            <label for="username" class="form-label">{$_('login.username')}</label>
            <input 
            type="text"
            name="username"
            required
            bind:value={username}
            onkeyup={clearMessage}
            class="form-control"
            >
        </div>
        <div class="form-group mb-3">
            <label for="password" class="form-label">{$_('login.password')}</label>
            <input 
            type="password"
            name="password"
            required
            bind:value={password}
            onkeyup={clearMessage}
            class="form-control"
            >
        </div>
        <button class="btn btn-primary" type="submit" bind:this={submitBtn}>
            <i class="bi bi-box-arrow-in-right"></i>
            {$_('login.submit')}
        </button>
        <div class="btn-group" role="group">
            <button 
                class="btn btn-outline-secondary"
                type="button"
                onclick={() => loginAs('user1')}
                >
                {$_('login.loginAsUser1')}
            </button>
            <button
                class="btn btn-outline-secondary"
                type="button"
                onclick={() => loginAs('user2')}
                >
                {$_('login.loginAsUser2')}
            </button>
        </div>
        <p class="mt-3 text-muted text-center">{$_('login.registerPrompt')} <a href="/register">{$_('login.registerLink')}</a></p>
    </form>
</div>
