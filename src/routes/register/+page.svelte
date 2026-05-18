<script lang="ts">
    import ExternalNavigation from "$lib/components/ExternalNavigation.svelte";
    import MessageBox from "$lib/components/MessageBox.svelte";

    let email: string = $state('');    
    let username: string = $state('');
    let password: string = $state('');
    let message: string | null = $state(null);
    let messageType: string = $state('');

    function submitRegisterForm() {
        const url = '/api/v1/register';
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            message = data.message;
            messageType = data.success ? 'success' : 'error';
        })
        .catch(error => {
            message = 'Възникна грешка при регистрацията. Моля, опитайте отново. Грешка: ' + error.message;
            messageType = 'error';
        });
    }
</script>

<ExternalNavigation />

<form>
    <label for="email">Имейл:</label>
    <input type="email" name="email" required bind:value={email}>
    <br>
    <label for="username">Потребител:</label>
    <input type="text" name="username" required bind:value={username}>
    <br>
    <label for="password">Парола:</label>
    <input type="password" name="password" required bind:value={password}>
    <br>
    <input type="button" value="Регистрация" onclick={submitRegisterForm}>
        <MessageBox message={message} messageType={messageType} />
</form>
