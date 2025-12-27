import type { SubmitFunction } from '@sveltejs/kit';
import toast from 'svelte-french-toast';
import type { z } from 'zod';

interface ErrorOverrides {
	invalidateAll?: boolean;
	resetForm?: boolean;
}

interface BaseFormHandlerOptions {
	onStart?: (formData: FormData) => void;
	onNavigate?: () => void | Promise<void>;
	onError?: (
		errorData?: unknown
	) => void | Promise<void> | ErrorOverrides | Promise<ErrorOverrides>;
	loadingMessage?: string;
	successMessage?: string;
	errorMessage?: string;
	redirectMessage?: string;
	invalidateAll?: boolean;
	resetForm?: boolean;
}

interface FormHandlerOptionsWithSuccess<T> extends BaseFormHandlerOptions {
	onSuccess: (data: T) => void | Promise<void>;
	successSchema: z.ZodSchema;
}

interface FormHandlerOptionsWithoutSuccess extends BaseFormHandlerOptions {
	onSuccess?: never;
	successSchema?: never;
}

type FormHandlerOptions<T> = FormHandlerOptionsWithSuccess<T> | FormHandlerOptionsWithoutSuccess;

export function createFormHandler<T>({
	onStart,
	onSuccess,
	onError,
	onNavigate,
	successSchema,
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
		const formResetOptions: { invalidateAll: boolean; reset: boolean } = {
			invalidateAll,
			reset: resetForm
		};

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
					toast.success(successMessage, { id: loadingId });
				}
			} else if (result.type === 'error' || result.type === 'failure') {
				if (onError) {
					const errorResponse =
						result.type === 'failure' ? await onError(result.data) : await onError();
					if (errorResponse && typeof errorResponse === 'object') {
						if (errorResponse.resetForm !== undefined) {
							formResetOptions.reset = errorResponse.resetForm;
						}
						if (errorResponse.invalidateAll !== undefined) {
							formResetOptions.invalidateAll = errorResponse.invalidateAll;
						}
					}
				}

				// Check for errorCause in failure data and show specific message if available
				if (
					result.type === 'failure' &&
					result.data &&
					typeof result.data === 'object' &&
					'errorCause' in result.data &&
					typeof result.data.errorCause === 'string'
				) {
					toast.error(result.data.errorCause, { id: loadingId });
				} else {
					toast.error(errorMessage, { id: loadingId });
				}
			} else {
				if (onNavigate) {
					await onNavigate();
				}
				toast(redirectMessage, { id: loadingId });
			}
			await update({ ...formResetOptions });
		};
	};
}
