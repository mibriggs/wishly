import type { SubmitFunction } from '@sveltejs/kit';
import toast from 'svelte-french-toast';
import type { z } from 'zod';

interface FormHandlerOptions<T> {
	onStart?: (formData: FormData) => void;
	onSuccess?: (data: T) => void | Promise<void>;
	onNavigate?: () => void;
	onError?: () => void;
	successSchema?: z.ZodSchema;
	loadingMessage?: string;
	successMessage?: string;
	errorMessage?: string;
	redirectMessage?: string;
	invalidateAll?: boolean;
	resetForm?: boolean;
}

export function createFormHandler<T>({
	onStart,
	onSuccess,
	onError,
	onNavigate,
	successSchema = undefined,
	loadingMessage = 'Loading...',
	successMessage = 'Success!',
	errorMessage = 'An error occurred',
	redirectMessage = 'Redirecting...',
	invalidateAll = true,
	resetForm = true
}: FormHandlerOptions<T>): SubmitFunction {
	return ({ formData }) => {
		if (onStart) onStart(formData);

		const loadingId = toast.loading(loadingMessage);

		return async ({ update, result }) => {
			if (result.type === 'success') {
				if (successSchema && onSuccess) {
					const maybeItem = successSchema.safeParse(result.data);
					if (maybeItem.success) {
						await onSuccess(maybeItem.data);
						toast.success(successMessage, { id: loadingId });
					} else {
						toast.error('An error occurred', { id: loadingId });
					}
				} else {
					toast.error('An error occurred', { id: loadingId });
				}
			} else if (result.type === 'error' || result.type === 'failure') {
				invalidateAll = true;
				if (onError) {
					await onError();
				}
				toast.error(errorMessage, { id: loadingId });
			} else {
				if (onNavigate) {
					await onNavigate();
				}
				toast(redirectMessage, { id: loadingId });
			}
			await update({ reset: resetForm, invalidateAll });
		};
	};
}
