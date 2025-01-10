import {  useEffect, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";

import { MarkerData, Position, } from "./utils/types";

function Map(config: {
  markers: MarkerData[]
  center: Position
  apiKey: string
}) {
  
  const [markers, setMarkers] = useState<MarkerData[]>()
  const [center, setCenter] = useState<Position>()

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: config.apiKey,
  });

  //handles location data
  useEffect(() => {
    setCenter(config.center)
    setMarkers(config.markers)

  }, [config.center, config.markers]);

  return isLoaded && markers ? (
    <>
      <GoogleMap
      center={center}
      zoom={9}
      mapContainerStyle={{ width: "100%", height: "25em" }}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {markers?.map(({ id, icon, position, hidden }) => (
          !hidden ? <Marker
            key={id}
            position={position}
            icon={icon}
          >
          </Marker> : <></>
      ))}
      </GoogleMap>
    </>
  ): (<></>);
}

export default Map;
