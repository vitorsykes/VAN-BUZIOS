export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Van {
  id: string;
  driverName: string;
  line: string;
  location: GeoLocation;
  status: 'Em operação' | 'Lotada' | 'Indo para garagem' | 'Fora de serviço';
  seatsAvailable: number;
  speed: number;
  updatedAt: number;
  passengerCount: number;
  active: boolean;
}

export interface Passenger {
  id: string;
  line: string;
  location: GeoLocation;
  status: 'waiting' | 'in_van' | 'arrived';
  vanId: string | null;
  updatedAt: number;
}

export const VAN_LINES = [
  'Rasa',
  'Vila Verde',
  'Cem Braças',
  'São José',
  'Baía Formosa',
  'Centro',
  'Manguinhos',
  'José Gonçalves',
  'Tucuns'
];
