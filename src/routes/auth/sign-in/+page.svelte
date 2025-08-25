<script>
	import { ChevronRight } from 'lucide-svelte';
	import googleLogo from '$lib/assets/google.svg';
	import githubLogo from '$lib/assets/github.svg';
	import discordLogo from '$lib/assets/discord.svg';
	import OauthProviders from '$lib/components/oauth-providers.svelte';
</script>

<main class="flex w-screen items-center justify-center">
	<div
		class="mt-20 flex w-11/12 flex-col gap-5 rounded-md border-2 p-4 shadow-md md:w-3/5 xl:w-2/5"
	>
		<div class="flex flex-col items-center justify-center">
			<p class="text-center text-xl font-bold">Sign in to Wantify</p>
			<p class="text-center text-sm text-gray-500">Welcome back! Please sign in to continue</p>
		</div>

		<OauthProviders />

		<div class="flex items-center justify-center gap-2">
			<hr class="w-[45%] border" />
			<p class="text-gray-400">or</p>
			<hr class="w-[45%] border" />
		</div>

		<div class="flex flex-col gap-1">
			<label for="email-address" class="font-bold">Email address</label>
			<input
				type="email"
				id="email-address"
				name="email-address"
				placeholder="Enter your email address"
				class=" rounded-md border-2 p-1"
			/>
		</div>

		<div class="flex flex-col gap-1">
			<span class="flex items-center justify-between">
				<label for="password" class="font-bold">Password</label>
				<a href="/auth/reset" class="underline" data-sveltekit-preload-data>Forgot password?</a>
			</span>
			<input
				type="password"
				id="email-address"
				name="password"
				placeholder="Enter your password"
				class=" rounded-md border-2 p-1"
			/>
		</div>

		<button class="flex items-center justify-center gap-2 rounded-md bg-black p-2 text-white">
			<p>Continue</p>
			<ChevronRight size={16} />
		</button>

		<a href="/auth/sign-up" class="flex w-fit gap-1 hover:underline" data-sveltekit-preload-data>
			<p class="text-gray-500">Don't have an account? <b class="text-black">Sign up</b></p>
		</a>
	</div>
</main>
