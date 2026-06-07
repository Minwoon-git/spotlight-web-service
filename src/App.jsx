import { useState } from 'react'
import { useSpots } from './hooks/useSpots'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import MapView from './components/MapView'
import MyMapView from './components/MyMapView'
import RegisterView from './components/RegisterView'
import SpotDetailModal from './components/SpotDetailModal'
import './App.css'

function App() {
  const { spots, addSpot } = useSpots()
  const [view, setView] = useState('home')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [savedSpots, setSavedSpots] = useState([1, 3, 5])

  const handleSaveToggle = (spotId) => {
    setSavedSpots(prev =>
      prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]
    )
  }

  return (
    <div className="app">
      <Navbar view={view} onNavigate={setView} />

      {view === 'home' && (
        <HeroSection
          spots={spots}
          onExplore={() => setView('explore')}
          onRegister={() => setView('register')}
        />
      )}

      {view === 'explore' && (
        <MapView
          spots={spots}
          onSelectSpot={setSelectedSpot}
          savedSpots={savedSpots}
          onRegister={() => setView('register')}
        />
      )}

      {view === 'mymap' && (
        <MyMapView
          spots={spots}
          savedSpots={savedSpots}
          onSelectSpot={setSelectedSpot}
          onUnsave={handleSaveToggle}
        />
      )}

      {view === 'register' && (
        <RegisterView addSpot={addSpot} onNavigate={setView} />
      )}

      {selectedSpot && (
        <SpotDetailModal
          spot={selectedSpot}
          isSaved={savedSpots.includes(selectedSpot.id)}
          onSave={() => handleSaveToggle(selectedSpot.id)}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </div>
  )
}

export default App
