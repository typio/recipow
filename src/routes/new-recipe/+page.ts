import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// if not logged in redirect to home page
export const load: PageLoad = async ({ parent }) => {
	if (!(await parent()).user) {
		throw redirect(302, '/');
	}
}
