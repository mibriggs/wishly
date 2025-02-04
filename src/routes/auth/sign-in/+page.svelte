<script>
	import { ChevronRight } from 'lucide-svelte';
    import googleLogo from '$lib/assets/google.svg'
    import githubLogo from '$lib/assets/github.svg'
</script>

<main class="flex w-screen items-center justify-center">
	<div class="mt-20 flex w-11/12 md:w-3/5 xl:w-2/5 flex-col gap-5 rounded-md border-2 p-4 shadow-md">
		<div class="flex flex-col items-center justify-center">
			<p class="text-center text-xl font-bold">Sign in to Wantify</p>
			<p class="text-center text-sm text-gray-500">Welcome back! Please sign in to continue</p>
		</div>

		<div class="self-center flex items-center justify-center w-full gap-1">
			<button class="border-2 px-12 py-1 rounded-md shadow-sm flex items-center justify-center gap-1">
                <img src={googleLogo} alt="google logo" width="16" />
                <p>Google</p>
            </button>
			
            <button class="border-2 px-12 py-1 rounded-md shadow-sm flex items-center justify-center gap-1">
                <img src={githubLogo} alt="github logo" width="16" />
                <p>GitHub</p>
            </button>
		</div>

		<div class="flex items-center justify-center gap-2">
            <hr class="border w-[45%]">
            <p class="text-gray-400">or</p>
            <hr class="border w-[45%]">
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
                <a href="/auth/reset" class="underline">Forgot password?</a>
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

		<a href="/auth/sign-up" class="flex gap-1 hover:underline w-fit">
			<p class="text-gray-500">Don't have an account?</p>
			<p class="font-bold">Sign up</p>
		</a>
	</div>
</main>
