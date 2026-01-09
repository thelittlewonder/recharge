<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

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
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const start = new Date(TRIP_START);
		start.setHours(0, 0, 0, 0);
		const diffTime = start.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	function getDaysUntilBack(): number {
		const today = new Date();
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

	function updateState() {
		currentDate = new Date();
		const today = new Date();
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
	});

	let imageLoaded = false;
	let imageElement: HTMLImageElement;

	function handleImageLoad() {
		imageLoaded = true;
	}

	function handleImageError() {
		imageLoaded = true;
	}

	// Reset image loaded state when location changes
	$: if (location) {
		imageLoaded = false;
		// Check if image is already loaded (cached) after a brief delay
		setTimeout(() => {
			if (imageElement && imageElement.complete && imageElement.naturalHeight !== 0) {
				imageLoaded = true;
			}
		}, 0);
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
</script>

<div class="track-container">
	{#if isBeforeTrip}
		<!-- Empty state: Before trip -->
		<div class="empty-state">
			<h1 class="empty-title">
				Abhishek's recharge is {daysUntilTrip} {daysUntilTrip === 1 ? 'day' : 'days'} away
			</h1>
		</div>
		<div class="button-container">
			<button class="cta-button" on:click={handleBackToRecharge}>See the plan</button>
		</div>
		<p class="meta-text">Away from May 2 - June 7.</p>
	{:else if isAfterTrip}
		<!-- Empty state: After trip -->
		<div class="empty-state">
			<h1 class="empty-title">Abhishek's recharge is over.</h1>
		</div>
		<div class="button-container">
			<button class="cta-button" on:click={handleInstagramButton}>Stalk stories on Instagram</button>
		</div>
		<p class="meta-text">Back in business officially, June 8th</p>
	{:else if location}
		<!-- Location card during trip -->
		<div class="location-card">
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
		<div class="button-container">
			<button class="cta-button" on:click={handleCallButton}>Call Abhishek if it's urgent</button>
		</div>
		<p class="meta-text">{daysUntilBack} {daysUntilBack === 1 ? 'day' : 'days'} until he's back to work</p>
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

	.meta-text {
		font-family: 'Google Sans Flex', sans-serif;
		font-size: 14px;
		color: var(--text-color);
		opacity: 0.5;
		margin-top: 12px;
		text-align: center;
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
	}
</style>

