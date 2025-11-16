<script>
	import { growsStore } from '$lib/stores/grows.svelte.js';
	import { usersStore } from '$lib/stores/users.svelte.js';

	const publicGrows = $derived(growsStore.getPublic());

	function toggleLike(growId) {
		// In a real app, this would be an API call
		const grow = growsStore.getById(growId);
		if (grow) {
			growsStore.update(growId, {
				likes: (grow.likes || 0) + 1
			});
		}
	}

	function followUser(userId) {
		usersStore.follow(userId);
	}
</script>

<svelte:head>
	<title>Community - HydroTracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Community</h1>
			<p class="opacity-70">Discover and learn from other growers</p>
		</div>
	</div>

	<!-- Tabs -->
	<div role="tablist" class="tabs tabs-boxed bg-base-200">
		<a role="tab" class="tab tab-active">Public Grows</a>
		<a role="tab" class="tab">Top Growers</a>
		<a role="tab" class="tab">Following</a>
	</div>

	<!-- Coming Soon Notice -->
	<div class="alert alert-info">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<div>
			<h3 class="font-bold">Community Features Coming Soon!</h3>
			<div class="text-sm">
				Share your grows, follow other growers, and learn from the community. This feature is in
				development.
			</div>
		</div>
	</div>

	<!-- Mock Public Grows -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		<div class="card bg-base-100 shadow-xl">
			<figure class="bg-gradient-to-br from-green-400 to-green-600 h-48"></figure>
			<div class="card-body">
				<h2 class="card-title">
					Hydroponic Lettuce Setup
					<div class="badge badge-success">Active</div>
				</h2>
				<p class="text-sm opacity-70">By @hydroponics_pro</p>
				<div class="text-sm">
					<div>🌱 Butterhead Lettuce</div>
					<div>💧 DWC System</div>
					<div>📅 Day 28</div>
				</div>
				<div class="card-actions justify-between items-center mt-2">
					<div class="flex gap-2">
						<button class="btn btn-sm btn-circle" onclick={() => toggleLike('demo1')}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</button>
						<span class="text-sm opacity-70">42 likes</span>
					</div>
					<button class="btn btn-sm btn-primary">View Details</button>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<figure class="bg-gradient-to-br from-purple-400 to-pink-600 h-48"></figure>
			<div class="card-body">
				<h2 class="card-title">
					Tomato Paradise
					<div class="badge badge-accent">Flowering</div>
				</h2>
				<p class="text-sm opacity-70">By @tomato_master</p>
				<div class="text-sm">
					<div>🌱 Cherry Tomatoes</div>
					<div>💧 NFT System</div>
					<div>📅 Day 45</div>
				</div>
				<div class="card-actions justify-between items-center mt-2">
					<div class="flex gap-2">
						<button class="btn btn-sm btn-circle" onclick={() => toggleLike('demo2')}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</button>
						<span class="text-sm opacity-70">87 likes</span>
					</div>
					<button class="btn btn-sm btn-primary">View Details</button>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<figure class="bg-gradient-to-br from-yellow-400 to-orange-600 h-48"></figure>
			<div class="card-body">
				<h2 class="card-title">
					Calendula Dream
					<div class="badge badge-warning">Drying</div>
				</h2>
				<p class="text-sm opacity-70">By @flower_power</p>
				<div class="text-sm">
					<div>🌱 Calendula</div>
					<div>💧 Bato Buckets</div>
					<div>📅 Day 65</div>
				</div>
				<div class="card-actions justify-between items-center mt-2">
					<div class="flex gap-2">
						<button class="btn btn-sm btn-circle" onclick={() => toggleLike('demo3')}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</button>
						<span class="text-sm opacity-70">31 likes</span>
					</div>
					<button class="btn btn-sm btn-primary">View Details</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Feature List -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Upcoming Community Features</h2>
			<ul class="space-y-2">
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Share your grows publicly with the community</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Follow other growers and see their updates</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Like and comment on grows</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Browse grows by plant type, system, and more</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Compare your grows with similar setups</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Join discussion forums and Q&A</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-success">✓</span>
					<span>Share nutrient recipes and feeding schedules</span>
				</li>
			</ul>
		</div>
	</div>
</div>
