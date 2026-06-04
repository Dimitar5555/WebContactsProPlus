import { _ } from 'svelte-i18n';
import { get } from 'svelte/store';

export const $_ = get(_);

// Workaround for https://github.com/kaisermann/svelte-i18n/issues/269
