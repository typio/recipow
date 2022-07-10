/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	interface Locals {
		user: user
	}

	// interface Platform {}

	interface Session {
		user: user
	}

	// interface Stuff {}
}
