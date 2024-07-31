export interface StopsInfo {
    name: string;
    latitude: number;
    longitude: number;
    on_demand: boolean;
    id: string;
}

export interface Stops {
    direction: boolean,
    directionBeginning: string,
    directionDestination: string,
    stops: StopsInfo[];
}
