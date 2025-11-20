<script lang="ts">
	interface Props {
		min?: number;
		max?: number;
		value: number;
		interval?: number | undefined;
		speed?: number;
		velocity?: number;
	}

	let {
		min: minNumber = 1,
		max: maxNumber = 99,
		value = $bindable(),
		interval,
		speed = 300,
		velocity = 0
	}: Props = $props();

	const digitCount = $derived(String(maxNumber).length);
	const digits = $derived(String(value).padStart(digitCount, '0').split('').map(Number));

	function vibrate() {
		if (navigator.vibrate) navigator.vibrate(50);
	}

	const increment = () => startChange(1);
	const decrement = () => startChange(-1);

	const startChange = (delta: number) => {
		updateNumber(delta);
		speed = 300;
		velocity = 2;
		vibrate();

		interval = setInterval(() => {
			updateNumber(delta);
			speed = Math.max(50, speed * 0.85);
			velocity = Math.min(10, velocity * 1.2);
			clearInterval(interval);
			interval = setInterval(() => updateNumber(delta), speed as number) as unknown as number;
		}, speed) as unknown as number;
	};

	const stopChange = () => {
		clearInterval(interval);
		velocity = Math.max(0, velocity - 5);
		if (velocity > 0) {
			requestAnimationFrame(() => smoothMomentum());
		}
	};

	function smoothMomentum() {
		if (velocity > 0) {
			updateNumber(velocity > 5 ? 1 : -1);
			velocity *= 0.9;
			if (velocity > 0.5) {
				requestAnimationFrame(() => smoothMomentum());
			}
		}
	}

	function updateNumber(delta: number) {
		value = Math.min(maxNumber, Math.max(minNumber, value + delta));
	}
</script>

{#snippet adjuster(
	displayValue: string,
	isDisabled: boolean,
	handleStart: () => void,
	handleEnd: () => void
)}
	<button
		onpointerdown={handleStart}
		onpointerup={handleEnd}
		onpointerleave={handleEnd}
		class="cursor-pointer select-none rounded-md border-2 border-black px-3 py-2 shadow-md transition-transform duration-100 ease-in-out active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:bg-neutral-300 disabled:text-neutral-500"
		type="button"
		disabled={isDisabled}>{@html displayValue}</button
	>
{/snippet}

<div class="flex items-center gap-2 font-mono text-2xl" aria-live="polite">
	{@render adjuster('&#8722;', value === minNumber, decrement, stopChange)}

	<div class="flex select-none justify-center overflow-hidden">
		{#each digits as digit}
			<div class="h-10 overflow-hidden">
				<div
					class="flex flex-col transition-transform duration-500 ease-custom"
					style="transform: translateY(calc(-10% * {digit}));"
				>
					{#each Array(10)
						.fill(0)
						.map((_, i) => i) as num}
						<div class="flex h-10 items-center justify-center">{num}</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{@render adjuster('&#x2b;', value === maxNumber, increment, stopChange)}
</div>
