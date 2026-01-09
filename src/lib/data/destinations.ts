export interface DestinationCoordinates {
	latitude: number;
	longitude: number;
}

export const destinationCoordinates: Record<string, DestinationCoordinates> = {
	taiwan: {
		latitude: 23.6978,
		longitude: 120.9605
	},
	yogyakarta: {
		latitude: -7.7956,
		longitude: 110.3695
	},
	'kuala-lumpur': {
		latitude: 3.139,
		longitude: 101.6869
	},
	komodo: {
		latitude: -8.52,
		longitude: 119.55
	},
	kinabatangan: {
		latitude: 5.3,
		longitude: 118.3
	},
	bromo: {
		latitude: -7.9425,
		longitude: 112.953
	},
	bali: {
		latitude: -8.7075,
		longitude: 115.2625
	}
};

