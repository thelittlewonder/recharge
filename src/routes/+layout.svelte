<script>
	import '../app.css';
	import { base } from '$app/paths';
	
	const siteTitle = "Abhishek's recharge";
	const siteDescription = "Read about abhishek's recharge plan and let him know if you want to join";
	
	// Construct OG image URL - use environment variable for full domain, or construct from base
	// For production, set PUBLIC_SITE_URL in your environment (e.g., https://yourusername.github.io)
	const siteUrl = import.meta.env.PUBLIC_SITE_URL || '';
	const ogImage = siteUrl 
		? `${siteUrl}${base}/images/bali.jpg`
		: `${base}/images/bali.jpg`; // Fallback to relative path
</script>

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={siteTitle} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:image" content={ogImage} />
	{#if siteUrl}
		<meta property="og:url" content={siteUrl + base} />
	{/if}
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteTitle} />
	<meta name="twitter:description" content={siteDescription} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<svelte:options>
	accessors = true
</svelte:options>

<div>
	<slot />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>

