import { scale } from 'svelte/transition';

export function maybeScale(
	node: Element,
	params: { enabled?: boolean } & Parameters<typeof scale>[1]
) {
	if (!params?.enabled) return { duration: 0 };
	const { enabled, ...rest } = params;
	return scale(node, rest);
}
