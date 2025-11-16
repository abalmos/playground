<script>
	import { growsStore } from '$lib/stores/grows.svelte.js';
	import { tasksStore } from '$lib/stores/tasks.svelte.js';
	import { goto } from '$app/navigation';

	let formData = $state({
		name: '',
		plantType: '',
		location: '',
		environment: 'Indoor',
		system: 'DWC',
		medium: 'Coco Coir',
		startDate: new Date().toISOString().split('T')[0],
		expectedHarvest: '',
		purpose: 'Fresh Consumption',
		notes: ''
	});

	function handleSubmit(e) {
		e.preventDefault();

		if (!formData.name || !formData.plantType || !formData.location) {
			alert('Please fill in required fields');
			return;
		}

		const grow = growsStore.add(formData);

		// Create initial tasks
		const startDate = new Date(formData.startDate);

		// First check task
		const firstCheck = new Date(startDate);
		firstCheck.setDate(firstCheck.getDate() + 1);

		tasksStore.add({
			title: 'First system check',
			growId: grow.id,
			dueDate: firstCheck.toISOString().split('T')[0],
			priority: 'High',
			recurring: false,
			notes: 'Check pH, EC, water level, and plant health'
		});

		// Weekly reservoir change
		const weeklyCheck = new Date(startDate);
		weeklyCheck.setDate(weeklyCheck.getDate() + 7);

		tasksStore.add({
			title: 'Weekly reservoir change/check',
			growId: grow.id,
			dueDate: weeklyCheck.toISOString().split('T')[0],
			priority: 'Medium',
			recurring: true,
			frequency: 'weekly',
			notes: 'Change reservoir, clean system, fresh nutrients'
		});

		goto('/grows');
	}
</script>

<svelte:head>
	<title>New Grow - HydroTracker</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex items-center gap-4">
		<a href="/grows" class="btn btn-ghost btn-sm">← Back</a>
		<h1 class="text-3xl font-bold">New Grow</h1>
	</div>

	<form onsubmit={handleSubmit}>
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body space-y-4">
				<h2 class="card-title">Grow Details</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label" for="name">
							<span class="label-text">Grow Name <span class="text-error">*</span></span>
						</label>
						<input
							type="text"
							id="name"
							class="input input-bordered"
							placeholder="e.g., Spring Lettuce 2024"
							bind:value={formData.name}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="plantType">
							<span class="label-text">Plant Type <span class="text-error">*</span></span>
						</label>
						<input
							type="text"
							id="plantType"
							class="input input-bordered"
							placeholder="e.g., Lettuce, Calendula, Tomato"
							bind:value={formData.plantType}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="location">
							<span class="label-text">Location <span class="text-error">*</span></span>
						</label>
						<input
							type="text"
							id="location"
							class="input input-bordered"
							placeholder="e.g., Indoor Room 1, Outdoor Bed A"
							bind:value={formData.location}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="environment">
							<span class="label-text">Environment</span>
						</label>
						<select id="environment" class="select select-bordered" bind:value={formData.environment}>
							<option value="Indoor">Indoor</option>
							<option value="Outdoor">Outdoor</option>
							<option value="Greenhouse">Greenhouse</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label" for="system">
							<span class="label-text">System Type <span class="text-error">*</span></span>
						</label>
						<select id="system" class="select select-bordered" bind:value={formData.system}>
							<option value="DWC">DWC (Deep Water Culture)</option>
							<option value="Bato Buckets">Bato Buckets (Drain to Waste)</option>
							<option value="NFT">NFT (Nutrient Film Technique)</option>
							<option value="Ebb & Flow">Ebb & Flow</option>
							<option value="Drip">Drip System</option>
							<option value="Kratky">Kratky</option>
							<option value="Other">Other</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label" for="medium">
							<span class="label-text">Growing Medium</span>
						</label>
						<select id="medium" class="select select-bordered" bind:value={formData.medium}>
							<option value="Coco Coir">Coco Coir</option>
							<option value="Rockwool">Rockwool</option>
							<option value="Clay Pebbles">Clay Pebbles</option>
							<option value="Perlite">Perlite</option>
							<option value="Water Only">Water Only</option>
							<option value="Mixed">Mixed</option>
							<option value="Other">Other</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label" for="startDate">
							<span class="label-text">Start Date</span>
						</label>
						<input
							type="date"
							id="startDate"
							class="input input-bordered"
							bind:value={formData.startDate}
						/>
					</div>

					<div class="form-control">
						<label class="label" for="expectedHarvest">
							<span class="label-text">Expected Harvest Date</span>
						</label>
						<input
							type="date"
							id="expectedHarvest"
							class="input input-bordered"
							bind:value={formData.expectedHarvest}
						/>
					</div>

					<div class="form-control md:col-span-2">
						<label class="label" for="purpose">
							<span class="label-text">Purpose</span>
						</label>
						<select id="purpose" class="select select-bordered" bind:value={formData.purpose}>
							<option value="Fresh Consumption">Fresh Consumption</option>
							<option value="Drying">Drying (Calendula, Chamomile)</option>
							<option value="Cut Flowers">Cut Flowers</option>
							<option value="Edible Flowers">Edible Flowers</option>
							<option value="Seeds">Seed Production</option>
							<option value="Other">Other</option>
						</select>
					</div>

					<div class="form-control md:col-span-2">
						<label class="label" for="notes">
							<span class="label-text">Initial Notes</span>
						</label>
						<textarea
							id="notes"
							class="textarea textarea-bordered"
							rows="3"
							placeholder="Variety, seed source, special considerations..."
							bind:value={formData.notes}
						></textarea>
					</div>
				</div>

				<div class="card-actions justify-end pt-4">
					<a href="/grows" class="btn btn-ghost">Cancel</a>
					<button type="submit" class="btn btn-primary">Create Grow</button>
				</div>
			</div>
		</div>
	</form>
</div>
