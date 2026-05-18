<script lang="ts">
    import ExternalNavigation from "$lib/components/ExternalNavigation.svelte";
    import MessageBox from "$lib/components/MessageBox.svelte";

    let successMessage: string = $state('');
    let errorMessage: string = $state('');

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
            submitLoginForm();
        }
    }

    function submitLoginForm() {
        if (!username || !password) {
            errorMessage = 'Моля, въведете потребителско име и парола';
            successMessage = '';
            return;
        }
        const url = '/api/v1/login';
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
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

    function clearMessages() {
        message = null;
    }
</script>

<ExternalNavigation />

<form>
    <label for="username">Потребител:</label>
    <input type="text" name="username" required bind:value={username}>
    <br>
    <label for="password">Парола:</label>
    <input type="password" name="password" required bind:value={password}>
    <br>
    <button type="button" onclick={submitLoginForm}>Влез</button>
    <button type="button" onclick={() => loginAs('user1')}>Влез като user1</button>
    <button type="button" onclick={() => loginAs('user2')}>Влез като user2</button>
        <MessageBox message={message} messageType={messageType} />
</form>
