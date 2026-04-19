import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

// ============================================================
// PRE-CACHED VENUE DATABASE (Coordinates + REAL Capacity)
// Sources: Wikipedia, official stadium websites
// ============================================================
const VENUE_DB = {
  // India Cricket
  'wankhede stadium': { lat: 18.9388, lon: 72.8258, capacity: 33108 },
  'narendra modi stadium': { lat: 23.0915, lon: 72.5976, capacity: 132000 },
  'eden gardens': { lat: 22.5646, lon: 88.3433, capacity: 66000 },
  'chinnaswamy stadium': { lat: 12.9788, lon: 77.5996, capacity: 40000 },
  'm.chinnaswamy stadium': { lat: 12.9788, lon: 77.5996, capacity: 40000 },
  'arun jaitley stadium': { lat: 28.6377, lon: 77.2433, capacity: 41000 },
  'ma chidambaram stadium': { lat: 13.0629, lon: 80.2792, capacity: 50000 },
  'rajiv gandhi international cricket stadium': { lat: 17.4065, lon: 78.5507, capacity: 55000 },
  'sawai mansingh stadium': { lat: 26.8933, lon: 75.8048, capacity: 30000 },
  'ekana cricket stadium': { lat: 26.9490, lon: 80.9473, capacity: 50000 },
  'bharat ratna shri atal bihari vajpayee ekana cricket stadium': { lat: 26.9490, lon: 80.9473, capacity: 50000 },
  'maharaja yadavindra singh international cricket stadium': { lat: 30.6772, lon: 76.7315, capacity: 27000 },
  'is bindra stadium': { lat: 30.6772, lon: 76.7315, capacity: 27000 },
  'himachal pradesh cricket association stadium': { lat: 32.1084, lon: 76.5349, capacity: 23000 },
  'barabati stadium': { lat: 20.4586, lon: 85.8336, capacity: 45000 },
  'dr. dy patil sports academy': { lat: 19.0451, lon: 73.0255, capacity: 55000 },
  // Pakistan Cricket
  'national stadium karachi': { lat: 24.8923, lon: 67.0655, capacity: 34228 },
  'gaddafi stadium': { lat: 31.5131, lon: 74.3396, capacity: 27000 },
  'rawalpindi cricket stadium': { lat: 33.5975, lon: 73.0551, capacity: 15000 },
  'multan cricket stadium': { lat: 30.1882, lon: 71.4488, capacity: 35000 },
  // UK Football
  'wembley stadium': { lat: 51.5560, lon: -0.2795, capacity: 90000 },
  'old trafford': { lat: 53.4631, lon: -2.2913, capacity: 74310 },
  'anfield': { lat: 53.4309, lon: -2.9608, capacity: 61276 },
  'emirates stadium': { lat: 51.5549, lon: -0.1084, capacity: 60704 },
  'stamford bridge': { lat: 51.4816, lon: -0.1909, capacity: 40343 },
  'etihad stadium': { lat: 53.4831, lon: -2.2004, capacity: 53400 },
  'tottenham hotspur stadium': { lat: 51.6042, lon: -0.0662, capacity: 62850 },
  'goodison park': { lat: 53.4388, lon: -2.9664, capacity: 39414 },
  'st james\' park': { lat: 54.9755, lon: -1.6217, capacity: 52305 },
  'elland road': { lat: 53.7779, lon: -1.5722, capacity: 37890 },
  'london stadium': { lat: 51.5387, lon: -0.0166, capacity: 62500 },
  'molineux stadium': { lat: 52.5904, lon: -2.1306, capacity: 31750 },
  'villa park': { lat: 52.5092, lon: -1.8847, capacity: 42657 },
  'the city ground': { lat: 52.9399, lon: -1.1325, capacity: 30445 },
  'selhurst park': { lat: 51.3983, lon: -0.0855, capacity: 25486 },
  'portman road': { lat: 52.0546, lon: 1.1447, capacity: 30311 },
  'kenilworth road': { lat: 51.8842, lon: -0.4316, capacity: 10356 },
  // Spain Football  
  'camp nou': { lat: 41.3809, lon: 2.1228, capacity: 99354 },
  'santiago bernabeu': { lat: 40.4531, lon: -3.6883, capacity: 85000 },
  'civitas metropolitano': { lat: 40.4362, lon: -3.5993, capacity: 70460 },
  'balaidos': { lat: 42.2118, lon: -8.7395, capacity: 31800 },
  // Germany Football
  'allianz arena': { lat: 48.2188, lon: 11.6247, capacity: 75000 },
  'signal iduna park': { lat: 51.4926, lon: 7.4518, capacity: 81365 },
  // Italy Football
  'san siro': { lat: 45.4781, lon: 9.1240, capacity: 75923 },
  'stadio olimpico': { lat: 41.9340, lon: 12.4547, capacity: 70634 },
  'allianz stadium': { lat: 45.1096, lon: 7.6413, capacity: 41507 },
  // France Football
  'stade de france': { lat: 48.9245, lon: 2.3600, capacity: 80698 },
  'parc des princes': { lat: 48.8414, lon: 2.2530, capacity: 47929 },
  // USA
  'metlife stadium': { lat: 40.8128, lon: -74.0742, capacity: 82500 },
  'madison square garden': { lat: 40.7505, lon: -73.9934, capacity: 19812 },
  'at&t stadium': { lat: 32.7473, lon: -97.0945, capacity: 80000 },
  'sofi stadium': { lat: 33.9535, lon: -118.3392, capacity: 70240 },
  'yankee stadium': { lat: 40.8296, lon: -73.9262, capacity: 46537 },
  'fenway park': { lat: 42.3467, lon: -71.0972, capacity: 37755 },
  'dodger stadium': { lat: 34.0739, lon: -118.2400, capacity: 56000 },
  'oracle park': { lat: 37.7786, lon: -122.3893, capacity: 41265 },
  'wrigley field': { lat: 41.9484, lon: -87.6553, capacity: 41649 },
  'chase field': { lat: 33.4453, lon: -112.0667, capacity: 48519 },
  'great american ball park': { lat: 39.0974, lon: -84.5082, capacity: 42319 },
  'inter&co stadium': { lat: 28.5412, lon: -81.3894, capacity: 25500 },
  'subaru park': { lat: 39.8328, lon: -75.3787, capacity: 18500 },
  'td garden': { lat: 42.3662, lon: -71.0621, capacity: 19156 },
  'crypto.com arena': { lat: 34.0430, lon: -118.2673, capacity: 19068 },
  'united center': { lat: 41.8807, lon: -87.6742, capacity: 20917 },
  'chase center': { lat: 37.7680, lon: -122.3877, capacity: 18064 },
  'barclays center': { lat: 40.6826, lon: -73.9754, capacity: 17732 },
  'citi field': { lat: 40.7571, lon: -73.8458, capacity: 41922 },
  'tropicana field': { lat: 27.7682, lon: -82.6534, capacity: 25000 },
  'globe life field': { lat: 32.7512, lon: -97.0832, capacity: 40300 },
  'target field': { lat: 44.9817, lon: -93.2776, capacity: 38544 },
  'minute maid park': { lat: 29.7573, lon: -95.3555, capacity: 41168 },
  'american family field': { lat: 43.0280, lon: -87.9712, capacity: 41900 },
  't-mobile park': { lat: 47.5914, lon: -122.3324, capacity: 47929 },
  'petco park': { lat: 32.7076, lon: -117.1570, capacity: 40162 },
  'angel stadium': { lat: 33.8003, lon: -117.8827, capacity: 45517 },
  'citizens bank park': { lat: 39.9061, lon: -75.1665, capacity: 42792 },
  'busch stadium': { lat: 38.6226, lon: -90.1928, capacity: 44383 },
  'rogers centre': { lat: 43.6414, lon: -79.3894, capacity: 49282 },
  'pnc park': { lat: 40.4469, lon: -80.0057, capacity: 38362 },
  'comerica park': { lat: 42.3390, lon: -83.0485, capacity: 41083 },
  'truist park': { lat: 33.8907, lon: -84.4678, capacity: 41084 },
  // Brazil
  'maracana': { lat: -22.9122, lon: -43.2302, capacity: 78838 },
  // Australia
  'melbourne cricket ground': { lat: -37.8199, lon: 144.9834, capacity: 100024 },
  'mcg': { lat: -37.8199, lon: 144.9834, capacity: 100024 },
  'scg': { lat: -33.8916, lon: 151.2247, capacity: 48000 },
  'perth stadium': { lat: -31.9512, lon: 115.8892, capacity: 60000 },
  'optus stadium': { lat: -31.9512, lon: 115.8892, capacity: 60000 },
  'adelaide oval': { lat: -34.9155, lon: 138.5961, capacity: 53583 },
  'gabba': { lat: -27.4858, lon: 153.0381, capacity: 42000 },
  'marvel stadium': { lat: -37.8163, lon: 144.9475, capacity: 53359 },
  // Japan
  'tokyo dome': { lat: 35.7056, lon: 139.7519, capacity: 55000 },
  'meiji jingu stadium': { lat: 35.6744, lon: 139.7168, capacity: 37933 },
  'mizuho paypal dome fukuoka': { lat: 33.5952, lon: 130.3622, capacity: 38585 },
  'mizuho paypal dome': { lat: 33.5952, lon: 130.3622, capacity: 38585 },
  'mizuho paypal dome, fukuoka': { lat: 33.5952, lon: 130.3622, capacity: 38585 },
  'mazda zoom-zoom stadium hiroshima': { lat: 34.3915, lon: 132.4847, capacity: 33000 },
  'kyocera dome osaka': { lat: 34.6694, lon: 135.4755, capacity: 36477 },
  'zozo marine stadium': { lat: 35.6453, lon: 140.0310, capacity: 30000 },
  // South Korea
  'daejeon hanbat baseball stadium': { lat: 36.3175, lon: 127.4286, capacity: 13000 },
  'jamsil baseball stadium': { lat: 37.5122, lon: 127.0719, capacity: 25000 },
  'gocheok sky dome': { lat: 37.4982, lon: 126.8671, capacity: 16813 },
  // South Africa
  'newlands': { lat: -33.9273, lon: 18.4737, capacity: 25000 },
  'wanderers stadium': { lat: -26.1327, lon: 28.0569, capacity: 34000 },
  'supersport park': { lat: -25.7448, lon: 28.2114, capacity: 22000 },
  // Other
  'harare sports club': { lat: -17.7939, lon: 31.0454, capacity: 10000 },
  'junction oval': { lat: -37.8540, lon: 144.9840, capacity: 6000 },
};

