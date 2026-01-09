<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { submitToAirtable } from '../utils/airtable';
	import type { Destination } from '../data/itinerary';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import SoutheastAsiaMap from './SoutheastAsiaMap.svelte';

	export let destinations: Destination[];
	export let open: boolean = false;
	export let onClose: () => void;

	let name: string = '';
	let selectedDestinations: Set<string> = new Set();
	let isSubmitting: boolean = false;
	let message: { type: 'success' | 'error'; text: string } | null = null;
	let isMobile: boolean = false;
	let scrollY: number = 0;

	// Lock body scroll when modal is open (browser only)
	$: if (browser && open) {
		// Save current scroll position
		scrollY = window.scrollY;
		// Lock body scroll
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';
	} else if (browser && !open && scrollY > 0) {
		// Restore body scroll
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';
		document.body.style.overflow = '';
		// Restore scroll position
		window.scrollTo(0, scrollY);
	}

	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth <= 1024;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) {
				onClose();
			}
		};
		window.addEventListener('keydown', handleEscape);
		
		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('keydown', handleEscape);
		};
	});

	onDestroy(() => {
		// Ensure body scroll is restored when component is destroyed (browser only)
		if (browser) {
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
		}
	});

	function toggleDestination(id: string) {
		if (selectedDestinations.has(id)) {
			selectedDestinations.delete(id);
		} else {
			selectedDestinations.add(id);
		}
		selectedDestinations = selectedDestinations; // Trigger reactivity
	}

	async function handleSubmit() {
		if (!name.trim()) {
			message = { type: 'error', text: 'Please enter your name' };
			return;
		}

		if (selectedDestinations.size === 0) {
			message = { type: 'error', text: 'Please select at least one destination' };
			return;
		}

		isSubmitting = true;
		message = null;

		const result = await submitToAirtable({
			name: name.trim(),
			destinations: Array.from(selectedDestinations)
		});

		isSubmitting = false;

		if (result.success) {
			message = { type: 'success', text: 'Thanks for your interest! I\'ll reach out soon.' };
			setTimeout(() => {
				onClose();
				// Reset form
				name = '';
				selectedDestinations = new Set();
				message = null;
			}, 2000);
		} else {
			message = { type: 'error', text: result.error || 'Failed to submit. Please try again.' };
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
	
	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClose();
		}
	}
</script>

{#if open}
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		transition:fade={{ duration: 200 }}
	>
		<button
			class="modal-backdrop"
			on:click={handleBackdropClick}
			on:keydown={handleBackdropKeydown}
			aria-label="Close modal"
		></button>
		<div
		class="modal-content"
		class:mobile={isMobile}
		transition:fly={{ y: isMobile ? 300 : 0, duration: 300 }}
	>
			<button class="modal-close" class:hide-mobile={isMobile} on:click={onClose} aria-label="Close modal">×</button>

			<div class="modal-placeholder">
				<SoutheastAsiaMap {selectedDestinations} />
			</div>

			<div class="modal-form">
				<h2 class="modal-title" class:hide-mobile={isMobile}>Join Abhishek on his recharge</h2>
				<div class="form-group">
					<p class="modal-question">Which trip do you want to join?</p>
					<div class="checkbox-list">
						{#each destinations.filter(d => !d.isSummary).sort((a, b) => {
							// Order: Taiwan, Kinabatangan, Yogyakarta, Komodo, Bromo, Bali
							const order = ['taiwan', 'kinabatangan', 'yogyakarta', 'komodo', 'bromo', 'bali'];
							return order.indexOf(a.id) - order.indexOf(b.id);
						}) as destination}
							<div class="checkbox-item" class:checked={selectedDestinations.has(destination.id)}>
								<input
									type="checkbox"
									id={destination.id}
									checked={selectedDestinations.has(destination.id)}
									on:change={() => toggleDestination(destination.id)}
								/>
								<label for={destination.id}>
									{destination.title} ({destination.dates})
								</label>
							</div>
						{/each}
					</div>
				</div>

				<div class="form-group">
					<label for="name" class="form-label">Your name</label>
					<input
						type="text"
						id="name"
						class="form-input"
						placeholder="So I can reach out for further planning!"
						bind:value={name}
						disabled={isSubmitting}
					/>
				</div>

				<button
					class="form-submit"
					on:click={handleSubmit}
					disabled={isSubmitting || !name.trim() || selectedDestinations.size === 0}
				>
					{isSubmitting ? 'Submitting...' : 'Submit'}
				</button>

				{#if message}
					<div 
						class="form-message" 
						class:success={message.type === 'success'} 
						class:error={message.type === 'error'}
						transition:fade={{ duration: 200 }}
					>
						{message.text}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-content.mobile {
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.modal-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		border: none;
		background: transparent;
		cursor: default;
		padding: 0;
		margin: 0;
		z-index: -1;
	}
	
	.modal-content {
		position: relative;
		z-index: 1;
	}


	.checkbox-item {
		transition: transform 0.15s ease-out;
		will-change: transform;
		overflow: visible;
	}

	.checkbox-item.checked {
		transform: scale(1.01);
	}

	.checkbox-item input[type="checkbox"] {
		transition: none;
	}

	.checkbox-item label {
		transition: color 0.2s ease-out;
	}

	.checkbox-item.checked label {
		color: var(--cta-bg);
	}

	@media (prefers-reduced-motion: reduce) {
		.checkbox-item {
			transition: none;
		}

		.checkbox-item.checked {
			transform: none;
		}
	}
</style>

