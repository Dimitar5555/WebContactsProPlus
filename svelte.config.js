import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true
    },
    kit: {
        adapter: adapter({
            options: {
                // Increase body size limit to allow image uploads larger than the
                // SvelteKit default (512KB). Match service limit (5MB) with some headroom.
                bodySizeLimit: '6MB'
            }
        }),
    }
};

export default config;
