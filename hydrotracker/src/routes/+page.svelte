<script>
	import { growsStore } from '$lib/stores/grows.svelte.js';
	import { logsStore } from '$lib/stores/logs.svelte.js';
	import { tasksStore } from '$lib/stores/tasks.svelte.js';

	const activeGrows = $derived(growsStore.getActive());
	const todayTasks = $derived(tasksStore.getToday());
	const overdueTasks = $derived(tasksStore.getOverdue());
	const recentLogs = $derived(logsStore.getRecent(5));

	// Calculate harvest soon (within 2 weeks)
	const harvestSoon = $derived.by(() => {
		const twoWeeksFromNow = new Date();
		twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

		return activeGrows.filter(g => {
			if (!g.expectedHarvest) return false;
			const harvestDate = new Date(g.expectedHarvest);
			return harvestDate <= twoWeeksFromNow && harvestDate >= new Date();
		});
	});

	const completedGrows = $derived(growsStore.getCompleted());

	function getDaysSinceStart(startDate) {
		if (!startDate) return 0;
		return Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
	}

	function getLatestLog(growId) {
		const growLogs = logsStore.getByGrowId(growId);
		return growLogs[0];
	}
</script>

<svelte:head>
	<title>Dashboard - HydroTracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold">Dashboard</h1>
		<a href="/grows/new" class="btn btn-primary">
			<span class="text-xl">+</span>
			New Grow
		</a>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-primary text-4xl">🌱</div>
				<div class="stat-title">Active Grows</div>
				<div class="stat-value text-primary">{activeGrows.length}</div>
				<div class="stat-desc">Currently growing</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-secondary text-4xl">✓</div>
				<div class="stat-title">Tasks Today</div>
				<div class="stat-value text-secondary">{todayTasks.length}</div>
				<div class="stat-desc">{overdueTasks.length} overdue</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-accent text-4xl">🌾</div>
				<div class="stat-title">Harvest Soon</div>
				<div class="stat-value text-accent">{harvestSoon.length}</div>
				<div class="stat-desc">Within 2 weeks</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-success text-4xl">✨</div>
				<div class="stat-title">Total Harvests</div>
				<div class="stat-value text-success">{completedGrows.length}</div>
				<div class="stat-desc">Completed grows</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Active Grows -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Active Grows</h2>

				{#if activeGrows.length === 0}
					<div class="text-center py-8 text-base-content/60">
						<div class="text-6xl mb-4">🌱</div>
						<p>No active grows yet</p>
						<a href="/grows/new" class="btn btn-primary btn-sm mt-4">Start Your First Grow</a>
					</div>
				{:else}
					<div class="space-y-4">
						{#each activeGrows.slice(0, 3) as grow}
							{@const latestLog = getLatestLog(grow.id)}
							{@const daysSinceStart = getDaysSinceStart(grow.startDate)}

							<div class="card bg-base-200 border-l-4 border-l-primary">
								<div class="card-body p-4">
									<div class="flex justify-between items-start">
										<div class="flex-1">
											<h3 class="font-bold">{grow.name}</h3>
											<div class="text-sm opacity-70 space-x-2">
												<span>🌱 {grow.plantType}</span>
												<span>📍 {grow.location}</span>
												<span>💧 {grow.system}</span>
											</div>
											{#if latestLog}
												<div class="flex gap-2 mt-2">
													{#if latestLog.pH}
														<div class="badge badge-sm">pH: {latestLog.pH}</div>
													{/if}
													{#if latestLog.EC}
														<div class="badge badge-sm">EC: {latestLog.EC}</div>
													{/if}
													{#if latestLog.stage}
														<div class="badge badge-primary badge-sm">{latestLog.stage}</div>
													{/if}
												</div>
											{/if}
										</div>
										<div class="badge badge-success">Day {daysSinceStart}</div>
									</div>
									<div class="card-actions justify-end mt-2">
										<a href="/log?grow={grow.id}" class="btn btn-xs btn-primary">Log</a>
										<a href="/grows/{grow.id}" class="btn btn-xs btn-ghost">Details</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
					{#if activeGrows.length > 3}
						<a href="/grows" class="btn btn-sm btn-ghost w-full">View All ({activeGrows.length})</a>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Upcoming Tasks -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Upcoming Tasks</h2>

				{#if todayTasks.length === 0 && overdueTasks.length === 0}
					<div class="text-center py-8 text-base-content/60">
						<div class="text-6xl mb-4">✓</div>
						<p>No tasks scheduled</p>
						<a href="/tasks/new" class="btn btn-primary btn-sm mt-4">Create Task</a>
					</div>
				{:else}
					<div class="space-y-3">
						{#each [...overdueTasks, ...todayTasks].slice(0, 5) as task}
							{@const grow = growsStore.getById(task.growId)}
							{@const isOverdue = new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0)}

							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-3">
									<input
										type="checkbox"
										class="checkbox checkbox-primary"
										checked={task.completed}
										onchange={() => tasksStore.toggle(task.id)}
									/>
									<div class="flex-1">
										<div class="font-medium">{task.title}</div>
										<div class="text-xs opacity-70">
											{task.dueDate} • {task.priority}
											{#if grow}
												• {grow.name}
											{/if}
										</div>
									</div>
									{#if isOverdue}
										<span class="badge badge-error badge-sm">Overdue</span>
									{/if}
								</label>
							</div>
						{/each}
					</div>
					<a href="/tasks" class="btn btn-sm btn-ghost w-full mt-2">View All Tasks</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Recent Activity / Alerts -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Recent Alerts & Activity</h2>

			<div class="space-y-2">
				{#if overdueTasks.length > 0}
					<div class="alert alert-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</span>
					</div>
				{/if}

				{#if harvestSoon.length > 0}
					<div class="alert alert-success">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{harvestSoon.length} grow{harvestSoon.length > 1 ? 's' : ''} ready for harvest soon!</span>
					</div>
				{/if}

				{#if recentLogs.length === 0}
					<div class="alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Start logging to track your grows!</span>
					</div>
				{:else}
					<div class="alert alert-success">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>All systems looking good! 🌱</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
