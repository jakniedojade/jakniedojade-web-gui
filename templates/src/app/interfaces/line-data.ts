export interface LineData {
    poles: PoleDetails[];
    direction: boolean;
    startStopName: string;
    endStopName: string;
    shapes: Shape[];
}

export interface PoleDetails {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    onDemand: boolean;
}

export interface Shape {
    distanceTraveled: number;
    latitude: number;
    longitude: number;
}
