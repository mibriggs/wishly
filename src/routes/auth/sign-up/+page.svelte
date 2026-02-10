<script>
	import { ChevronRight } from 'lucide-svelte';
	import OauthProviders from '$lib/components/oauth-providers.svelte';
	import { createUserFromEmail } from './data.remote';
	import ErrorMessage from '$lib/components/error-message.svelte';
	import { signUpWithEmailSchema } from '$lib/schema';
</script>

<main class="flex w-screen items-center justify-center">
	<div
		class="mt-20 flex w-11/12 flex-col gap-5 rounded-md border-2 p-4 shadow-md md:w-3/5 xl:w-2/5"
	>
		<div class="flex flex-col items-center justify-center">
			<p class="text-center text-xl font-bold">Create your account</p>
			<p class="text-center text-sm text-gray-500">
				Welcome! Please fill in the details to get started
			</p>
		</div>

		<OauthProviders />

		<div class="flex items-center justify-center gap-2">
			<hr class="w-[45%] border" />
			<p class="text-gray-400">or</p>
			<hr class="w-[45%] border" />
		</div>

		<form {...createUserFromEmail.preflight(signUpWithEmailSchema)}>
			<div class="flex flex-col justify-center gap-2">
				<div class="flex flex-col gap-1">
					<label for="username" class="font-bold">Username</label>
					<input
						{...createUserFromEmail.fields.username.as('text')}
						type="text"
						id="username"
						placeholder="Enter your username"
						class="rounded-md border-2 p-1"
					/>
					{#each createUserFromEmail.fields.username.issues() as issue}
						<ErrorMessage message={issue.message} />
					{/each}
				</div>

				<div class="flex flex-col gap-1">
					<label for="email-address" class="font-bold">Email address</label>
					<input
						{...createUserFromEmail.fields.email.as('email')}
						type="email"
						id="email-address"
						placeholder="Enter your email address"
						class="rounded-md border-2 p-1"
					/>
					{#each createUserFromEmail.fields.email.issues() as issue}
						<ErrorMessage message={issue.message} />
					{/each}
				</div>

				<div class="flex flex-col gap-1">
					<label for="password" class="font-bold">Password</label>
					<input
						{...createUserFromEmail.fields.password.as('password')}
						type="password"
						id="email-address"
						placeholder="Enter your password"
						class=" rounded-md border-2 p-1"
					/>
					{#each createUserFromEmail.fields.password.issues() as issue}
						<ErrorMessage message={issue.message} />
					{/each}
				</div>

				<button
					class="flex w-full items-center justify-center gap-2 rounded-md bg-black p-2 text-white"
				>
					<p>Continue</p>
					<ChevronRight size={16} />
				</button>
			</div>
		</form>

		<a class="flex w-fit gap-1 hover:underline" href="/auth/sign-in" data-sveltekit-preload-data>
			<p class="text-gray-500">Already have an account? <b class="text-black">Sign in</b></p>
		</a>
	</div>
</main>
