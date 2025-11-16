<script>
	import { page } from '$app/stores';
	import { growsStore } from '$lib/stores/grows.svelte.js';
	import { logsStore } from '$lib/stores/logs.svelte.js';

	let selectedGrowId = $state($page.url.searchParams.get('grow') || '');
	let logDate = $state(new Date().toISOString().split('T')[0]);

	let formData = $state({
		pH: '',
		EC: '',
		PPM: '',
		waterTemp: '',
		airTemp: '',
		humidity: '',
		lightHours: '',
		reservoirLevel: '',
		runoffPH: '',
		runoffEC: '',
		plantHeight: '',
		stage: '',
		notes: ''
	});

	const activeGrows = $derived(growsStore.getActive());
	const todayLogs = $derived.by(() => {
		if (!selectedGrowId) return [];
		return logsStore.logs.filter(
			(l) => l.growId === selectedGrowId && l.date === logDate
		);
	});

	function handleSubmit(e) {
		e.preventDefault();

		if (!selectedGrowId) {
			alert('Please select a grow');
			return;
		}

		const log = {
			growId: selectedGrowId,
			date: logDate,
			pH: formData.pH ? parseFloat(formData.pH) : null,
			EC: formData.EC ? parseFloat(formData.EC) : null,
			PPM: formData.PPM ? parseInt(formData.PPM) : null,
			waterTemp: formData.waterTemp ? parseFloat(formData.waterTemp) : null,
			airTemp: formData.airTemp ? parseFloat(formData.airTemp) : null,
			humidity: formData.humidity ? parseInt(formData.humidity) : null,
			lightHours: formData.lightHours ? parseFloat(formData.lightHours) : null,
			reservoirLevel: formData.reservoirLevel ? parseFloat(formData.reservoirLevel) : null,
			runoffPH: formData.runoffPH ? parseFloat(formData.runoffPH) : null,
			runoffEC: formData.runoffEC ? parseFloat(formData.runoffEC) : null,
			plantHeight: formData.plantHeight ? parseFloat(formData.plantHeight) : null,
			stage: formData.stage || null,
			notes: formData.notes || null
		};

		logsStore.add(log);

		// Reset form
		formData = {
			pH: '',
			EC: '',
			PPM: '',
			waterTemp: '',
			airTemp: '',
			humidity: '',
			lightHours: '',
			reservoirLevel: '',
			runoffPH: '',
			runoffEC: '',
			plantHeight: '',
			stage: '',
			notes: ''
		};

		alert('Log entry saved!');
	}

	function deleteLog(id) {
		if (confirm('Delete this log entry?')) {
			logsStore.delete(id);
		}
	}
</script>

