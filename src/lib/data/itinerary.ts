import { base } from '$app/paths';

export interface Destination {
	id: string;
	title: string;
	description: string;
	dates: string;
	image: string;
	columnSpan: number;
	isSummary?: boolean;
	isTall?: boolean;
	isWide?: boolean;
}

export const destinations: Destination[] = [
	{
		id: 'taiwan',
		title: 'Taiwan',
		description: 'Mountain hikes, old mining towns, and dramatic coastline—Yangmingshan, Jiufen, Jinguashi, and Yehliu.',
		dates: 'May 2nd - May 6th',
		image: `${base}/images/taiwan.jpg`,
		columnSpan: 6
	},
	{
		id: 'yogyakarta',
		title: 'Yogyakarta & Kuala Lumpur',
		description: 'Urban Asia meets Javanese culture—food, temples, art.',
		dates: 'May 11th - May 15th',
		image: `${base}/images/yogyakarta.jpg`,
		columnSpan: 6,
		isTall: true
	},
	{
		id: 'komodo',
		title: 'Komodo National Park',
		description: 'Luxury boat journey to pink beaches, island hikes, and Komodo dragons in the wild.',
		dates: 'May 17th - May 20th',
		image: `${base}/images/komodo.jpg`,
		columnSpan: 10,
		isWide: true
	},
	{
		id: 'kinabatangan',
		title: 'Kinabatangan Safari',
		description: 'River safaris through dense rainforest to spot orangutans, proboscis monkeys, birds, and crocodiles.',
		dates: 'May 7th - May 10th',
		image: `${base}/images/kinabatangan.jpg`,
		columnSpan: 4,
		isTall: true
	},
	{
		id: 'bromo',
		title: 'Mount Bromo',
		description: 'Sunrise hike across an active volcano',
		dates: 'May 15th - May 16th',
		image: `${base}/images/bromo.jpg`,
		columnSpan: 4
	},

	{
		id: 'bali',
		title: 'Bali',
		description: 'Deliberate downtime by the sea—runs, yoga, cafés.',
		dates: 'May 20th - May 25th',
		image: `${base}/images/bali.jpg`,
		columnSpan: 6
	},
	{
		id: 'summary',
		title: "That's all.",
		description: 'Rest of the time in north India with family. Back in London, June 8th.',
		dates: '',
		image: '',
		columnSpan: 4,
		isSummary: true
	},
];

