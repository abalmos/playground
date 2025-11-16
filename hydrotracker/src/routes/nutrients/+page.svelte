<script>
	import { nutrientsStore } from '$lib/stores/nutrients.svelte.js';

	const nutrients = $derived(nutrientsStore.nutrients);

	function deleteNutrient(id) {
		if (confirm('Delete this nutrient?')) {
			nutrientsStore.delete(id);
		}
	}
</script>

<svelte:head>
	<title>Nutrients - HydroTracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold">Nutrient Management</h1>
		<button class="btn btn-primary">
			<span class="text-xl">+</span>
			Add Nutrient
		</button>
	</div>

	<!-- Nutrient Library -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Nutrient Library</h2>

			{#if nutrients.length === 0}
				<p class="text-center py-8 opacity-70">No nutrients added yet</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Brand</th>
								<th>Type</th>
								<th>NPK</th>
								<th>Dosage (ml/gal)</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each nutrients as nutrient}
								<tr>
									<td class="font-semibold">{nutrient.name}</td>
									<td>{nutrient.brand}</td>
									<td>
										<div class="badge badge-primary">{nutrient.type}</div>
									</td>
									<td>{nutrient.npk}</td>
									<td>{nutrient.dosage}</td>
									<td>
										<button class="btn btn-error btn-xs" onclick={() => deleteNutrient(nutrient.id)}>
											Delete
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<!-- Calculator -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Nutrient Calculator</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label" for="reservoir-size">
						<span class="label-text">Reservoir Size (gallons)</span>
					</label>
					<input
						type="number"
						id="reservoir-size"
						class="input input-bordered"
						placeholder="10"
						step="0.5"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="target-ec">
						<span class="label-text">Target EC (mS/cm)</span>
					</label>
					<input
						type="number"
						id="target-ec"
						class="input input-bordered"
						placeholder="1.5"
						step="0.1"
					/>
				</div>
			</div>

			<div class="alert alert-info mt-4">
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
				<span>Calculator functionality coming soon!</span>
			</div>
		</div>
	</div>

	<!-- Feeding Schedules -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Feeding Schedules</h2>

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
					<h3 class="font-bold">Feature In Development</h3>
					<div class="text-sm">
						Create and save custom feeding schedules for different growth stages.
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
