<script>
    import { page } from '$app/state';
    async function logout() {
        await fetch('/api/v1/logout', {
            method: 'GET'
        });
        window.location.href = '/login';
    }
    let username = $derived(page.data.username);
</script>
Вие сте влезли като {username}. <br>
<button onclick={logout}>Изход</button>
