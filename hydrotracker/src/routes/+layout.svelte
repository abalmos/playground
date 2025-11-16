<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { usersStore } from '$lib/stores/users.svelte.js';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '🏠' },
		{ href: '/grows', label: 'My Grows', icon: '🌱' },
		{ href: '/log', label: 'Daily Log', icon: '📝' },
		{ href: '/tasks', label: 'Tasks', icon: '✓' },
		{ href: '/nutrients', label: 'Nutrients', icon: '💧' },
		{ href: '/community', label: 'Community', icon: '👥' }
	];

	function isActive(href) {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}

	function handleLogout() {
		usersStore.logout();
		window.location.href = '/auth/login';
	}
</script>

<div class="drawer lg:drawer-open">
	<input id="drawer" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="navbar bg-primary text-primary-content sticky top-0 z-40 shadow-lg">
			<div class="flex-none lg:hidden">
				<label for="drawer" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-6 w-6 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</label>
			</div>
			<div class="flex-1 px-4">
				<a href="/" class="text-xl font-bold flex items-center gap-2">
					🌱 HydroTracker
				</a>
			</div>
			<div class="flex-none">
				{#if usersStore.currentUser}
					<div class="dropdown dropdown-end">
						<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
							<div class="bg-neutral text-neutral-content w-10 rounded-full">
								<span class="text-xl">{usersStore.currentUser.username[0].toUpperCase()}</span>
							</div>
						</div>
						<ul
							tabindex="0"
							class="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-52 p-2 shadow"
						>
							<li class="menu-title">
								<span>{usersStore.currentUser.username}</span>
							</li>
							<li><a href="/profile">Profile</a></li>
							<li><a href="/settings">Settings</a></li>
							<li><button onclick={handleLogout}>Logout</button></li>
						</ul>
					</div>
				{:else}
					<a href="/auth/login" class="btn btn-ghost">Login</a>
				{/if}
			</div>
		</div>

		<!-- Page content -->
		<main class="flex-1 p-4 lg:p-6">
			<div class="max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side z-50">
		<label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<aside class="bg-base-100 min-h-full w-64 flex flex-col">
			<!-- Logo in sidebar -->
			<div class="p-4 bg-primary text-primary-content">
				<div class="text-xl font-bold">🌱 HydroTracker</div>
				<div class="text-xs opacity-70">Grow Smarter</div>
			</div>

			<!-- Navigation -->
			<ul class="menu p-4 flex-1">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class:active={isActive(item.href)}
							class="flex items-center gap-3"
						>
							<span class="text-xl">{item.icon}</span>
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>

			<!-- Theme selector -->
			<div class="p-4 border-t">
				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Theme</span>
						<select class="select select-sm select-bordered" data-choose-theme>
							<option value="hydrotracker">HydroTracker</option>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
							<option value="cupcake">Cupcake</option>
							<option value="garden">Garden</option>
						</select>
					</label>
				</div>
			</div>
		</aside>
	</div>
</div>

<style>
	:global(.menu .active) {
		@apply bg-primary text-primary-content;
	}
</style>
