<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { twMerge } from 'tailwind-merge';

	export interface AddressData {
		streetAddress: string;
		addressLine2: string;
		city: string;
		state: string;
		zipCode: string;
	}

	interface Props {
		onAddressSelect?: (address: AddressData) => void;
		containerClass?: string;
		streetClass?: string;
		apartmentClass?: string;
		cityRowClass?: string;
		cityClass?: string;
		stateClass?: string;
		zipClass?: string;
	}

	let {
		onAddressSelect,
		containerClass = '',
		streetClass = '',
		apartmentClass = '',
		cityRowClass = '',
		cityClass = '',
		stateClass = '',
		zipClass = ''
	}: Props = $props();

	let streetElement: HTMLInputElement | undefined = $state();
	let mapboxInitialized = false;

	// Initialize Mapbox Address Autofill when the street input becomes available
	$effect(() => {
		if (!browser || mapboxInitialized || !streetElement) return;

		mapboxInitialized = true;

		(async () => {
			const { MapboxAddressAutofill } = await import('@mapbox/search-js-web');

			const autofillElement = new MapboxAddressAutofill();
			autofillElement.accessToken = PUBLIC_MAPBOX_TOKEN;
			autofillElement.options = {
				country: 'us'
			};

			// Get the parent div that contains all address inputs
			const addressDiv = streetElement.parentElement;
			if (!addressDiv) return;

			// Copy classes from the div to preserve styling
			autofillElement.className = addressDiv.className;

			// Move all children (including the span wrapper) to preserve structure
			while (addressDiv.firstChild) {
				autofillElement.appendChild(addressDiv.firstChild);
			}

			// Replace the div with the autofill element
			addressDiv.replaceWith(autofillElement as unknown as Node);

			// Listen for address selection if callback provided
			if (onAddressSelect) {
				autofillElement.addEventListener('retrieve', (event: Event) => {
					const customEvent = event as CustomEvent;
					const featureCollection = customEvent.detail;

					// The detail is a FeatureCollection, get the first feature
					const feature = featureCollection?.features?.[0];

					if (feature?.properties) {
						const props = feature.properties;
						const addressData: AddressData = {
							streetAddress: props.address_line1 || '',
							addressLine2: props.address_line2 || '',
							city: props.address_level2 || '',
							state: props.address_level1 || '',
							zipCode: props.postcode || ''
						};

						onAddressSelect(addressData);
					}
				});
			}
		})();
	});
</script>

<form>
	<div class={twMerge('mb-4 flex w-full flex-col gap-3', containerClass)}>
		<input
			bind:this={streetElement}
			type="text"
			placeholder="Street Address"
			autocomplete="address-line1"
			class={twMerge('w-full rounded-md border-2 p-2 md:w-3/4 lg:w-1/2', streetClass)}
		/>
		<input
			type="text"
			placeholder="Apartment, suite, etc. (optional)"
			autocomplete="address-line2"
			class={twMerge('w-full rounded-md border-2 p-2 md:w-3/4 lg:w-1/2', apartmentClass)}
		/>
		<span class={twMerge('flex w-full items-center gap-2 md:w-3/4 md:gap-4 lg:w-1/2', cityRowClass)}>
			<input
				type="text"
				placeholder="City"
				autocomplete="address-level2"
				class={twMerge('min-w-0 flex-1 rounded-md border-2 p-2', cityClass)}
			/>
			<input
				type="text"
				placeholder="State"
				autocomplete="address-level1"
				class={twMerge('w-16 rounded-md border-2 p-2 md:w-20', stateClass)}
			/>
			<input
				type="text"
				placeholder="Zip Code"
				autocomplete="postal-code"
				class={twMerge('w-20 rounded-md border-2 p-2 md:w-28', zipClass)}
			/>
		</span>
	</div>
</form>
