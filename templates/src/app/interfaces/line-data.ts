export interface LineData {
    poles: PoleDetails[];
    direction: boolean;
    startStopName: string;
    endStopName: string;
    shapes: Shapes[];
}

export interface PoleDetails {
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
