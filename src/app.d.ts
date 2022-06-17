/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	interface Locals {
		userId: string
	}

	// interface Platform {}

	interface Session {
		sessionId: string
	}

	// interface Stuff {}
}
