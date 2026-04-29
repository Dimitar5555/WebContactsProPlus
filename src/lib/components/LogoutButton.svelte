<script>
    import { page } from '$app/state';
    function logout() {
        document.cookie = 'token=; Max-Age=0; path=/';
        window.location.href = '/login';
    }
    let username = $derived(page.data.username);
</script>
Вие сте влезли като {username}. <br>
<button onclick={logout}>Изход</button>
