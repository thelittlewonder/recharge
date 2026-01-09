<script lang="ts">
	import { destinations } from '$lib/data/itinerary';
	import DestinationCard from '$lib/components/DestinationCard.svelte';
	import JoinModal from '$lib/components/JoinModal.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let modalOpen = false;
	let isMobile = false;
	let imagesLoaded = 0;
	let allImagesLoaded = false;
	let visibleCards = new Set<string>();
	
	// Count images that need to load (exclude summary which has no image)
	const totalImages = destinations.filter(d => d.image && !d.isSummary).length;

	// Create orderings: find destinations by ID for flexibility
	const destinationMap = new Map(destinations.map(d => [d.id, d]));
	
	// Mobile order: chronological (by dates)
	const mobileOrder = [
		'taiwan',        // May 2-6
		'kinabatangan',  // May 7-10
		'yogyakarta',    // May 11-15
		'bromo',         // May 15-16
		'komodo',        // May 17-20
		'bali',          // May 20-25
		'summary'
	];
	
	// Desktop order: optimized for masonry layout
	const desktopOrder = [
		'taiwan',
		'yogyakarta',
		'kinabatangan',
		'bromo',
		'komodo',
		'bali',
		'summary'
	];

	$: displayedDestinations = (isMobile 
		? mobileOrder.map(id => destinationMap.get(id))
		: desktopOrder.map(id => destinationMap.get(id))
	).filter((d): d is typeof destinations[0] => d !== undefined);

	function checkMobile() {
		isMobile = window.innerWidth < 640;
	}

	let observer: IntersectionObserver | null = null;

	function setupScrollObserver() {
		if (observer) {
			observer.disconnect();
		}

		// Set up Intersection Observer for scroll-triggered animations
		const observerOptions = {
			root: null,
			rootMargin: '0px 0px -50px 0px', // Trigger when card is 50px from bottom of viewport
			threshold: 0.1
		};

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && entry.target instanceof HTMLElement) {
					const cardId = entry.target.dataset.cardId;
					if (cardId) {
						visibleCards.add(cardId);
						visibleCards = visibleCards; // Trigger reactivity
						// Once visible, we can stop observing
						observer?.unobserve(entry.target);
					}
				}
			});
		}, observerOptions);

		// Observe all card elements after a short delay to ensure DOM is ready
		setTimeout(() => {
			const cardElements = document.querySelectorAll('[data-card-id]');
			cardElements.forEach((el) => {
				// Check if element is already in viewport
				const rect = el.getBoundingClientRect();
				const isInViewport = rect.top < window.innerHeight - 50 && rect.bottom > 0;
				
				if (isInViewport && el instanceof HTMLElement) {
					const cardId = el.dataset.cardId;
					if (cardId) {
						visibleCards.add(cardId);
						visibleCards = visibleCards; // Trigger reactivity
					}
				} else {
					observer?.observe(el);
				}
			});
		}, 100);
	}

	onMount(() => {
		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
			if (observer) {
				observer.disconnect();
			}
		};
	});

	// Set up observer when images are loaded and cards are visible
	$: if (allImagesLoaded) {
		setupScrollObserver();
	}

	function openModal() {
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleImageLoaded() {
		imagesLoaded++;
		if (imagesLoaded >= totalImages) {
			allImagesLoaded = true;
		}
	}

	// Filter destinations for the modal (exclude summary)
	const modalDestinations = destinations.filter((d) => !d.isSummary);
</script>

<div class="page-title-container">
	<h1 class="page-title" transition:fade={{ duration: 300, delay: 100 }}>Abhishek's Recharge Plan</h1>
</div>

{#if !allImagesLoaded}
	<div class="loader-overlay" transition:fade={{ duration: 200 }}>
		<div class="masonry">
			{#each displayedDestinations as destination}
				<div class="masonry-item" class:wide={destination.isWide}>
					<div class="skeleton-card" class:summary={destination.isSummary} class:tall={destination.isTall}>
						{#if destination.image}
							<div class="skeleton-image"></div>
						{/if}
						<div class="skeleton-title"></div>
						<div class="skeleton-text"></div>
						<div class="skeleton-text short"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<div class="masonry" class:loaded={allImagesLoaded}>
	{#each displayedDestinations as destination, index (destination.id)}
		<div 
			class="masonry-item" 
			class:wide={destination.isWide}
			class:visible={visibleCards.has(destination.id)}
			class:loaded={allImagesLoaded}
			data-card-id={destination.id}
		>
			{#if destination.isSummary}
				<DestinationCard {destination} on:imageloaded={handleImageLoaded}>
					<div class="summary-actions">
						<button class="cta-button" on:click={openModal}>Join Abhishek</button>
						<button type="button" class="back-to-top" on:click={scrollToTop}>Back to top</button>
					</div>
				</DestinationCard>
			{:else}
				<DestinationCard {destination} on:imageloaded={handleImageLoaded} />
			{/if}
		</div>
	{/each}
</div>

<JoinModal destinations={modalDestinations} open={modalOpen} onClose={closeModal} />

<style>
	.page-title-container {
		width: 100%;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
		padding: 72px var(--spacing) 0 var(--spacing);
		box-sizing: border-box;
	}

	.page-title {
		font-family: 'Crimson Pro', serif;
		font-style: italic;
		font-size: 64px;
		color: #000000;
		text-align: left;
		margin: 0;
	}

	.summary-actions {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-top: var(--spacing);
		align-items: center;
	}

	.loader-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--bg-color);
		z-index: 999;
		overflow-y: auto;
		padding-top: 72px;
	}

	.masonry-item {
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.4s ease-out, transform 0.4s ease-out;
	}

	.masonry-item.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.masonry:not(.loaded) .masonry-item {
		visibility: hidden;
		position: absolute;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.masonry-item {
			transition: opacity 0.1s ease-out;
			transform: none;
		}
	}

	.skeleton-card {
		background-color: var(--card-bg);
		border-radius: var(--border-radius);
		padding: var(--spacing);
		display: flex;
		flex-direction: column;
	}

	.skeleton-image {
		width: 100%;
		height: 200px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: var(--border-radius);
		margin-bottom: var(--spacing);
	}

	.skeleton-card.tall .skeleton-image {
		aspect-ratio: 3 / 4;
		height: auto;
	}

	.skeleton-title {
		width: 60%;
		height: 32px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: 4px;
		margin-bottom: 8px;
	}

	.skeleton-text {
		width: 100%;
		height: 18px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: 4px;
		margin-bottom: 8px;
	}

	.skeleton-text.short {
		width: 40%;
	}

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-image,
		.skeleton-title,
		.skeleton-text {
			animation: none;
			background: #f0f0f0;
		}
	}
</style>
