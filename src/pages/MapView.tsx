import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  GoogleMap, 
  Marker, 
  InfoWindow, 
  useLoadScript,
  HeatmapLayer
} from '@react-google-maps/api';
import axios from 'axios';

// Type for ULB mapping
type ULBMapping = {
  [key: string]: string[];
};

// Districts and ULBs mapping
const DISTRICTS = [
  'Anantapur District',
  'Annamayya District',
  'Bapatla District',
  'Chittoor District',
  'East Godavari District',
  'Eluru District',
  'Guntur District',
  'Kadapa District',
  'Kakinada District',
  'Konaseema District',
  'Krishna District',
  'Kurnool District',
  'Nandyal District',
  'Nellore District',
  'NTR District',
  'Srikakulam District',
  'Vizianagaram District',
  'Parvathipuram Manyam District',
  'Visakhapatnam District',
  'Anakapalli District',
  'West Godavari District',
  'Palnadu District',
  'Prakasam District',
  'Sri Sathya Sai District',
  'Tirupati District'
];

const ULB_BY_DISTRICT: ULBMapping = {
  'Anantapur District': [
    'Ananthapuramu', 'Guntakal', 'Tadipatri', 'Rayadurg', 'Gooty', 'Kalyanadurgam',
  ] as string[],
  'Annamayya District': [
    'Madanapalle', 'Rayachoti', 'Rajampet', 'B.Kothakota',
  ] as string[],
  'Bapatla District': [
    'Bapatla', 'Chirala', 'Addanki', 'Repalle',
  ] as string[],
  'Chittoor District': [
    'Chittoor', 'Punganur', 'Palamaner', 'Nagari', 'Kuppam',
  ] as string[],
  'East Godavari District': [
    'Rajamahendravaram', 'Nidadavole', 'Kovvur',
  ] as string[],
  'Eluru District': [
    'Eluru', 'Jangareddygudem', 'Nuzvid', 'Chintalapudi',
  ] as string[],
  'Guntur District': [
    'Guntur', 'Mangalagiri-Tadepalli', 'Tenali', 'Ponnur',
  ] as string[],
  'Kadapa District': [
    'Kadapa', 'Proddatur', 'Pulivendula', 'Badvel', 'Mydukur', 
    'Jammalamadugu', 'Yerraguntla', 'Kamalapuram',
  ] as string[],
  'Kakinada District': [
    'Kakinada', 'Samalkota', 'Peddapuram', 'Pithapuram', 'Tuni', 
    'Gollaprolu', 'Yeleswaram',
  ] as string[],
  'Konaseema District': [
    'Amalapuram', 'Ramachandrapuram', 'Mandapeta', 'Mummidivaram',
  ] as string[],
  'Krishna District': [
    'Machilipatnam', 'Gudivada', 'YSR Tadigadapa', 'Pedana', 'Vuyyuru',
  ] as string[],
  'Kurnool District': [
    'Kurnool', 'Adoni', 'Yemmiganur', 'Gudur',
  ] as string[],
  'Nandyal District': [
    'Nandyal', 'Dhone', 'Nandikotkur', 'Allagadda', 'Atmakur', 'Bethamcherla',
  ] as string[],
  'Nellore District': [
    'Nellore', 'Kavali', 'Kandukur', 'Atmakur', 'Allur', 'Buchireddypalem',
  ] as string[],
  'NTR District': [
    'Vijayawada', 'Jaggaiahpeta', 'Nandigama', 'Kondapalli', 'Tiruvuru',
  ] as string[],
  'Srikakulam District': [
    'Srikakulam', 'Amudalavalasa', 'Ichapuram', 'Palasa',
  ] as string[],
  'Vizianagaram District': [
    'Vizianagaram', 'Bobbili', 'Rajam', 'Nellimarla',
  ] as string[],
  'Parvathipuram Manyam District': [
    'Palakonda', 'Parvathipuram', 'Salur',
  ] as string[],
  'Visakhapatnam District': [
    'GVMC',
  ] as string[],
  'Anakapalli District': [
    'Yelamanchili', 'Narsipatnam',
  ] as string[],
  'West Godavari District': [
    'Bhimavaram', 'Tadepalligudem', 'Palakol', 'Narasapuram', 'Tanuku', 'Akiveedu',
  ] as string[],
  'Palnadu District': [
    'Gurazala', 'Dachepalli', 'Piduguralla', 'Macherla', 'Sattenapalle', 
    'Chilakaluripet', 'Narasaraopet', 'Vinukonda',
  ] as string[],
  'Prakasam District': [
    'Ongole', 'Markapur', 'Giddalur', 'Chimakurthy', 'Podili', 'Kanigiri', 'Darsi',
  ] as string[],
  'Sri Sathya Sai District': [
    'Dharmavaram', 'Penukonda', 'Hindupur', 'Madakasira', 'Kadiri', 'Puttaparthy',
  ] as string[],
  'Tirupati District': [
    'Tirupathi', 'Srikalahasthi', 'Venkatagiri', 'Sullurpet', 
    'Naidupeta', 'Gudur', 'Puttur',
  ] as string[],
};

// Interface for ULB Dog Count
interface ULBDogData {
  ulb: string;
  district: string;
  latitude: number;
  longitude: number;
  dogCount: number;
}

// Hardcoded coordinates for Tirupati District ULBs
const TIRUPATI_ULB_COORDINATES: {[key: string]: {lat: number, lng: number}} = {
  'Tirupathi': { lat: 13.6288, lng: 79.4192 },
  'Srikalahasthi': { lat: 13.7507, lng: 79.7024 },
  'Venkatagiri': { lat: 13.9524, lng: 79.5840 },
  'Sullurpet': { lat: 13.5504, lng: 79.8732 },
  'Naidupeta': { lat: 13.9054, lng: 79.8732 },
  'Gudur': { lat: 14.0479, lng: 79.8955 },
  'Puttur': { lat: 13.4361, lng: 79.5542 }
};

