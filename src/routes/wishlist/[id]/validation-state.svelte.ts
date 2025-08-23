import { newItemSchema } from '$lib/schema';
import { z } from 'zod';

const validationErrorsSchema = z.object({
	itemCost: z.string().array().optional(),
	itemName: z.string().array().optional(),
	itemUrl: z.string().array().optional(),
	itemQuantity: z.string().array().optional()
});
interface ValidationState {
	nameError: string | undefined;
	urlError: string | undefined;
	quantityError: string | undefined;
	costError: string | undefined;

	disabled: boolean;

	validateName: (name: string) => void;
	validateUrl: (url: string) => void;
	validateCost: (cost: number | undefined) => void;
	updateErrors: (errorDetails: Record<string, any>) => void;
	reset: () => void;
}

export class ValidationStateClass implements ValidationState {
	nameError: string | undefined = $state(undefined);
	urlError: string | undefined = $state(undefined);
	quantityError: string | undefined = $state('');
	costError: string | undefined = $state(undefined);

	disabled: boolean = $derived.by(() => {
		const hasNameError: boolean = this.nameError === undefined || this.nameError !== '';
		const hasUrlError: boolean = this.urlError === undefined || this.urlError !== '';
		const hasCountError: boolean = this.quantityError === undefined || this.quantityError !== '';
		const hasPriceError: boolean = this.costError === undefined || this.costError !== '';

		return hasNameError || hasUrlError || hasCountError || hasPriceError;
	});

	validateName(name: string) {
		const itemNameSchema = newItemSchema.shape.itemName;
		const result = itemNameSchema.safeParse(name);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			this.nameError = error;
		} else {
			this.nameError = '';
		}
	}

	validateUrl(url: string) {
		console.log(url);
		const itemUrlSchema = newItemSchema.shape.itemUrl;
		const result = itemUrlSchema.safeParse(url);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			this.urlError = error;
		} else {
			this.urlError = '';
		}
	}

	validateCost(cost: number | undefined) {
		const itemCostSchema = newItemSchema.shape.itemCost;
		const result = itemCostSchema.safeParse(cost);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			this.costError = error;
		} else {
			this.costError = '';
		}
	}

	updateErrors(errorDetails: Record<string, any>) {
		const maybeErrors = validationErrorsSchema.safeParse(errorDetails);
		if (maybeErrors.success) {
			const errors = maybeErrors.data;
			if (errors.itemCost) {
				this.costError = errors.itemCost.join('. ');
			}
			if (errors.itemName) {
				this.nameError = errors.itemName.join('. ');
			}
			if (errors.itemUrl) {
				this.urlError = errors.itemUrl.join('. ');
			}
			if (errors.itemQuantity) {
				this.quantityError = errors.itemQuantity.join('. ');
			}
		}
	}

	reset() {
		this.nameError = undefined;
		this.urlError = undefined;
		this.quantityError = '';
		this.costError = undefined;
	}
}
