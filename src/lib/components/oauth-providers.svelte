<script lang="ts">
	import googleLogo from '$lib/assets/google.svg';
	import githubLogo from '$lib/assets/github.svg';
	import discordLogo from '$lib/assets/discord.svg';
</script>

<div class="flex w-full flex-col items-center justify-center gap-1 self-center">
	<a
		class="flex transform items-center justify-center gap-1 rounded-md border-2 px-12 py-1 shadow-sm transition duration-100 active:scale-90 active:opacity-85"
		href="/api/v1/auth/sign-in/discord"
		rel="external"
	>
		<img src={discordLogo} alt="discord logo" width="16" />
		<p>Discord</p>
	</a>

	<button
		class="flex transform items-center justify-center gap-1 rounded-md border-2 px-12 py-1 shadow-sm transition duration-100 active:scale-90 active:opacity-85"
	>
		<img src={googleLogo} alt="google logo" width="16" />
		<p>Google</p>
	</button>

	<a
		class="flex transform items-center justify-center gap-1 rounded-md border-2 px-12 py-1 shadow-sm transition duration-100 active:scale-90 active:opacity-85"
		href="/api/v1/auth/sign-in/github"
		rel="external"
	>
		<img src={githubLogo} alt="github logo" width="16" />
		<p>GitHub</p>
	</a>
</div>
