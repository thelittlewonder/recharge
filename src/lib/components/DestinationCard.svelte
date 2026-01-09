<script lang="ts">
	import type { Destination } from '../data/itinerary';
	import { createEventDispatcher, onMount } from 'svelte';

	export let destination: Destination;
	
	const dispatch = createEventDispatcher();
	let imageLoaded = false;
	let imageElement: HTMLImageElement;

	function handleImageLoad() {
		if (!imageLoaded) {
			imageLoaded = true;
			dispatch('imageloaded');
		}
	}

	function handleImageError() {
		// Even on error, consider it "loaded" so we don't block the UI
		if (!imageLoaded) {
			imageLoaded = true;
			dispatch('imageloaded');
		}
	}

	onMount(() => {
		// Check if image is already loaded (cached)
		if (imageElement && imageElement.complete && imageElement.naturalHeight !== 0) {
			handleImageLoad();
		}
	});
</script>

<div class="card" class:summary={destination.isSummary} class:tall={destination.isTall}>
	{#if destination.image}
		<img 
			bind:this={imageElement}
			src={destination.image} 
			alt={destination.title} 
			class="card-image"
			class:loaded={imageLoaded}
			loading="lazy"
			on:load={handleImageLoad}
			on:error={handleImageError}
		/>
	{/if}
	<h2 class="card-title" class:bold={destination.isSummary}>
		{destination.title}
	</h2>
	{#if destination.description}
		{#if destination.isSummary}
			{@const parts = destination.description.split(' Back in London, June 8th.')}
			<p class="card-description">{parts[0]}</p>
			<p class="card-dates">Back in London, June 8th.</p>
		{:else}
			<p class="card-description">{destination.description}</p>
		{/if}
	{/if}
	{#if destination.dates}
		<p class="card-dates">{destination.dates}</p>
	{/if}
	<slot />
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
		will-change: transform;
	}

	.card:not(.summary):hover {
		transform: scale(1.01);
	}
	
	.card-image {
		width: 100%;
		height: auto;
		flex-shrink: 0;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
		will-change: opacity;
	}
	
	.card-image.loaded {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
		
		.card:not(.summary):hover {
			transform: none;
		}

		.card-image {
			transition: opacity 0.1s ease-in-out;
		}
	}
</style>

