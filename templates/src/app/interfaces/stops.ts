export interface StopsInfo {
    name: string;
    latitude: number;
    longitude: number;
    on_demand: boolean;
    id: string;
}

export interface Stops {
    directionSwapped: boolean,
    directionBeginning: string,
    directionDestination: string,
    stops: StopsInfo[];
}
