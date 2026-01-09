import { PUBLIC_SUBMISSION_ENDPOINT } from '$env/static/public';

export interface SubmissionData {
	name: string;
	destinations: string[];
}

export async function submitToAirtable(data: SubmissionData): Promise<{ success: boolean; error?: string }> {
	const endpoint = PUBLIC_SUBMISSION_ENDPOINT;

	if (!endpoint) {
		console.error('PUBLIC_SUBMISSION_ENDPOINT is not configured. Form submissions are disabled.');
		return {
			success: false,
			error:
				'Form submission is not configured. Please set PUBLIC_SUBMISSION_ENDPOINT in your environment to point to your backend.'
		};
	}

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: errorData.error?.message || `Failed to submit: ${response.statusText}`
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred'
		};
	}
}

