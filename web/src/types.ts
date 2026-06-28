export interface Vulcanizer {
  id: string;
  business_name: string;
  owner_name?: string;
  phone: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_open: boolean;
  verified: boolean;
  rating: number;
  services: string[];
  distance_meters: number;
}
