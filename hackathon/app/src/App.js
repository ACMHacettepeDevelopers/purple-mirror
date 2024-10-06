import { Fragment, useState, useCallback } from 'react';
import { GoogleMap, Marker, useLoadScript, GroundOverlay } from '@react-google-maps/api';
import axios from 'axios';

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCTr_9M2JzhFcNt0xSIdndldz-DYmpqa94'
  });

  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.39, lng: 35.68 });
  const [tileUrl, setTileUrl] = useState(null);
  const [acquisitionTime, setAcquisitionTime] = useState(null);
  const [nextAcquisitionTime, setNextAcquisitionTime] = useState(null);
  const [satellite, setSatellite] = useState(null);
  const [details, setDetails] = useState(null);
  const [pixelUrl, setPixelUrl] = useState("");

    // Function to convert JSON object to CSV
    const convertToCSV = (data) => {
      const headers = Object.keys(data).join(',') + '\n';
      const values = Object.values(data).join(',') + '\n';
      return headers + values;
    };

  // Function to handle CSV download
  const downloadCSV = () => {
    if (!details) return; // Ensure there are details to download
    const csv = convertToCSV(details);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'satellite_metadata.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMapClick = useCallback((event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();

    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });

    axios.post('http://127.0.0.1:5000/get_image_url', { latitude: lat, longitude: lng })
    .then((response) => {
      console.log("Response Data:", response.data);
      setPixelUrl(response.data);
      console.log("pizel url", pixelUrl)
      
    })
    .catch((error) => {
      console.error("Error fetching pixel url:", error);
    });


    axios.post('http://127.0.0.1:5000/get_image', { latitude: lat, longitude: lng })
      .then((response) => {
        console.log("Response Data:", response.data);
        const { tile_url, metadata, acquisition_time, next_acquisition_time, satellite } = response.data;
        setTileUrl(tile_url);
        setAcquisitionTime(acquisition_time);
        setNextAcquisitionTime(next_acquisition_time);
        setSatellite(satellite);
        setDetails(metadata);
        console.log("pizel url", pixelUrl)
      })
      .catch((error) => {
        console.error("Error fetching satellite data:", error);
      });

  }, []);


  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Fragment >
      <div className='container px-10'>
        <h1 className='text-2xl font-bold'>Satellite Reflectance Map</h1>
        <div className="info-panel">
          {acquisitionTime && <p><strong>Last Acquisition Date: </strong>{acquisitionTime}</p>}
          {nextAcquisitionTime && <p><strong>Next Acquisition Date: </strong>{nextAcquisitionTime}</p>}
          {satellite && <p><strong>Satellite: </strong>{satellite}</p>}
        </div>
        <br/>


        <div class="flex  w-full">
        <div>
        <h1 className='text-2xl font-bold'>Metadata</h1>
        <div class="w-40%">
        {details &&  (
            <>
              <p><strong>Landsat Product Identifier L2: </strong>{details.Landsat_Product_Identifier_L2}</p>
              <p><strong>andsat Product Identifier L1: </strong>L{details.Landsat_Product_Identifier_L1}</p>
              <p><strong>Landsat Scene Identifier: </strong>{details.Landsat_Scene_Identifier}</p>
              <p><strong>Date Acquired: </strong>{details.Date_Acquired}</p>
              <p><strong>Collection Category: </strong>{details.Collection_Category}</p>
              <p><strong>Collection Number: </strong>{details.Collection_Number}</p>
              <p><strong>WRS Path: </strong>{details.WRS_Path}</p>
              <p><strong>WRS Row: </strong>{details.WRS_Row}</p>
              <p><strong>Nadir/Off Nadir: </strong>{details.Nadir_Off_Nadir}</p>
              <p><strong>Roll Angle: </strong>{details.Roll_Angle}</p>
              <p><strong>Date Product Generated L2: </strong>{details.Date_Product_Generated_L2}</p>
              <p><strong>Date Product Generated L1: </strong>{details.Date_Product_Generated_L1}</p>
              <p><strong>Start Time: </strong>{details.Start_Time}</p>
              <p><strong>Stop Time: </strong>{details.Stop_Time}</p>
              <p><strong>Station Identifier: </strong>{details.Station_Identifier}</p>
              <p><strong>Day/Night Indicator: </strong>{details.Day_Night_Indicator}</p>
              <p><strong>Land Cloud Cover: </strong>{details.Land_Cloud_Cover}</p>
              <p><strong>Scene Cloud Cover L1: </strong>{details.Scene_Cloud_Cover_L1}</p>
              <p><strong>Ground Control Points Model: </strong>{details.Ground_Control_Points_Model}</p>
              <p><strong>Ground Control Points Version: </strong>{details.Ground_Control_Points_Version}</p>
              <p><strong>Geometric RMSE Model: </strong>{details.Geometric_RMSE_Model}</p>
              <p><strong>Geometric RMSE Model X: </strong>{details.Geometric_RMSE_Model_X}</p>
              <p><strong>Geometric RMSE Model Y: </strong>{details.Geometric_RMSE_Model_Y}</p>
              <p><strong>Processing Software Version: </strong>{details.Processing_Software_Version}</p>
              <p><strong>Sun Elevation L0RA: </strong>{details.Sun_Elevation_L0RA}</p>
              <p><strong>Sun Azimuth L0RA: </strong>{details.Sun_Azimuth_L0RA}</p>
              <p><strong>Data Type L2: </strong>{details.Data_Type_L2}</p>
              <p><strong>Sensor Identifier: </strong>{details.Sensor_Identifier}</p>
              <p><strong>Satellite: </strong>{details.Satellite}</p>
              </>
          )}
        </div>
        </div>

        <br/>
        <br/>

        <div>
        <h1 className='text-2xl font-bold px-10'>Landsat Scene</h1>
        <div class="px-10 flex justify-center items-center w-ful">
          {pixelUrl ? ( <img src={pixelUrl} alt="Dynamic Image" className='w-full h-auto block max-w-screen-md'/>) : (<p>URL not available</p>)}
        </div>
        </div>
        <button onClick={downloadCSV} className="mt-4 p-2 h-10 bg-blue-500 text-white rounded">
              Download as CSV
            </button>
        </div>

        <br/>
        <br/>

        <div style={{ width: "100%", height: "90vh" }}>
          <GoogleMap
            center={mapCenter}
            zoom={5}
            mapContainerStyle={{ width: "100%", height: "90vh" }}
            onClick={handleMapClick}
          >
            {markerPosition && <Marker position={markerPosition} />}

            {tileUrl && (
              <GroundOverlay
                url={tileUrl}
                bounds={{
                  north: mapCenter.lat + 0.1,
                  south: mapCenter.lat - 0.1,
                  east: mapCenter.lng + 0.1,
                  west: mapCenter.lng - 0.1
                }}
                opacity={0.6}
              />
            )}
          </GoogleMap>
        </div>
      </div>
      <br/>
      <br/>
    </Fragment>
  );
}

export default App;
