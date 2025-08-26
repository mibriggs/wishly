import { fade } from 'svelte/transition';

export function maybeFade(
	node: Element,
	params: { enabled?: boolean } & Parameters<typeof fade>[1]
) {
	if (!params?.enabled) return { duration: 0 };
	const { enabled, ...rest } = params;
	return fade(node, rest);
}