<svelte:head>
	<title>Daily Log - HydroTracker</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-3xl font-bold">Daily Log</h1>

	<!-- Grow Selection -->
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="form-control">
					<label class="label" for="grow-select">
						<span class="label-text">Select Grow</span>
					</label>
					<select id="grow-select" class="select select-bordered" bind:value={selectedGrowId}>
						<option value="">-- Select a grow --</option>
						{#each activeGrows as grow}
							<option value={grow.id}>{grow.name} ({grow.plantType})</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="log-date">
						<span class="label-text">Date</span>
					</label>
					<input type="date" id="log-date" class="input input-bordered" bind:value={logDate} />
				</div>
			</div>
		</div>
	</div>

	{#if selectedGrowId}
		<!-- Log Form -->
		<form onsubmit={handleSubmit}>
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body space-y-4">
					<h2 class="card-title">Log Entry</h2>

					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						<div class="form-control">
							<label class="label" for="pH">
								<span class="label-text">pH</span>
							</label>
							<input
								type="number"
								id="pH"
								class="input input-bordered"
								step="0.1"
								min="0"
								max="14"
								placeholder="6.0"
								bind:value={formData.pH}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="EC">
								<span class="label-text">EC (mS/cm)</span>
							</label>
							<input
								type="number"
								id="EC"
								class="input input-bordered"
								step="0.1"
								placeholder="1.5"
								bind:value={formData.EC}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="PPM">
								<span class="label-text">PPM</span>
							</label>
							<input
								type="number"
								id="PPM"
								class="input input-bordered"
								placeholder="1050"
								bind:value={formData.PPM}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="waterTemp">
								<span class="label-text">Water Temp (°F)</span>
							</label>
							<input
								type="number"
								id="waterTemp"
								class="input input-bordered"
								step="0.1"
								placeholder="68"
								bind:value={formData.waterTemp}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="airTemp">
								<span class="label-text">Air Temp (°F)</span>
							</label>
							<input
								type="number"
								id="airTemp"
								class="input input-bordered"
								step="0.1"
								placeholder="75"
								bind:value={formData.airTemp}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="humidity">
								<span class="label-text">Humidity (%)</span>
							</label>
							<input
								type="number"
								id="humidity"
								class="input input-bordered"
								min="0"
								max="100"
								placeholder="60"
								bind:value={formData.humidity}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="lightHours">
								<span class="label-text">Light Hours</span>
							</label>
							<input
								type="number"
								id="lightHours"
								class="input input-bordered"
								step="0.5"
								min="0"
								max="24"
								placeholder="16"
								bind:value={formData.lightHours}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="reservoirLevel">
								<span class="label-text">Reservoir (gal)</span>
							</label>
							<input
								type="number"
								id="reservoirLevel"
								class="input input-bordered"
								step="0.5"
								placeholder="10"
								bind:value={formData.reservoirLevel}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="runoffPH">
								<span class="label-text">Runoff pH</span>
							</label>
							<input
								type="number"
								id="runoffPH"
								class="input input-bordered"
								step="0.1"
								placeholder="6.2"
								bind:value={formData.runoffPH}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="runoffEC">
								<span class="label-text">Runoff EC</span>
							</label>
							<input
								type="number"
								id="runoffEC"
								class="input input-bordered"
								step="0.1"
								placeholder="1.8"
								bind:value={formData.runoffEC}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="plantHeight">
								<span class="label-text">Plant Height (in)</span>
							</label>
							<input
								type="number"
								id="plantHeight"
								class="input input-bordered"
								step="0.5"
								placeholder="12"
								bind:value={formData.plantHeight}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="stage">
								<span class="label-text">Growth Stage</span>
							</label>
							<select id="stage" class="select select-bordered" bind:value={formData.stage}>
								<option value="">-- Select --</option>
								<option value="Seed">Seed</option>
								<option value="Seedling">Seedling</option>
								<option value="Vegetative">Vegetative</option>
								<option value="Pre-Flower">Pre-Flower</option>
								<option value="Flowering">Flowering</option>
								<option value="Ripening">Ripening</option>
								<option value="Harvest">Harvest</option>
							</select>
						</div>
					</div>

					<div class="form-control">
						<label class="label" for="notes">
							<span class="label-text">Notes / Observations</span>
						</label>
						<textarea
							id="notes"
							class="textarea textarea-bordered"
							rows="4"
							placeholder="Plant health, issues, pests, nutrient changes, etc."
							bind:value={formData.notes}
						></textarea>
					</div>

					<div class="card-actions justify-end">
						<button type="submit" class="btn btn-primary">Save Log Entry</button>
					</div>
				</div>
			</div>
		</form>

		<!-- Today's Logs -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Logs for {logDate}</h2>

				{#if todayLogs.length === 0}
					<p class="text-center py-8 opacity-70">No logs for this date yet</p>
				{:else}
					<div class="space-y-4">
						{#each todayLogs as log}
							<div class="card bg-base-200">
								<div class="card-body p-4">
									<div class="flex justify-between items-start">
										<div class="text-sm font-semibold">
											{new Date(log.timestamp).toLocaleTimeString()}
										</div>
										<button class="btn btn-error btn-xs" onclick={() => deleteLog(log.id)}>
											Delete
										</button>
									</div>

									<div class="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
										{#if log.pH}
											<div class="stat bg-base-100 rounded p-2">
												<div class="stat-title text-xs">pH</div>
												<div class="stat-value text-sm">{log.pH}</div>
											</div>
										{/if}
										{#if log.EC}
											<div class="stat bg-base-100 rounded p-2">
												<div class="stat-title text-xs">EC</div>
												<div class="stat-value text-sm">{log.EC}</div>
											</div>
										{/if}
										{#if log.waterTemp}
											<div class="stat bg-base-100 rounded p-2">
												<div class="stat-title text-xs">Water</div>
												<div class="stat-value text-sm">{log.waterTemp}°F</div>
											</div>
										{/if}
										{#if log.airTemp}
											<div class="stat bg-base-100 rounded p-2">
												<div class="stat-title text-xs">Air</div>
												<div class="stat-value text-sm">{log.airTemp}°F</div>
											</div>
										{/if}
										{#if log.humidity}
											<div class="stat bg-base-100 rounded p-2">
												<div class="stat-title text-xs">Humidity</div>
												<div class="stat-value text-sm">{log.humidity}%</div>
											</div>
										{/if}
										{#if log.stage}
											<div class="stat bg-base-100 rounded p-2">
												<div class="stat-title text-xs">Stage</div>
												<div class="stat-value text-xs">{log.stage}</div>
											</div>
										{/if}
									</div>

									{#if log.notes}
										<div class="mt-2 text-sm">
											<strong>Notes:</strong>
											{log.notes}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{:else}
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
			<span>Select a grow to start logging</span>
		</div>
	{/if}
</div>
