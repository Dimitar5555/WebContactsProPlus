<script lang="ts">
	// import favicon from '$lib/assets/favicon.svg';
 	import 'bootstrap/dist/css/bootstrap.css';
    import scriptSrc from 'bootstrap/dist/js/bootstrap.bundle.js?url';
	import 'bootstrap-icons/font/bootstrap-icons.css';


	let { children } = $props();
</script>

<svelte:head>
	<!-- <link rel="icon" href={favicon} /> -->
	<script src={scriptSrc}></script>
</svelte:head>

{@render children()}
