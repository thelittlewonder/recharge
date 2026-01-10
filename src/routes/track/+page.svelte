<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	interface LocationInfo {
		title: string;
		description: string;
		image: string;
	}

	// Date ranges for locations (inclusive)
	const TRIP_START = new Date(2026, 4, 2); // May 2, 2026 (month is 0-indexed)
	const TRIP_END = new Date(2026, 5, 7); // June 7, 2026
	const RETURN_DATE = new Date(2026, 5, 8); // June 8, 2026

	function getLocationForDate(date: Date): LocationInfo | null {
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDate();

		// Only check dates for 2026
		if (year !== 2026) {
			return null;
		}

		// May 2-6: Taiwan
		if (month === 4 && day >= 2 && day <= 6) {
			return {
				title: 'Taiwan',
				description: 'Exploring food, history, nature and culture.',
				image: `${base}/images/taiwan.jpg`
			};
		}

		// May 7-10: Kinabatangan
		if (month === 4 && day >= 7 && day <= 10) {
			return {
				title: 'Kinabatangan',
				description: 'Looking for orangutans. Wish him all the luck!',
				image: `${base}/images/kingabatan-horizontal.jpg`
			};
		}

		// May 11: Kuala Lumpur
		if (month === 4 && day === 11) {
			return {
				title: 'Kuala Lumpur',
				description: 'Walking around and looking for good veggie food.',
				image: `${base}/images/kualalumpur.jpg`
			};
		}

		// May 12-15: Yogyakarta
		if (month === 4 && day >= 12 && day <= 15) {
			return {
				title: 'Yogyakarta',
				description: 'Chasing sunrises and ancient indonesian history.',
				image: `${base}/images/yogyakarta.jpg`
			};
		}

		// May 16-17: Mt. Bromo
		if (month === 4 && day >= 16 && day <= 17) {
			return {
				title: 'Mt. Bromo',
				description: 'Hiking an active volcano, please hope it doesn\'t explode.',
				image: `${base}/images/bromo.jpg`
			};
		}

		// May 18-20: Labuan Bajo (Komodo)
		if (month === 4 && day >= 18 && day <= 20) {
			return {
				title: 'Labuan Bajo',
				description: 'Looking for Komodo dragons and fighting sea sickness.',
				image: `${base}/images/komodo.jpg`
			};
		}

		// May 21-25: Bali
		if (month === 4 && day >= 21 && day <= 25) {
			return {
				title: 'Bali',
				description: 'Sitting by the beach, trying to not think about work.',
				image: `${base}/images/bali.jpg`
			};
		}

		// May 26 - June 7: India
		if ((month === 4 && day >= 26) || (month === 5 && day <= 7)) {
			return {
				title: 'India',
				description: 'Catching up on sleep debt and editing photos from his recharge.',
				image: `${base}/images/delhi.jpg`
			};
		}

		return null;
	}

	function getDaysUntilTrip(): number {
		let today: Date;
		if (debugMode && debugDate) {
			today = new Date(debugDate);
		} else {
			today = new Date();
		}
		today.setHours(0, 0, 0, 0);
		const start = new Date(TRIP_START);
		start.setHours(0, 0, 0, 0);
		const diffTime = start.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	function getDaysUntilBack(): number {
		let today: Date;
		if (debugMode && debugDate) {
			today = new Date(debugDate);
		} else {
			today = new Date();
		}
		today.setHours(0, 0, 0, 0);
		const returnDate = new Date(RETURN_DATE);
		returnDate.setHours(0, 0, 0, 0);
		const diffTime = returnDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	let currentDate = new Date();
	let location: LocationInfo | null = null;
	let daysUntilTrip = 0;
	let daysUntilBack = 0;
	let isBeforeTrip = false;
	let isAfterTrip = false;
	
	// Debug mode
	let debugDate: string | null = null;
	let debugMode = false;
	let clickCount = 0;
	let clickTimeout: ReturnType<typeof setTimeout> | null = null;

	function updateState() {
		currentDate = new Date();
		let today: Date;
		
		if (debugMode && debugDate) {
			today = new Date(debugDate);
		} else {
			today = new Date();
		}
		
		today.setHours(0, 0, 0, 0);
		const start = new Date(TRIP_START);
		start.setHours(0, 0, 0, 0);
		const end = new Date(TRIP_END);
		end.setHours(23, 59, 59, 999);

		if (today < start) {
			isBeforeTrip = true;
			isAfterTrip = false;
			daysUntilTrip = getDaysUntilTrip();
			daysUntilBack = getDaysUntilBack();
			location = null;
		} else if (today > end) {
			isBeforeTrip = false;
			isAfterTrip = true;
			daysUntilBack = 0;
			location = null;
		} else {
			isBeforeTrip = false;
			isAfterTrip = false;
			daysUntilBack = getDaysUntilBack();
			location = getLocationForDate(today);
		}
	}

	onMount(() => {
		updateState();
		// Update daily at midnight
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		const msUntilMidnight = tomorrow.getTime() - now.getTime();
		
		setTimeout(() => {
			updateState();
			// Then update every 24 hours
			setInterval(updateState, 24 * 60 * 60 * 1000);
		}, msUntilMidnight);

		// Add click listener for debug mode toggle
		window.addEventListener('click', handlePageClick);
		
		return () => {
			window.removeEventListener('click', handlePageClick);
			if (clickTimeout) {
				clearTimeout(clickTimeout);
			}
		};
	});

	let imageLoaded = false;
	let imageElement: HTMLImageElement;
	let pageReady = false;

	function handleImageLoad() {
		imageLoaded = true;
		// Mark page as ready after image loads (or if no image needed)
		setTimeout(() => {
			pageReady = true;
		}, 100);
	}

	function handleImageError() {
		imageLoaded = true;
		// Mark page as ready even if image fails
		setTimeout(() => {
			pageReady = true;
		}, 100);
	}

	// Reset image loaded state when location changes
	$: if (location) {
		imageLoaded = false;
		pageReady = false;
		// Check if image is already loaded (cached) after a brief delay
		setTimeout(() => {
			if (imageElement && imageElement.complete && imageElement.naturalHeight !== 0) {
				imageLoaded = true;
				setTimeout(() => {
					pageReady = true;
				}, 100);
			}
		}, 0);
	}

	// For states without images, mark as ready immediately
	$: if ((isBeforeTrip || isAfterTrip) && !pageReady) {
		setTimeout(() => {
			pageReady = true;
		}, 150);
	}

	function handleBackToRecharge() {
		goto(`${base}/`);
	}

	function handleCallButton() {
		window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
	}

	function handleInstagramButton() {
		window.open('https://instagram.com/abh_.shek', '_blank');
	}

	function handleDebugDateChange() {
		if (debugDate) {
			updateState();
		}
	}

	function resetDebugDate() {
		debugDate = null;
		debugMode = false;
		updateState();
	}

	function handlePageClick() {
		clickCount++;
		
		// Clear existing timeout
		if (clickTimeout) {
			clearTimeout(clickTimeout);
		}
		
		// If 5 clicks, toggle debug mode
		if (clickCount >= 5) {
			toggleDebugMode();
			clickCount = 0;
		} else {
			// Reset counter after 2 seconds of no clicks
			clickTimeout = setTimeout(() => {
				clickCount = 0;
			}, 2000);
		}
	}

	function toggleDebugMode() {
		debugMode = !debugMode;
		if (debugMode && !debugDate) {
			// Set default to today
			const today = new Date();
			debugDate = today.toISOString().split('T')[0];
		}
		updateState();
	}
</script>

<!-- Debug Controller -->
{#if debugMode}
	<div class="debug-controller">
		<div class="debug-panel">
			<label>
				Test Date:
				<input 
					type="date" 
					bind:value={debugDate}
					on:change={handleDebugDateChange}
					class="debug-input"
				/>
			</label>
			<button class="debug-reset" on:click={resetDebugDate}>Reset to Today</button>
			<button class="debug-close" on:click={toggleDebugMode}>Close Debug</button>
			{#if debugDate}
				<p class="debug-info">Showing: {new Date(debugDate).toLocaleDateString()}</p>
			{/if}
		</div>
	</div>
{/if}

{#if !pageReady}
	<div class="loader-overlay" transition:fade={{ duration: 200 }}>
		<div class="loader-content">
			{#if location && location.image}
				<!-- Skeleton for location card with image -->
				<div class="skeleton-card">
					<div class="skeleton-image"></div>
					<div class="skeleton-title"></div>
					<div class="skeleton-text"></div>
				</div>
				<div class="skeleton-button"></div>
				<div class="skeleton-meta"></div>
			{:else}
				<!-- Skeleton for empty states -->
				<div class="skeleton-empty-title"></div>
				<div class="skeleton-button"></div>
				<div class="skeleton-meta"></div>
			{/if}
		</div>
	</div>
{/if}

<div class="track-container" class:ready={pageReady}>
	{#if isBeforeTrip}
		<!-- Empty state: Before trip -->
		<div class="empty-state" transition:fade={{ duration: 300, delay: 100 }}>
			<h1 class="empty-title">
				Abhishek's recharge is {daysUntilTrip} {daysUntilTrip === 1 ? 'day' : 'days'} away
			</h1>
		</div>
		<div class="button-container" transition:fade={{ duration: 300, delay: 200 }}>
			<button class="cta-button" on:click={handleBackToRecharge}>See the plan</button>
		</div>
		<p class="meta-text" transition:fade={{ duration: 300, delay: 250 }}>Away from May 2 - June 7.</p>
	{:else if isAfterTrip}
		<!-- Empty state: After trip -->
		<div class="empty-state" transition:fade={{ duration: 300, delay: 100 }}>
			<h1 class="empty-title">Abhishek's recharge is over.</h1>
		</div>
		<div class="button-container" transition:fade={{ duration: 300, delay: 200 }}>
			<button class="cta-button" on:click={handleInstagramButton}>Stalk stories on Instagram</button>
		</div>
		<p class="meta-text" transition:fade={{ duration: 300, delay: 250 }}>Back in business officially, June 8th</p>
	{:else if location}
		<!-- Location card during trip -->
		<div class="location-card" class:visible={imageLoaded}>
			{#if location.image}
				<img 
					bind:this={imageElement}
					src={location.image} 
					alt={location.title} 
					class="card-image"
					class:loaded={imageLoaded}
					loading="lazy"
					on:load={handleImageLoad}
					on:error={handleImageError}
				/>
			{/if}
			<h2 class="card-title">
				Abhishek is <em class="probably">probably</em> in {location.title} right now
			</h2>
			<p class="card-description">{location.description}</p>
		</div>
		<div class="button-container" class:visible={imageLoaded}>
			<button class="cta-button" on:click={handleCallButton}>Call Abhishek if it's urgent</button>
		</div>
		<p class="meta-text" class:visible={imageLoaded}>{daysUntilBack} {daysUntilBack === 1 ? 'day' : 'days'} until he's back to work</p>
	{/if}
</div>

<style>
	.track-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		opacity: 0;
		transition: opacity 0.3s ease-in;
	}

	.track-container.ready {
		opacity: 1;
	}

	.loader-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--bg-color);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loader-content {
		width: 100%;
		max-width: 700px;
		padding: var(--spacing);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 64px;
	}

	.skeleton-card {
		background-color: var(--card-bg);
		border-radius: var(--border-radius);
		padding: var(--spacing);
		max-width: 700px;
		width: 100%;
		transform: rotate(-2deg);
		box-shadow: 0px 4px 40px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
	}

	.skeleton-image {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: var(--border-radius);
		margin-bottom: var(--spacing);
	}

	.skeleton-title {
		width: 70%;
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

	.skeleton-button {
		width: 100%;
		max-width: 300px;
		height: 48px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: var(--border-radius);
	}

	.skeleton-meta {
		width: 200px;
		height: 14px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: 4px;
	}

	.skeleton-empty-title {
		width: 100%;
		max-width: 600px;
		height: 64px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: 4px;
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
		.skeleton-text,
		.skeleton-button,
		.skeleton-meta,
		.skeleton-empty-title {
			animation: none;
			background: #f0f0f0;
		}

		.track-container {
			transition: none;
		}
	}

	.empty-state {
		width: 100%;
		max-width: 700px;
		text-align: center;
	}

	.empty-title {
		font-family: 'Crimson Pro', serif;
		font-style: italic;
		font-size: 64px;
		color: var(--text-color);
		margin: 0;
		line-height: 1.2;
	}

	.location-card {
		background-color: var(--card-bg);
		border-radius: var(--border-radius);
		padding: var(--spacing);
		max-width: 700px;
		width: 100%;
		transform: rotate(-2deg);
		box-shadow: 0px 4px 40px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		opacity: 0;
		transform: rotate(-2deg) translateY(20px);
		transition: opacity 0.4s ease-out, transform 0.4s ease-out;
		will-change: opacity, transform;
	}

	.location-card.visible {
		opacity: 1;
		transform: rotate(-2deg) translateY(0);
	}

	.card-image {
		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		margin-bottom: var(--spacing);
		display: block;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	.card-image.loaded {
		opacity: 1;
	}

	.card-title {
		font-family: 'Crimson Pro', serif;
		font-style: italic;
		font-size: 32px;
		color: var(--text-color);
		margin-bottom: 8px;
		line-height: 1.3;
	}

	.card-title .probably {
		font-style: italic;
		font-weight: 700;
	}

	.card-description {
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 18px;
		color: var(--text-color);
		opacity: 0.7;
		margin: 8px 0 0 0;
	}

	.button-container {
		margin-top: 64px;
		width: 100%;
		max-width: 700px;
	}

	/* Animation styles only for location card state */
	.location-card ~ .button-container {
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.4s ease-out, transform 0.4s ease-out;
		transition-delay: 0.2s;
		will-change: opacity, transform;
	}

	.location-card.visible ~ .button-container {
		opacity: 1;
		transform: translateY(0);
	}

	.meta-text {
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 14px;
		color: var(--text-color);
		opacity: 0.5;
		margin-top: 12px;
		text-align: center;
	}

	/* Animation styles only for location card state */
	.location-card ~ .meta-text {
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.4s ease-out, transform 0.4s ease-out;
		transition-delay: 0.3s;
		will-change: opacity, transform;
	}

	.location-card.visible ~ .meta-text {
		opacity: 0.5;
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.empty-title {
			font-size: 48px;
		}

		.track-container {
			padding: 48px var(--spacing) var(--spacing) var(--spacing);
		}

		.card-title {
			font-size: 28px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-image {
			transition: opacity 0.1s ease-in-out;
		}

		.location-card,
		.button-container,
		.meta-text {
			transition: opacity 0.1s ease-out;
			transform: none !important;
		}

		.location-card.visible {
			transform: rotate(-2deg) !important;
		}
	}

	/* Debug Controller */
	.debug-controller {
		position: fixed;
		top: var(--spacing);
		right: var(--spacing);
		z-index: 1000;
		background-color: var(--card-bg);
		border-radius: var(--border-radius);
		padding: 12px;
		box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
		min-width: 200px;
	}

	.debug-panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.debug-panel label {
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 12px;
		color: var(--text-color);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.debug-input {
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 14px;
		padding: 8px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		background-color: var(--card-bg);
		color: var(--text-color);
	}

	.debug-reset,
	.debug-close {
		background-color: transparent;
		color: var(--text-color);
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 12px;
		padding: 6px 12px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s ease-out;
	}

	.debug-reset:hover,
	.debug-close:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.debug-close {
		background-color: var(--cta-bg);
		color: #FFFFFF;
		margin-top: 4px;
	}

	.debug-close:hover {
		opacity: 0.9;
		background-color: var(--cta-bg);
	}

	.debug-info {
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 11px;
		color: var(--text-color);
		opacity: 0.6;
		margin: 0;
		text-align: center;
	}

	@media (max-width: 768px) {
		.debug-controller {
			top: 8px;
			right: 8px;
			left: 8px;
			min-width: auto;
		}
	}
</style>

