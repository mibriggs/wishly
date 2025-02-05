<script>
	import { ChevronRight } from 'lucide-svelte';
	import googleLogo from '$lib/assets/google.svg';
	import githubLogo from '$lib/assets/github.svg';
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

		<div class="flex w-full items-center justify-center gap-1 self-center">
			<button
				class="flex items-center justify-center gap-1 rounded-md border-2 px-12 py-1 shadow-sm"
			>
				<img src={googleLogo} alt="google logo" width="16" />
				<p>Google</p>
			</button>

			<button
				class="flex items-center justify-center gap-1 rounded-md border-2 px-12 py-1 shadow-sm"
			>
				<img src={githubLogo} alt="github logo" width="16" />
				<p>GitHub</p>
			</button>
		</div>

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
				class="rounded-md border-2 p-1"
			/>
		</div>

		<div class="flex flex-col gap-1">
			<label for="password" class="font-bold">Password</label>
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

		<a class="flex w-fit gap-1 hover:underline" href="/auth/sign-in">
			<p class="text-gray-500">Already have an account?</p>
			<p class="font-bold">Sign in</p>
		</a>
	</div>
</main>
