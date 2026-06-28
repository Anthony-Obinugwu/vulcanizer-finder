import { Vulcanizer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const fetchNearbyVulcanizers = async (latitude: number, longitude: number): Promise<Vulcanizer[]> => {
  const response = await fetch(`${API_URL}/vulcanizers/nearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch nearby vulcanizers');
  }

  return response.json();
};
