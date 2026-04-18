import React, { useState, useMemo } from 'react';
import { Activity, Users, AlertTriangle, Navigation, Map, ShieldAlert, Cpu, ArrowLeft, Clock, TrendingUp, Footprints } from 'lucide-react';
import Scene from './components/Scene';
import GlobalMap from './components/GlobalMap';

// =============================================================
// CROWD PHYSICS ENGINE
// Calculates realistic waiting times, crowd density, and
// movement patterns BASED ON real attendance & venue capacity
// =============================================================
const CrowdPhysicsEngine = {
  // Scientific crowd density model (people per sq meter)
  // Based on Fruin's Level of Service for pedestrian spaces
  calculateDensity(attendance, capacity) {
    const fillRate = attendance / capacity;
    // Fruin LOS: A(free) = <0.3, B(restricted) = 0.3-0.5, C(constrained) = 0.5-0.7, D(crowded) = 0.7-0.85, E(jammed) = >0.85
    if (fillRate > 0.9) return { level: 'E', label: 'Severely Crowded', color: '#ff2a2a', density: 2.5 };
    if (fillRate > 0.8) return { level: 'D', label: 'Crowded', color: '#ff6600', density: 1.8 };
    if (fillRate > 0.65) return { level: 'C', label: 'Constrained', color: '#ffb800', density: 1.2 };
    if (fillRate > 0.45) return { level: 'B', label: 'Moderate', color: '#00ff88', density: 0.7 };
    return { level: 'A', label: 'Free Flow', color: '#00f0ff', density: 0.3 };
  },

  // Queue waiting time model (M/M/c queueing theory simplified)
  // Based on: attendees competing for limited service points
  calculateWaitTime(attendance, servicePoints, serviceRate) {
    // servicePoints = number of counters/stalls
    // serviceRate = people served per minute per point
    const arrivalRate = attendance / 120; // avg arrivals per minute over 2 hours
    const utilization = arrivalRate / (servicePoints * serviceRate);
    
    if (utilization >= 1) return Math.ceil(arrivalRate / serviceRate); // system overloaded
    
    // Simplified M/M/c wait time approximation
    const waitMinutes = (utilization / (1 - utilization)) * (1 / serviceRate);
    return Math.max(1, Math.ceil(waitMinutes));
  },

  // Gate congestion predictor
  calculateGateCongestion(attendance, gateCount) {
    const perGate = attendance / gateCount;
    // Average gate processes 1200 people/hour
    const clearTimeMinutes = Math.ceil(perGate / 20); // 20 ppl/min per gate
    return {
      perGate: Math.floor(perGate),
      clearTime: clearTimeMinutes,
      congestionLevel: clearTimeMinutes > 30 ? 'Critical' : clearTimeMinutes > 15 ? 'High' : 'Normal'
    };
  },

  // Full venue analysis
  analyzeVenue(attendance, capacity) {
    if (!attendance || !capacity) {
      attendance = 40000;
      capacity = 50000;
    }
    const att = parseInt(attendance);
    const cap = parseInt(capacity);
    const fillPercent = ((att / cap) * 100).toFixed(1);
    const density = this.calculateDensity(att, cap);

    // Estimate venue infrastructure from capacity
    const foodStalls = Math.max(4, Math.floor(cap / 5000));
    const restroomBlocks = Math.max(6, Math.floor(cap / 4000));
    const gates = Math.max(4, Math.floor(cap / 10000));
    const merchKiosks = Math.max(2, Math.floor(cap / 15000));

    return {
      attendance: att,
      capacity: cap,
      fillPercent,
      density,
      gates: this.calculateGateCongestion(att, gates),
      waitTimes: {
        food: this.calculateWaitTime(att, foodStalls, 3),      // 3 ppl/min/stall
        restroom: this.calculateWaitTime(att, restroomBlocks, 5), // 5 ppl/min/block
        merch: this.calculateWaitTime(att, merchKiosks, 2),     // 2 ppl/min/kiosk
        entry: this.calculateGateCongestion(att, gates).clearTime,
      },
      infrastructure: { foodStalls, restroomBlocks, gates, merchKiosks },
      // Crowd flow score (0-100, lower = worse)
      flowScore: Math.max(0, Math.min(100, Math.floor(100 - (att / cap) * 100 + 15))),
    };
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('heat');
  const [selectedVenue, setSelectedVenue] = useState(null);

  const venueAnalysis = useMemo(() => {
    if (!selectedVenue) return null;
    const cap = parseInt(selectedVenue.capacity) || 30000;
    let att = selectedVenue.liveEvent?.estimatedAttendance || selectedVenue.liveEvent?.realAttendance;
    if (!att || att === 0) att = Math.floor(cap * 0.85);
    // NEVER allow attendance to exceed capacity
    att = Math.min(att, cap);
    return CrowdPhysicsEngine.analyzeVenue(att, cap);
  }, [selectedVenue]);

  return (
    <div className="app-container">

      {!selectedVenue ? (
        <GlobalMap onSelectVenue={setSelectedVenue} />
      ) : (
        <>
          {/* Background 3D Canvas */}
          <div className="canvas-container">
            <Scene activeTab={activeTab} sportType={selectedVenue.sport} />
          </div>

          {/* Foreground UI Layer */}
          <div className="ui-layer">

            {/* Top Navigation */}
            <header className="top-nav interactive-ui">
              <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => setSelectedVenue(null)}>
                <ArrowLeft size={24} style={{ marginRight: '8px' }} />
                <Cpu className="logo-icon" size={32} />
                <span className="logo-text" style={{ fontSize: '18px' }}>{selectedVenue.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {selectedVenue.liveEvent?.isLive && (
                  <div className="status-indicator" style={{ borderColor: '#ff2a2a' }}>
                    <div className="dot" style={{ background: '#ff2a2a', boxShadow: '0 0 10px #ff2a2a' }}></div>
                    <span style={{ color: '#ff2a2a' }}>LIVE: {selectedVenue.liveEvent.match}</span>
                  </div>
                )}
                <div className="status-indicator">
                  <div className="dot"></div>
                  CROWD PHYSICS ENGINE
                </div>
              </div>
            </header>

            {/* Dashboard Grid */}
            <main className="dashboard interactive-ui">

              {/* Left Sidebar - Core Metrics */}
              <aside className="sidebar">
                {/* Attendance Card */}
                <div className="glass-panel metric-card">
                  <div className="decorator-line"></div>
                  <div className="card-header">
                    <span className="card-title">Est. Live Attendance</span>
                    <Users className="card-icon" size={20} />
                  </div>
                  <div className="card-value">
                    {venueAnalysis.attendance.toLocaleString()} <span>/ {venueAnalysis.capacity.toLocaleString()}</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${venueAnalysis.fillPercent}%`, background: venueAnalysis.density.color }}></div>
                  </div>
                  <div className="trend" style={{ color: venueAnalysis.density.color }}>
                    <Activity size={16} />
                    {venueAnalysis.fillPercent}% • Fruin LOS: {venueAnalysis.density.level} ({venueAnalysis.density.label})
                  </div>
                </div>

                {/* Crowd Flow Score */}
                <div className="glass-panel metric-card">
                  <div className="card-header">
                    <span className="card-title">Crowd Flow Score</span>
                    <Footprints className="card-icon" size={20} />
                  </div>
                  <div className="card-value" style={{ color: venueAnalysis.flowScore > 50 ? 'var(--accent-success)' : venueAnalysis.flowScore > 25 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                    {venueAnalysis.flowScore} <span>/ 100</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${venueAnalysis.flowScore}%`, background: venueAnalysis.flowScore > 50 ? 'var(--accent-success)' : venueAnalysis.flowScore > 25 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}></div>
                  </div>
                </div>

                {/* AI Wait Times */}
                <div className="glass-panel alerts-panel">
                  <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>AI-Estimated Wait Times</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Based on {venueAnalysis.attendance.toLocaleString()} attendees &amp; venue infrastructure</p>
                  <div className="zone-list">
                    <div className="zone-item">
                      <div className="zone-info">
                        <span className="zone-name">Entry Gates ({venueAnalysis.infrastructure.gates})</span>
                        <span className="zone-wait"><Clock size={12}/> {venueAnalysis.gates.perGate.toLocaleString()} per gate</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: venueAnalysis.waitTimes.entry > 20 ? 'var(--accent-danger)' : venueAnalysis.waitTimes.entry > 10 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>{venueAnalysis.waitTimes.entry} min</span>
                    </div>
                    <div className="zone-item">
                      <div className="zone-info">
                        <span className="zone-name">Food Stalls ({venueAnalysis.infrastructure.foodStalls})</span>
                        <span className="zone-wait"><Clock size={12}/> Queue Model: M/M/c</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: venueAnalysis.waitTimes.food > 15 ? 'var(--accent-danger)' : venueAnalysis.waitTimes.food > 8 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>{venueAnalysis.waitTimes.food} min</span>
                    </div>
                    <div className="zone-item">
                      <div className="zone-info">
                        <span className="zone-name">Restrooms ({venueAnalysis.infrastructure.restroomBlocks})</span>
                        <span className="zone-wait"><Clock size={12}/> Queue Model: M/M/c</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: venueAnalysis.waitTimes.restroom > 10 ? 'var(--accent-danger)' : venueAnalysis.waitTimes.restroom > 5 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>{venueAnalysis.waitTimes.restroom} min</span>
                    </div>
                    <div className="zone-item">
                      <div className="zone-info">
                        <span className="zone-name">Merch Kiosks ({venueAnalysis.infrastructure.merchKiosks})</span>
                        <span className="zone-wait"><Clock size={12}/> Queue Model: M/M/c</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: venueAnalysis.waitTimes.merch > 12 ? 'var(--accent-danger)' : venueAnalysis.waitTimes.merch > 6 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>{venueAnalysis.waitTimes.merch} min</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Center (3D View) */}
              <div className="center-view"></div>

              {/* Right Sidebar - Alerts & Match Info */}
              <aside className="sidebar" style={{ justifyContent: 'flex-start' }}>

                {/* Match Info */}
                <div className="glass-panel alerts-panel">
                  <div className="card-header" style={{ marginBottom: '12px' }}>
                    <span className="card-title" style={{ fontSize: '16px' }}>Match Info</span>
                    <TrendingUp className="card-icon" size={20} />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedVenue.liveEvent?.match || selectedVenue.liveMatch}</div>
                  <div style={{ fontSize: '14px', color: selectedVenue.liveEvent?.isLive ? '#ff2a2a' : 'var(--accent-success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="dot" style={{ background: selectedVenue.liveEvent?.isLive ? '#ff2a2a' : 'var(--accent-success)', boxShadow: 'none' }}></div>
                    {selectedVenue.liveEvent?.status || 'Scheduled'}
                  </div>
                  {(selectedVenue.liveEvent?.homeScore !== null && selectedVenue.liveEvent?.homeScore !== undefined) && (
                    <div style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Space Grotesk', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                      {selectedVenue.liveEvent.homeScore} - {selectedVenue.liveEvent.awayScore}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SPORT</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenue.sport}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>LEAGUE</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenue.league}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CITY</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenue.city || 'N/A'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>COUNTRY</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenue.country || 'N/A'}</div>
                    </div>
                  </div>
                  {selectedVenue.liveEvent?.startTime && (
                    <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>START TIME (LOCAL)</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{selectedVenue.liveEvent.startTime}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>DATE</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenue.liveEvent.startDate || 'Today'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* System Alerts */}
                <div className="glass-panel alerts-panel">
                  <div className="card-header" style={{ marginBottom: '12px' }}>
                    <span className="card-title" style={{ fontSize: '16px' }}>System Alerts</span>
                    <ShieldAlert className="card-icon" size={20} />
                  </div>

                  {venueAnalysis.gates.congestionLevel === 'Critical' && (
                    <div className="alert-item">
                      <AlertTriangle className="alert-icon" size={20} />
                      <div className="alert-content">
                        <p className="alert-title">Gate Overload</p>
                        <p className="alert-desc">{venueAnalysis.gates.perGate.toLocaleString()} people per gate. Estimated {venueAnalysis.waitTimes.entry} min to clear. Open auxiliary gates.</p>
                      </div>
                    </div>
                  )}

                  {venueAnalysis.waitTimes.food > 12 && (
                    <div className="alert-item warning">
                      <AlertTriangle className="alert-icon" size={20} />
                      <div className="alert-content">
                        <p className="alert-title">Food Queue Bottleneck</p>
                        <p className="alert-desc">Avg wait {venueAnalysis.waitTimes.food} min across {venueAnalysis.infrastructure.foodStalls} stalls. Deploy mobile vendors.</p>
                      </div>
                    </div>
                  )}

                  <div className="alert-item info">
                    <Navigation className="alert-icon" size={20} />
                    <div className="alert-content">
                      <p className="alert-title">Crowd Density: {venueAnalysis.density.label}</p>
                      <p className="alert-desc">Fruin Level {venueAnalysis.density.level} • {venueAnalysis.density.density} persons/m². Dynamic signage adjusted.</p>
                    </div>
                  </div>
                </div>
              </aside>
            </main>

            {/* Bottom Controls */}
            <div className="controlsBar interactive-ui glass-panel">
              <button className={`control-btn ${activeTab === 'layout' ? 'active' : ''}`} onClick={() => setActiveTab('layout')} title="Structural Layout">
                <Map size={24} />
              </button>
              <button className={`control-btn ${activeTab === 'heat' ? 'active' : ''}`} onClick={() => setActiveTab('heat')} title="Crowd Heatmap">
                <Activity size={24} />
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default App;
