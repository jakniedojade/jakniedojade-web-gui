export interface LineData {
    direction: number;
    headsign: string;
    path: {
        type: string;
        coordinates: [number, number][]
    }
    poles: PoleDetails[]
}

export interface PoleDetails {
    id: number;
    name: string;
    position: {
        type: string;
        coordinates: [number, number];
    }
    onDemand: boolean;
}