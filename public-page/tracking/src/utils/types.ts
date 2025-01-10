
export interface Job {
    Description: string
    Duration: number
    End: string
    GeoLatitude: number
    GeoLongitude: number
    ResourceFirstName: string
    ResourceAviURL: string
    Name: string
    Start: string
    UID: string
    SpecialInstructions: string
    Address: string,
    JobStatus: string
}

export interface MarkerData {
    id: number,
    name?: string,
    hidden: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any,
    position: Position
}

export interface Position {
    lat: number,
    lng: number    
}

export interface Config {
    UID: string,
    Name: string,
    BrandPrimaryColour: string,
    ResourceName: string,
    JobName: string,
    GoogleMapsAPIKey: string,
    SupportPhone: string,
    LogoURL: string
    BrandSecondaryColour: string
}

