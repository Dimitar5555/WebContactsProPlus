import { browser } from '$app/environment'
import { defaultLocale } from '$lib/i18n'
import { locale, waitLocale } from 'svelte-i18n'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async () => {
	if (browser) {
		const lang = window.document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1]
		locale.set(lang || defaultLocale)
	}
	await waitLocale()
}
