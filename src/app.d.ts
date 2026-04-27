// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
enum userRole { USER, ADMIN };

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: number;
				role: userRole;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
