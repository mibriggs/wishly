// NOTE: To future me this was written entirely with claude ai and chatgpt I do not understand this
import { cubicOut } from 'svelte/easing';

type Params = {
	duration?: number; // total time for the whole outro
	easing?: (t: number) => number;
	rotate?: number; // degrees to rotate while leaving (default 180)
	scaleTo?: number; // end scale (default 0)
	poof?: boolean; // show radial poof overlay
	poofScale?: number; // how big the poof expands (relative)
	collapseDelay?: number; // % of duration before height collapse starts (0..1)
	poofColor?: string; // center color for the poof effect
};

export function poofOut(
	node: HTMLElement,
	{
		duration = 500,
		easing = cubicOut,
		rotate = 180,
		scaleTo = 0,
		poof = true,
		poofScale = 1.5,
		collapseDelay = 0.82,
		poofColor = 'rgba(255,255,255,0.85)' // ✅ default if none supplied
	}: Params = {}
) {
	const style = getComputedStyle(node);
	const h = node.offsetHeight;
	const pt = parseFloat(style.paddingTop);
	const pb = parseFloat(style.paddingBottom);
	const mt = parseFloat(style.marginTop);
	const mb = parseFloat(style.marginBottom);
	const bt = parseFloat(style.borderTopWidth);
	const bb = parseFloat(style.borderBottomWidth);

	const originalTransformOrigin = style.transformOrigin;
	node.style.transformOrigin = '50% 50%';

	let poofEl: HTMLDivElement | null = null;
	let poofAnim: Animation | null = null;

	if (poof) {
		const rect = node.getBoundingClientRect();

		poofEl = document.createElement('div');
		poofEl.style.position = 'fixed';
		poofEl.style.left = `${rect.left + rect.width / 2}px`;
		poofEl.style.top = `${rect.top + rect.height / 2}px`;
		poofEl.style.width = `${Math.max(rect.width, rect.height) * 2}px`;
		poofEl.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
		poofEl.style.pointerEvents = 'none';
		poofEl.style.zIndex = '2147483647';
		poofEl.style.transform = 'translate(-50%, -50%) scale(0)';
		poofEl.style.background = `radial-gradient(circle, ${poofColor} 0%, transparent 70%)`; // ✅ customizable
		poofEl.style.borderRadius = '50%';
		document.body.appendChild(poofEl);

		poofAnim = poofEl.animate(
			[
				{ transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
				{ transform: `translate(-50%, -50%) scale(${poofScale})`, opacity: 0 }
			],
			{ duration: Math.min(duration, 600), easing: 'ease-out', fill: 'forwards' }
		);
		poofAnim.addEventListener('finish', () => {
			poofEl && poofEl.remove();
			poofEl = null;
		});
	}

	return {
		duration,
		easing,
		css: (tRaw: number) => {
			const t = 1 - tRaw;
			const collapseStart = collapseDelay;
			const collapseProgress = t <= collapseStart ? 0 : (t - collapseStart) / (1 - collapseStart);

			const scale = 1 + (scaleTo - 1) * t;
			const rot = rotate * t;
			const opacity = 1 - t;

			const heightPx = h * (1 - collapseProgress);
			const padTop = pt * (1 - collapseProgress);
			const padBottom = pb * (1 - collapseProgress);
			const marTop = mt * (1 - collapseProgress);
			const marBottom = mb * (1 - collapseProgress);
			const borderTop = bt * (1 - collapseProgress);
			const borderBottom = bb * (1 - collapseProgress);

			return `
        transform: scale(${scale}) rotate(${rot}deg);
        opacity: ${opacity};
        height: ${heightPx}px;
        padding-top: ${padTop}px;
        padding-bottom: ${padBottom}px;
        margin-top: ${marTop}px;
        margin-bottom: ${marBottom}px;
        border-top-width: ${borderTop}px;
        border-bottom-width: ${borderBottom}px;
        overflow: hidden;
      `;
		},
		// Cleanup
		done: () => {
			node.style.transformOrigin = originalTransformOrigin;
			if (poofEl) {
				poofAnim?.cancel();
				poofEl.remove();
				poofEl = null;
			}
		}
	};
}