const MapView: React.FC = () => {
  const [ulbDogData, setULBDogData] = useState<ULBDogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<ULBDogData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [heatmapData, setHeatmapData] = useState<google.maps.visualization.WeightedLocation[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['visualization']
  });

  useEffect(() => {
    const fetchDogData = async () => {
      try {
        const response = await axios.get('https://dog-stray-backend-x7ik.onrender.com/api/getAllDogs');
        const dogs = response.data.dogs;
        // Prepare ULB Counts
        const ulbCounts = dogs.reduce((acc: { [key: string]: ULBDogData }, dog: any) => {
          // Validate coordinates
          let latitude = parseFloat(dog.latitude);
          let longitude = parseFloat(dog.longitude);

          // Use hardcoded coordinates for Tirupati ULBs if coordinates are invalid
          if (dog.district === 'Tirupati District' && 
              (isNaN(latitude) || isNaN(longitude)) && 
              TIRUPATI_ULB_COORDINATES[dog.ulb]) {
            const fallbackCoords = TIRUPATI_ULB_COORDINATES[dog.ulb];
            latitude = fallbackCoords.lat;
            longitude = fallbackCoords.lng;
          }

          // Skip if coordinates are still invalid
          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Invalid coordinates for ULB ${dog.ulb}:`, {
              latitude: dog.latitude, 
              longitude: dog.longitude
            });
            return acc;
          }

          if (!acc[dog.ulb]) {
            acc[dog.ulb] = {
              ulb: dog.ulb,
              district: dog.district,
              latitude: latitude,
              longitude: longitude,
              dogCount: 1
            };
          } else {
            acc[dog.ulb].dogCount += 1;
          }
          return acc;
        }, {});

        const ulbDataArray = Object.values(ulbCounts) as ULBDogData[];
        
        // Prepare Heatmap Data
        const heatmapPoints = ulbDataArray.map(ulb => ({
          location: new google.maps.LatLng(ulb.latitude, ulb.longitude),
          weight: ulb.dogCount
        }));

        setHeatmapData(heatmapPoints);
        setULBDogData(ulbDataArray);
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 
                             err.message || 
                             'An unknown error occurred';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchDogData();
  }, []);

  // Custom Marker Component with Dog Count
  const CustomMarker = ({ ulb, dogCount, onClick }: { 
    ulb: string, 
    dogCount: number, 
    onClick: () => void 
  }) => {
    const markerStyle: React.CSSProperties = {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      backgroundColor: dogCount > 10 ? 'red' : dogCount > 5 ? 'orange' : 'green',
      color: 'white',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      border: '2px solid white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
      cursor: 'pointer'
    };

    return (
      <div style={markerStyle} onClick={onClick}>
        {dogCount}
      </div>
    );
  };

  const mapContainerStyle = {
    width: '100%',
    height: '80vh'
  };

  const center = {
    lat: 14.0479, 
    lng: 80.1
  };

  const zoom = 10;

  if (loading || !isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || loadError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error || 'Error loading map'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 4, sm: 0 }  // mt: 4 for mobile, mt: 8 for tablet and above
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Stray Dogs Sterilisations - ULB Wise Geographical Locations
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showHeatmap}
              onChange={() => setShowHeatmap(!showHeatmap)}
              color="primary"
            />
          }
          label="Show Heatmap"
        />
      </Box>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
      >
        {ulbDogData.map((ulb) => (
          <Marker
            key={ulb.ulb}
            position={{ lat: ulb.latitude, lng: ulb.longitude }}
            label={`${ulb.dogCount}`}
            icon={{
              url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="20" cy="20" r="18" 
                  fill="${ulb.dogCount > 10 ? 'red' : ulb.dogCount > 5 ? 'orange' : 'green'}" 
                  stroke="white" stroke-width="2"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                  fill="white" font-weight="bold" font-size="16">
                  ${ulb.dogCount}
                </text>
              </svg>`
            }}
            onClick={() => setSelectedMarker(ulb)}
          />
        ))}

        {showHeatmap && heatmapData.length > 0 && (
          <>
            <HeatmapLayer 
              data={heatmapData}
              options={{
                radius: 30,
                opacity: 0.7,
                dissipating: true,
                maxIntensity: 65,
                gradient: [
                  'rgba(0, 255, 0, 0)',
                  'rgba(0, 255, 0, 0.4)',
                  'rgba(255, 255, 0, 0.6)', 
                  'rgba(255, 165, 0, 0.8)', 
                  'rgba(255, 0, 0, 1)'
                ]
              }}
            />
            {ulbDogData.map((ulb) => (
              <Marker
                key={ulb.ulb}
                position={{ lat: ulb.latitude, lng: ulb.longitude }}
                icon={{
                  url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
                    <circle cx="25" cy="25" r="22" 
                      fill="${ulb.dogCount > 10 ? 'red' : ulb.dogCount > 5 ? 'orange' : 'green'}" 
                      stroke="white" stroke-width="3"/>
                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                      fill="white" font-weight="bold" font-size="20">
                      ${ulb.dogCount}
                    </text>
                  </svg>`
                }}
                onClick={() => setSelectedMarker(ulb)}
              />
            ))}
          </>
        )}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>{selectedMarker.ulb}</h3>
              <p>District: {selectedMarker.district}</p>
              <p>Number of Dogs: {selectedMarker.dogCount}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
};

export default MapView; 