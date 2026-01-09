<script lang="ts">
	import { onMount } from 'svelte';
	import { destinationCoordinates } from '../data/destinations';
	import 'leaflet/dist/leaflet.css';

	export let selectedDestinations: Set<string> = new Set();

	let mapContainer: HTMLDivElement;
	let map: any = null;
	let markers: Map<string, { outer: any; inner: any }> = new Map();
	let L: typeof import('leaflet') | null = null;

	const brightColor = '#4a9d5f';

	onMount(async () => {
		if (!mapContainer) return;

		const leafletModule = await import('leaflet');
		L = leafletModule;

		// Initialize map
		map = L.map(mapContainer, {
			center: [8, 110],
			zoom: 4,
			zoomControl: false,
			attributionControl: false
		});

		// Add tile layer
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '',
			subdomains: 'abcd',
			maxZoom: 19
		}).addTo(map);

		// Set background color
		mapContainer.style.backgroundColor = '#1C1C1C';

		// Apply color filter to tiles
		map.on('tileload', () => {
			const tiles = mapContainer.querySelectorAll('.leaflet-tile-container img');
			tiles.forEach((img: any) => {
				img.style.filter = 'brightness(0.9) contrast(1.1) saturate(0) invert(1)';
			});
		});

		// Create markers for each destination (excluding kuala-lumpur)
		Object.entries(destinationCoordinates)
			.filter(([id]) => id !== 'kuala-lumpur')
			.forEach(([id, coords]) => {
				const outerCircle = L!.circleMarker([coords.latitude, coords.longitude], {
					radius: 0,
					fillColor: brightColor,
					color: brightColor,
					weight: 0,
					opacity: 0,
					fillOpacity: 0,
					pane: 'overlayPane'
				});

				const innerCircle = L!.circleMarker([coords.latitude, coords.longitude], {
					radius: 0,
					fillColor: brightColor,
					color: brightColor,
					weight: 0,
					opacity: 0,
					fillOpacity: 0,
					pane: 'overlayPane'
				});

				outerCircle.addTo(map);
				innerCircle.addTo(map);

				markers.set(id, { outer: outerCircle, inner: innerCircle });
			});

		updateMarkers();
	});

	function animateMarker(marker: any, startRadius: number, endRadius: number, startOpacity: number, endOpacity: number, color: string) {
		const duration = 300; // 300ms animation
		const startTime = performance.now();
		
		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Ease-in-out function
			const easeInOut = progress < 0.5
				? 2 * progress * progress
				: 1 - Math.pow(-2 * progress + 2, 2) / 2;
			
			const currentRadius = startRadius + (endRadius - startRadius) * easeInOut;
			const currentOpacity = startOpacity + (endOpacity - startOpacity) * easeInOut;
			
			marker.setRadius(currentRadius);
			marker.setStyle({
				opacity: currentOpacity,
				fillOpacity: currentOpacity,
				color: color,
				fillColor: color,
				weight: currentRadius > 0 ? 2 : 0
			});
			
			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				// Ensure final state is exactly as intended
				marker.setRadius(endRadius);
				marker.setStyle({
					opacity: endOpacity,
					fillOpacity: endOpacity,
					color: color,
					fillColor: color,
					weight: endRadius > 0 ? 2 : 0
				});
			}
		}
		
		requestAnimationFrame(animate);
	}

	function updateMarkers() {
		if (!map || markers.size === 0 || !L) return;

		const destinationIds = Object.keys(destinationCoordinates).filter(id => id !== 'kuala-lumpur');
		const showKualaLumpur = selectedDestinations.has('yogyakarta');
		const klMarker = markers.get('kuala-lumpur');

		// Handle Kuala Lumpur marker
		if (showKualaLumpur && !klMarker) {
			const klCoords = destinationCoordinates['kuala-lumpur'];
			
			const outerCircle = L.circleMarker([klCoords.latitude, klCoords.longitude], {
				radius: 0,
				opacity: 0,
				fillOpacity: 0,
				color: brightColor,
				fillColor: brightColor,
				weight: 2,
				pane: 'overlayPane'
			});
			
			const innerCircle = L.circleMarker([klCoords.latitude, klCoords.longitude], {
				radius: 0,
				opacity: 0,
				fillOpacity: 0,
				color: brightColor,
				fillColor: brightColor,
				weight: 2,
				pane: 'overlayPane'
			});
			
			outerCircle.addTo(map);
			innerCircle.addTo(map);
			markers.set('kuala-lumpur', { outer: outerCircle, inner: innerCircle });
			
			// Animate appearance
			animateMarker(outerCircle, 0, 14, 0, 0.3, brightColor);
			animateMarker(innerCircle, 0, 6, 0, 1, brightColor);
		} else if (!showKualaLumpur && klMarker) {
			// Animate disappearance before removing
			const currentOuterRadius = klMarker.outer.getRadius();
			const currentInnerRadius = klMarker.inner.getRadius();
			animateMarker(klMarker.outer, currentOuterRadius, 0, 0.3, 0, brightColor);
			animateMarker(klMarker.inner, currentInnerRadius, 0, 1, 0, brightColor);
			
			// Remove after animation completes
			setTimeout(() => {
				if (!selectedDestinations.has('yogyakarta')) {
					map.removeLayer(klMarker.outer);
					map.removeLayer(klMarker.inner);
					markers.delete('kuala-lumpur');
				}
			}, 300);
		}

		// Update all destination markers
		destinationIds.forEach((id) => {
			const marker = markers.get(id);
			if (!marker) return;

			const isSelected = selectedDestinations.has(id);
			const currentOuterRadius = marker.outer.getRadius();
			const currentInnerRadius = marker.inner.getRadius();
			
			// Only animate if state has actually changed
			const shouldBeVisible = isSelected;
			const isCurrentlyVisible = currentOuterRadius > 0;
			
			if (shouldBeVisible && !isCurrentlyVisible) {
				// Animate appearance with ease-in-out
				animateMarker(marker.outer, 0, 14, 0, 0.3, brightColor);
				animateMarker(marker.inner, 0, 6, 0, 1, brightColor);
			} else if (!shouldBeVisible && isCurrentlyVisible) {
				// Animate disappearance with ease-in-out
				animateMarker(marker.outer, currentOuterRadius, 0, 0.3, 0, brightColor);
				animateMarker(marker.inner, currentInnerRadius, 0, 1, 0, brightColor);
			} else if (!shouldBeVisible && !isCurrentlyVisible) {
				// Already hidden - ensure it stays completely hidden
				marker.outer.setRadius(0);
				marker.outer.setStyle({
					opacity: 0,
					fillOpacity: 0,
					weight: 0
				});
				marker.inner.setRadius(0);
				marker.inner.setStyle({
					opacity: 0,
					fillOpacity: 0,
					weight: 0
				});
			} else if (shouldBeVisible && isCurrentlyVisible) {
				// Already visible and should be visible - just ensure colors are correct
				marker.outer.setStyle({
					color: brightColor,
					fillColor: brightColor,
					weight: 2
				});
				marker.inner.setStyle({
					color: brightColor,
					fillColor: brightColor,
					weight: 2
				});
			}
		});
	}

	// React to selection changes - convert Set to Array to trigger reactivity
	$: selectedArray = Array.from(selectedDestinations);
	$: if (map && selectedArray !== undefined) {
		updateMarkers();
	}
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
		border-radius: var(--border-radius);
		overflow: hidden;
		background-color: #1C1C1C;
	}

	:global(.leaflet-container) {
		background-color: #1C1C1C !important;
	}

	:global(.leaflet-tile-container img) {
		filter: brightness(0.9) contrast(1.1) saturate(0) invert(1) !important;
	}

	:global(.leaflet-overlay-pane) {
		z-index: 400 !important;
		filter: none !important;
		mix-blend-mode: normal !important;
	}

	:global(.leaflet-marker-pane) {
		z-index: 600 !important;
		filter: none !important;
		mix-blend-mode: normal !important;
	}
</style>