<script>
	import { growsStore } from '$lib/stores/grows.svelte.js';
	import { logsStore } from '$lib/stores/logs.svelte.js';

	let filterLocation = $state('');
	let filterSystem = $state('');
	let filterStatus = $state('active');

	const locations = $derived([...new Set(growsStore.grows.map(g => g.location))]);
	const systems = ['DWC', 'Bato Buckets', 'NFT', 'Ebb & Flow', 'Drip', 'Kratky', 'Other'];

	const filteredGrows = $derived.by(() => {
		let filtered = growsStore.grows;

		if (filterLocation) {
			filtered = filtered.filter(g => g.location === filterLocation);
		}

		if (filterSystem) {
			filtered = filtered.filter(g => g.system === filterSystem);
		}

		if (filterStatus !== 'all') {
			filtered = filtered.filter(g => g.status === filterStatus);
		}

		return filtered;
	});

	function getDaysSinceStart(startDate) {
		if (!startDate) return 0;
		return Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
	}

	function getLatestLog(growId) {
		const growLogs = logsStore.getByGrowId(growId);
		return growLogs[0];
	}

	function deleteGrow(id) {
		if (confirm('Delete this grow? This will also delete all associated logs.')) {
			growsStore.delete(id);
			// Also delete associated logs and tasks
			logsStore.logs = logsStore.logs.filter(l => l.growId !== id);
		}
	}
</script>

<svelte:head>
	<title>My Grows - HydroTracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold">My Grows</h1>
		<a href="/grows/new" class="btn btn-primary">
			<span class="text-xl">+</span>
			New Grow
		</a>
	</div>

	<!-- Filters -->
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="form-control">
					<label class="label" for="filter-location">
						<span class="label-text">Location</span>
					</label>
					<select
						id="filter-location"
						class="select select-bordered"
						bind:value={filterLocation}
					>
						<option value="">All Locations</option>
						{#each locations as location}
							<option value={location}>{location}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="filter-system">
						<span class="label-text">System</span>
					</label>
					<select id="filter-system" class="select select-bordered" bind:value={filterSystem}>
						<option value="">All Systems</option>
						{#each systems as system}
							<option value={system}>{system}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="filter-status">
						<span class="label-text">Status</span>
					</label>
					<select id="filter-status" class="select select-bordered" bind:value={filterStatus}>
						<option value="active">Active</option>
						<option value="completed">Completed</option>
						<option value="all">All</option>
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Grows List -->
	{#if filteredGrows.length === 0}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body text-center py-12">
				<div class="text-6xl mb-4">🌱</div>
				<h3 class="text-2xl font-bold mb-2">No grows found</h3>
				<p class="opacity-70 mb-4">Start tracking your hydroponics journey!</p>
				<a href="/grows/new" class="btn btn-primary">Create Your First Grow</a>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each filteredGrows as grow}
				{@const latestLog = getLatestLog(grow.id)}
				{@const daysSinceStart = getDaysSinceStart(grow.startDate)}
				{@const logCount = logsStore.getByGrowId(grow.id).length}

				<div class="card bg-base-100 shadow-xl border-l-4 border-l-primary hover:shadow-2xl transition">
					<div class="card-body">
						<div class="flex justify-between items-start">
							<div class="flex-1">
								<h2 class="card-title">{grow.name}</h2>
								<div class="text-sm opacity-70 space-y-1">
									<div>🌱 {grow.plantType}</div>
									<div>📍 {grow.location} ({grow.environment})</div>
									<div>💧 {grow.system} - {grow.medium}</div>
									{#if grow.startDate}
										<div>📅 Started: {grow.startDate}</div>
									{/if}
									{#if grow.expectedHarvest}
										<div>🌾 Expected Harvest: {grow.expectedHarvest}</div>
									{/if}
								</div>
							</div>
							<div class="text-right space-y-2">
								<div class="badge {grow.status === 'active' ? 'badge-success' : 'badge-info'}">
									{grow.status}
								</div>
								{#if grow.status === 'active'}
									<div class="badge badge-primary">Day {daysSinceStart}</div>
								{/if}
								{#if grow.public}
									<div class="badge badge-accent">Public</div>
								{/if}
							</div>
						</div>

						{#if latestLog && latestLog.stage}
							<div class="mt-3">
								<div class="badge badge-lg badge-outline">{latestLog.stage}</div>
							</div>
						{/if}

						{#if latestLog}
							<div class="flex gap-2 flex-wrap mt-2">
								{#if latestLog.pH}
									<div class="stat bg-base-200 rounded-lg p-2 flex-1 min-w-0">
										<div class="stat-title text-xs">pH</div>
										<div class="stat-value text-lg">{latestLog.pH}</div>
									</div>
								{/if}
								{#if latestLog.EC}
									<div class="stat bg-base-200 rounded-lg p-2 flex-1 min-w-0">
										<div class="stat-title text-xs">EC</div>
										<div class="stat-value text-lg">{latestLog.EC}</div>
									</div>
								{/if}
								{#if latestLog.waterTemp}
									<div class="stat bg-base-200 rounded-lg p-2 flex-1 min-w-0">
										<div class="stat-title text-xs">Water</div>
										<div class="stat-value text-lg">{latestLog.waterTemp}°F</div>
									</div>
								{/if}
							</div>
						{/if}

						<div class="mt-3 text-sm opacity-70">
							<div>📊 {logCount} log{logCount !== 1 ? 's' : ''}</div>
							<div>🎯 {grow.purpose}</div>
							{#if grow.notes}
								<div class="mt-2">{grow.notes}</div>
							{/if}
						</div>

						<div class="card-actions justify-end mt-4">
							<a href="/log?grow={grow.id}" class="btn btn-sm btn-primary">Log</a>
							<a href="/grows/{grow.id}" class="btn btn-sm btn-secondary">Details</a>
							{#if grow.status === 'active'}
								<button
									class="btn btn-sm btn-success"
									onclick={() => {
										const yieldAmount = prompt('Enter harvest yield (optional):');
										growsStore.update(grow.id, {
											status: 'completed',
											completedDate: new Date().toISOString().split('T')[0],
											harvestYield: yieldAmount || undefined
										});
									}}
								>
									Complete
								</button>
							{/if}
							<button class="btn btn-sm btn-error" onclick={() => deleteGrow(grow.id)}>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
