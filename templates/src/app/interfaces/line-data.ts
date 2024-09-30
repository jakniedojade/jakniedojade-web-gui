export interface LineData {
    poles: PolesDetails[];
    direction: boolean;
    startStopName: string;
    endStopName: string;
    shapes: Shapes[];
}

export interface PolesDetails {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    onDemand: boolean;
}

export interface Shapes {
    distanceTraveled: number;
    latitude: number;
    longitude: number;
}