// Convert UTC time string (HH:MM:SS) + date to user's local time
const utcToLocal = (utcTime, dateStr) => {
  if (!utcTime) return '';
  try {
    const [h, m] = utcTime.split(':').map(Number);
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(h, m, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return utcTime; }
};

// Fuzzy match venue name in cache — returns { lat, lon, capacity }
const findCachedVenue = (venueName) => {
  if (!venueName) return null;
  const lower = venueName.toLowerCase().trim();
  
  // Direct match
  if (VENUE_DB[lower]) return VENUE_DB[lower];
  
  // Partial match
  for (const [key, data] of Object.entries(VENUE_DB)) {
    if (lower.includes(key) || key.includes(lower.substring(0, 10))) return data;
  }
  return null;
};

const getCartesianCoordinates = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const MovingSpaceParticles = () => {
  return (
    <group>
      {/* Tiny background stars moving gently */}
      <Sparkles 
        count={3000} 
        scale={300} 
        size={2} 
        speed={0.5} 
        opacity={0.6} 
        color="#ffffff" 
      />
      {/* Medium astroid-like particles moving faster towards the user */}
      <Sparkles 
        count={600} 
        scale={200} 
        size={6} 
        speed={1.5} 
        opacity={0.8} 
        color="#b4c8ff" 
      />
      {/* Large colorful space debris moving very fast */}
      <Sparkles 
        count={150} 
        scale={100} 
        size={12} 
        speed={2.5} 
        opacity={0.5} 
        color="#8a2be2" 
      />
    </group>
  );
};

const CustomGlobe = ({ stadiums, onHover, onClick, hoveredStadium }) => {
  const globeRadius = 25;
  const groupRef = useRef();
  const [earthMap, setEarthMap] = useState(null);

  useEffect(() => {
    new THREE.TextureLoader().load('/world.jpg', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      setEarthMap(texture);
    });
  }, []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[globeRadius, 64, 64]} />
        {earthMap ? (
          <meshStandardMaterial key="textured" map={earthMap} roughness={0.7} metalness={0.2} transparent={false} />
        ) : (
          <meshStandardMaterial key="solid" color="#000d1a" roughness={0.7} metalness={0.2} />
        )}
      </mesh>

      {stadiums.map((s) => {
        if (!s.lat || !s.lon) return null;
        const pos = getCartesianCoordinates(parseFloat(s.lat), parseFloat(s.lon), globeRadius + 0.5);
        const isHov = hoveredStadium?.id === s.id;
        const isLive = s.isLive;
        const color = isLive ? '#ff2a2a' : '#00ff88';

        return (
          <group key={s.id} position={pos} onPointerOver={() => onHover(s)} onPointerOut={() => onHover(null)} onClick={() => onClick(s)}>
            <mesh><sphereGeometry args={[isHov ? 0.8 : 0.4, 16, 16]} /><meshBasicMaterial color={color} /></mesh>
            {isLive && <mesh><sphereGeometry args={[0.8, 16, 16]} /><meshBasicMaterial color={color} transparent opacity={0.35} /></mesh>}
            <Html distanceFactor={100} zIndexRange={[100, 0]}>
              <div className={`scene-label ${isLive ? 'active-pulse' : ''}`}
                style={{ pointerEvents: 'none', display: isHov ? 'block' : 'none', border: `1px solid ${color}`, transform: 'translate(-50%, -150%)', background: 'rgba(5,5,5,0.85)' }}>
                {s.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const GlobalMap = ({ onSelectVenue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredStadium, setHoveredStadium] = useState(null);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Booting up...');

  const fetchAllLiveData = useCallback(async () => {
    setLoading(true);
    setStadiums([]);

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {

    // ============================================================
    // PHASE 1: Fetch ALL today's events from TheSportsDB (instant, one call)
    // ============================================================
    setStatus('Fetching global live events from TheSportsDB...');
    let allEvents = [];
    try {
      const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}`);
      if (res.data?.events) allEvents = res.data.events;
    } catch (e) { console.warn('TheSportsDB failed'); }

    setStatus(`Found ${allEvents.length} events today. Processing...`);

    // ============================================================
    // PHASE 2: Fetch ALL global data via ESPN scorepanels (cricket, soccer, etc)
    // ============================================================
    const espnEndpoints = [
      'https://site.api.espn.com/apis/site/v2/sports/soccer/scorepanel',
      'https://site.api.espn.com/apis/site/v2/sports/cricket/scorepanel',
      'https://site.api.espn.com/apis/site/v2/sports/rugby/scorepanel',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
      'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    ];

    const espnResults = await Promise.allSettled(espnEndpoints.map(url => axios.get(url, { timeout: 5000 })));
    const espnVenueMap = {};
    espnResults.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value.data) {
        const urlStr = espnEndpoints[idx];
        const sportName = urlStr.includes('world-cup') ? 'Cricket' : urlStr.includes('cricket') ? 'Cricket' : urlStr.includes('soccer') ? 'Soccer' : urlStr.includes('nba') ? 'Basketball' : urlStr.includes('mlb') ? 'Baseball' : 'Sports';
        
        let rawEvents = [];
        if (r.value.data.scores) {
          r.value.data.scores.forEach(sc => { if (sc.events) rawEvents.push(...sc.events); });
        } else if (r.value.data.events) {
          rawEvents = r.value.data.events;
        }

        rawEvents.forEach(ev => {
          const comp = ev.competitions?.[0];
          const v = comp?.venue;
          if (v?.fullName) {
            espnVenueMap[v.fullName.toLowerCase()] = {
              capacity: v.capacity,
              attendance: comp?.attendance,
            };

            // Map ESPN to TheSportsDB format so it renders in the UI
            const isLiveStatus = ev.status?.type?.state === 'in' || ev.status?.type?.description?.toLowerCase().includes('in progress');
            const isCompleted = ev.status?.type?.state === 'post' || ev.status?.type?.completed;
            const mappedStatus = isLiveStatus ? 'In Progress' : isCompleted ? 'Match Finished' : 'Scheduled';

            // IMPORTANT: Exclude past matches!
            if (mappedStatus === 'Match Finished') return;

            const timeStr = ev.date ? ev.date.substring(11, 16) + ':00' : '';
            const dateStr = ev.date ? ev.date.substring(0, 10) : '';
            const leagueName = ev.season?.slug || ev.league?.name || sportName;

            allEvents.push({
              idEvent: ev.id,
              strEvent: ev.name || ev.shortName,
              strVenue: v.fullName,
              strCity: v.address?.city || '',
              strCountry: v.address?.country || '',
              strSport: sportName,
              strLeague: leagueName,
              strStatus: mappedStatus,
              strTime: timeStr,
              dateEvent: dateStr,
              intHomeScore: comp?.competitors?.[0]?.score || "0",
              intAwayScore: comp?.competitors?.[1]?.score || "0",
              intSpectators: comp?.attendance || v.capacity
            });
          }
        });
      }
    });

    // ============================================================
    // PHASE 3: Build unique venues from TheSportsDB
    // ============================================================
    const uniqueVenues = [];
    const seenKeys = new Set();

    for (const ev of allEvents) {
      if (ev.strStatus === 'Match Finished' || ev.strStatus === 'FT' || ev.strStatus === 'Completed') continue;

      const venueName = ev.strVenue || 'Unknown Venue';
      const key = `${venueName}-${ev.strEvent}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      // Get REAL capacity from our database first, then ESPN, then API
      const cachedVenue = findCachedVenue(venueName);
      const espnData = espnVenueMap[venueName.toLowerCase()] || {};
      const capacity = cachedVenue?.capacity || espnData.capacity || (ev.intSpectators ? parseInt(ev.intSpectators) : null);
      const realAttendance = espnData.attendance ? parseInt(espnData.attendance) : null;
      
      // Attendance MUST NEVER exceed capacity
      const estimatedAtt = realAttendance 
        ? Math.min(realAttendance, capacity || Infinity) 
        : (capacity ? Math.floor(capacity * 0.85) : null);

      const isLive = ev.strStatus === 'In Progress' || ev.strStatus === '1H' || ev.strStatus === '2H' || ev.strStatus === 'HT' || (ev.strStatus && ev.strStatus.includes('\''));
      const localTime = utcToLocal(ev.strTime, ev.dateEvent);

      uniqueVenues.push({
        id: ev.idEvent || Math.random().toString(),
        name: venueName,
        city: ev.strCity || '',
        country: ev.strCountry || '',
        capacity: capacity,
        sport: ev.strSport || 'Unknown',
        league: ev.strLeague || '',
        isLive,
        liveEvent: {
          match: ev.strEvent || '',
          status: ev.strStatus || 'Scheduled',
          isLive,
          isCompleted: ev.strStatus === 'Match Finished' || ev.strStatus === 'FT',
          startTime: localTime,
          startTimeUTC: ev.strTime || '',
          startDate: ev.dateEvent || '',
          homeScore: ev.intHomeScore,
          awayScore: ev.intAwayScore,
          realAttendance,
          estimatedAttendance: estimatedAtt,
        }
      });
    }

    setStatus(`Mapping ${uniqueVenues.length} venues to globe (cached coords)...`);

    // ============================================================
    // PHASE 4: Geocode — use CACHE first, Nominatim only for unknowns
    // ============================================================
    const finalStadiums = [];
    const needsGeocoding = [];

    for (const v of uniqueVenues) {
      const cached = findCachedVenue(v.name);
      if (cached) {
        v.lat = cached.lat;
        v.lon = cached.lon;
        if (!v.capacity && cached.capacity) v.capacity = cached.capacity;
        finalStadiums.push(v);
      } else {
        needsGeocoding.push(v);
      }
    }

    // Show cached venues IMMEDIATELY
    setStadiums([...finalStadiums]);
    setStatus(`${finalStadiums.length} venues loaded instantly. Geocoding ${needsGeocoding.length} remaining...`);
    // Geocode remaining (slow, but non-blocking — UI already has data)
    for (let i = 0; i < needsGeocoding.length; i++) {
      const v = needsGeocoding[i];
      try {
        const q = encodeURIComponent(`${v.name} ${v.city} stadium`);
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
          headers: { 'Accept-Language': 'en' }, timeout: 5000
        });
        if (geoRes.data?.length > 0) {
          v.lat = geoRes.data[0].lat;
          v.lon = geoRes.data[0].lon;
          finalStadiums.push(v);
          setStadiums([...finalStadiums]);
        }
      } catch (e) { /* skip */ }
      await sleep(1100);
    }
    setStatus(`Tracking ${finalStadiums.length} live venues worldwide`);
    } catch (err) {
      console.error('Data cycle failed:', err);
      setStatus('Data fetch interrupted. Using cached data...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllLiveData(); }, [fetchAllLiveData]);

  const filteredStadiums = useMemo(() => {
    if (!searchQuery) return stadiums;
    const q = searchQuery.toLowerCase();
    return stadiums.filter(s =>
      s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) || s.sport.toLowerCase().includes(q) ||
      s.league.toLowerCase().includes(q) || s.liveEvent.match.toLowerCase().includes(q)
    );
  }, [searchQuery, stadiums]);

  const handleStadiumClick = (stadium) => {
    onSelectVenue({ ...stadium, capacity: stadium.capacity ? stadium.capacity.toString() : 'Unknown', liveMatch: stadium.liveEvent.match });
  };

  const liveCount = stadiums.filter(s => s.isLive).length;

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(ellipse at bottom, #050a1f 0%, #000000 100%)', position: 'relative' }}>
      <Canvas camera={{ position: [0, 10, 60], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[20, 20, 20]} intensity={2.5} color="#00f0ff" />
        <spotLight position={[-20, -20, 0]} intensity={1.5} color="#8a2be2" />
        <MovingSpaceParticles />
        <CustomGlobe stadiums={filteredStadiums} onHover={setHoveredStadium} onClick={handleStadiumClick} hoveredStadium={hoveredStadium} />
        <OrbitControls enableZoom enablePan={false} minDistance={30} maxDistance={90} autoRotate autoRotateSpeed={0.4} />
        <Environment preset="night" />
      </Canvas>

      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', padding: '24px 40px', display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', flex: 1, maxWidth: '500px' }}>
            <Search color="var(--accent-cyan)" size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
            <input type="text" placeholder="Search PSL, IPL, Premier League, teams, stadiums..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '10px 16px', fontSize: '13px', color: '#ff2a2a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="dot" style={{ background: '#ff2a2a', boxShadow: '0 0 10px #ff2a2a' }}></div> {liveCount} LIVE
            </div>
            <div className="glass-panel" style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {stadiums.length} Venues
            </div>
            <button className="glass-panel" onClick={fetchAllLiveData}
              style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--accent-cyan)', cursor: 'pointer', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto', maxWidth: '500px' }}>
            <Loader2 color="var(--accent-cyan)" size={18} style={{ animation: 'spin 1.5s linear infinite', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{status}</div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Left Panel */}
        <div style={{ maxWidth: '500px', pointerEvents: 'auto', flex: 1, overflow: 'hidden' }}>
          {searchQuery !== '' && (
            <div className="glass-panel" style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '13px' }}>Results ({filteredStadiums.length})</h4>
              {filteredStadiums.map(s => (
                <div key={s.id} onClick={() => handleStadiumClick(s)} onMouseEnter={() => setHoveredStadium(s)} onMouseLeave={() => setHoveredStadium(null)}
                  style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', border: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: '14px' }}>{s.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(0,240,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{s.league}</span>
                  </div>
                  <div style={{ color: s.isLive ? '#ff2a2a' : 'var(--accent-success)', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="dot" style={{ width: '6px', height: '6px', background: s.isLive ? '#ff2a2a' : 'var(--accent-success)', boxShadow: 'none', animation: s.isLive ? 'pulse 1s infinite' : 'none' }}></div>
                    {s.liveEvent.match} • {s.liveEvent.status} {s.liveEvent.startTime && `• ${s.liveEvent.startTime}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hoveredStadium && searchQuery === '' && (
            <div className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${hoveredStadium.isLive ? '#ff2a2a' : 'var(--accent-success)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ color: '#fff', marginBottom: '4px', fontFamily: 'Space Grotesk', fontSize: '20px' }}>{hoveredStadium.name}</h2>
                <span style={{ fontSize: '11px', color: '#000', background: hoveredStadium.isLive ? '#ff2a2a' : hoveredStadium.liveEvent.isCompleted ? '#666' : 'var(--accent-success)', padding: '3px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {hoveredStadium.isLive ? 'LIVE' : hoveredStadium.liveEvent.isCompleted ? 'FINISHED' : 'UPCOMING'}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                {hoveredStadium.city ? `${hoveredStadium.city}, ` : ''}{hoveredStadium.country} • {hoveredStadium.sport} • {hoveredStadium.league}
              </div>
              <div style={{ background: hoveredStadium.isLive ? 'rgba(255,42,42,0.08)' : 'rgba(0,255,136,0.08)', padding: '14px', borderRadius: '12px', border: `1px solid ${hoveredStadium.isLive ? 'rgba(255,42,42,0.2)' : 'rgba(0,255,136,0.2)'}` }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px', color: '#fff' }}>{hoveredStadium.liveEvent.match}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                  <span>Status: {hoveredStadium.liveEvent.status}</span>
                  {hoveredStadium.liveEvent.startTime && <span>Start: {hoveredStadium.liveEvent.startTime}</span>}
                </div>
                {(hoveredStadium.liveEvent.homeScore !== null && hoveredStadium.liveEvent.homeScore !== undefined) && (
                  <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 'bold', fontFamily: 'Space Grotesk', color: 'var(--accent-cyan)' }}>
                    {hoveredStadium.liveEvent.homeScore} - {hoveredStadium.liveEvent.awayScore}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>EST. ATTENDANCE</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-cyan)', fontFamily: 'Space Grotesk' }}>
                    {hoveredStadium.liveEvent.estimatedAttendance?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CAPACITY</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Grotesk' }}>
                    {hoveredStadium.capacity ? parseInt(hoveredStadium.capacity).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => handleStadiumClick(hoveredStadium)}>
                ➜ Click to enter Live Hub Analytics
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;
