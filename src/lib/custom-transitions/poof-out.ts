import { cubicOut } from 'svelte/easing';
import type { EasingFunction } from 'svelte/transition';

// NOTE: To future me this was written entirely with claude ai I do not understand this
interface PoofOutParams {
	duration?: number;
	delay?: number;
}

interface TransitionReturn {
	delay: number;
	duration: number;
	easing: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
	onDestroy?: () => void;
}

// Poof out transition with JavaScript animation for more control
export function poofOut(
	node: HTMLElement,
	{ duration = 600, delay = 0 }: PoofOutParams = {}
): TransitionReturn {
	let poofElement: HTMLDivElement | null = null;
	let timeoutId: number | null = null;

	// Set transform origin to center (matching original CSS)
	node.style.transformOrigin = 'center';

	// Create the poof element immediately - this is key for the smoky effect!
	poofElement = document.createElement('div');
	poofElement.className = 'poof-effect';
	poofElement.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  `;
	node.appendChild(poofElement);

	return {
		delay,
		duration,
		easing: cubicOut,
		tick: (t: number, u: number): void => {
			const scale: number = t;
			const rotation: number = u * 180;

			// Apply main card transform
			node.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
			node.style.opacity = t.toString();

			// Update poof effect to match original CSS ::before behavior
			if (poofElement) {
				// This matches the original CSS: opacity peaks at middle, scale grows as u increases
				const poofOpacity: number = u < 0.5 ? u * 2 : (1 - u) * 2; // Peak at 50%, fade out
				const poofScale: number = u * 1.5; // Scale from 0 to 1.5 as animation progresses

				poofElement.style.opacity = poofOpacity.toString();
				poofElement.style.transform = `translate(-50%, -50%) scale(${poofScale})`;
			}
		},

		onDestroy: (): void => {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
			if (poofElement && poofElement.parentNode) {
				poofElement.remove();
			}
		}
	};
}
