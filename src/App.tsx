import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'

interface SpinResult {
  winner: string
  timestamp: Date
}

function App() {
  const [names, setNames] = useState<string[]>(['Ali', 'Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna'])
  const [newName, setNewName] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentWinner, setCurrentWinner] = useState<string | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([])
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<SVGSVGElement>(null)

  const addName = useCallback(() => {
    if (newName.trim() && !names.includes(newName.trim())) {
      setNames(prev => [...prev, newName.trim()])
      setNewName('')
    }
  }, [newName, names])

  const removeName = useCallback((nameToRemove: string) => {
    setNames(prev => prev.filter(name => name !== nameToRemove))
  }, [])

  const closeWinnerModal = useCallback(() => {
    setShowWinnerModal(false)
  }, [])

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showWinnerModal && event.key === 'Escape') {
        closeWinnerModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showWinnerModal, closeWinnerModal])

  const spinWheel = useCallback(() => {
    if (names.length === 0 || isSpinning) return

    setIsSpinning(true)
    setCurrentWinner(null)

    // Random rotation between 5-10 full rotations plus random angle
    const minRotations = 5
    const maxRotations = 10
    const randomRotations = Math.random() * (maxRotations - minRotations) + minRotations
    const randomAngle = Math.random() * 360
    const totalRotation = rotation + (randomRotations * 360) + randomAngle

    setRotation(totalRotation)

    // Calculate winner based on final angle
    setTimeout(() => {
      const segmentAngle = 360 / names.length
      const normalizedAngle = (360 - (totalRotation % 360)) % 360
      const winnerIndex = Math.floor(normalizedAngle / segmentAngle)
      const winner = names[winnerIndex]
      
      setCurrentWinner(winner)
      setShowWinnerModal(true)
      setSpinHistory(prev => [{
        winner,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]) // Keep last 10 results
      setIsSpinning(false)
    }, 3000) // Match CSS animation duration
  }, [names, isSpinning, rotation])

  const getSegmentColor = (index: number) => {
    // Colors matching the wheelofnames.com design
    const colors = [
      '#4285F4', // Blue (for Ali)
      '#34A853', // Green (for Hanna) 
      '#FBBC04', // Yellow/Orange (for Gabriel)
      '#EA4335', // Red (for Fatima)
      '#4285F4', // Blue (for Eric)
      '#34A853', // Green (for Diya)
      '#FBBC04', // Yellow/Orange (for Charles)
      '#EA4335'  // Red (for Beatriz)
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🎡</span>
            <span className="logo-text">wheelofnames.com</span>
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn">🎨 Customize</button>
          <button className="header-btn">📄 New</button>
          <button className="header-btn">📂 Open</button>
          <button className="header-btn">💾 Save</button>
          <button className="header-btn">🔗 Share</button>
          <button className="header-btn">🖼️ Gallery</button>
          <button className="header-btn">⋯ More</button>
          <button className="header-btn">🌐 English</button>
        </div>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <div className="wheel-container">
            <svg 
              ref={wheelRef}
              className={`wheel ${isSpinning ? 'spinning' : ''}`}
              style={{ transform: `rotate(${rotation}deg)` }}
              width="500"
              height="500"
              viewBox="0 0 500 500"
            >
              {names.map((name, index) => {
                const segmentAngle = 360 / names.length
                const startAngle = index * segmentAngle - 90 // Start from top
                const endAngle = (index + 1) * segmentAngle - 90
                
                // Convert to radians
                const startRad = (startAngle * Math.PI) / 180
                const endRad = (endAngle * Math.PI) / 180
                
                // Calculate path for the segment
                const largeArcFlag = segmentAngle > 180 ? 1 : 0
                const outerRadius = 220
                const innerRadius = 60
                
                const x1 = 250 + outerRadius * Math.cos(startRad)
                const y1 = 250 + outerRadius * Math.sin(startRad)
                const x2 = 250 + outerRadius * Math.cos(endRad)
                const y2 = 250 + outerRadius * Math.sin(endRad)
                
                const x3 = 250 + innerRadius * Math.cos(endRad)
                const y3 = 250 + innerRadius * Math.sin(endRad)
                const x4 = 250 + innerRadius * Math.cos(startRad)
                const y4 = 250 + innerRadius * Math.sin(startRad)
                
                const pathData = [
                  `M ${x1} ${y1}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `L ${x3} ${y3}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                  `Z`
                ].join(' ')
                
                // Calculate text position and rotation
                const textAngle = startAngle + segmentAngle / 2
                const textRad = (textAngle * Math.PI) / 180
                const textRadius = 140
                const textX = 250 + textRadius * Math.cos(textRad)
                const textY = 250 + textRadius * Math.sin(textRad)
                
                return (
                  <g key={name}>
                    <path
                      d={pathData}
                      fill={getSegmentColor(index)}
                      stroke="#fff"
                      strokeWidth="3"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="18"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      style={{
                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
                        fontFamily: 'Arial, sans-serif'
                      }}
                    >
                      {name}
                    </text>
                  </g>
                )
              })}
              
              {/* Center circle */}
              <circle
                cx="250"
                cy="250"
                r="60"
                fill="white"
                stroke="#ddd"
                strokeWidth="2"
              />
              
              {/* Click to spin text */}
              <text
                x="250"
                y="240"
                fill="#666"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Click to spin
              </text>
              
              {/* Or press ctrl+enter text */}
              <text
                x="250"
                y="260"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                or press Ctrl+Enter
              </text>
            </svg>
            
            {/* Pointer */}
            <div className="wheel-pointer"></div>
            
            {/* Spin overlay */}
            <div 
              className="spin-overlay"
              onClick={spinWheel}
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                zIndex: 10
              }}
            />
          </div>
          
          <div className="bottom-controls">
            <button className="control-btn">📢 Report bad ad</button>
            <button className="control-btn">❌ Close ads</button>
          </div>
        </div>

        <div className="right-panel">
          <div className="panel-tabs">
            <div className="tab active">
              <span>Entries</span>
              <span className="tab-count">{names.length}</span>
            </div>
            <div className="tab">
              <span>Results</span>
              <span className="tab-count">{spinHistory.length}</span>
            </div>
            <button className="hide-btn">⚙️ Hide</button>
          </div>
          
          <div className="panel-controls">
            <button className="panel-btn">🔀 Shuffle</button>
            <button className="panel-btn">📝 Sort</button>
            <button className="panel-btn">🖼️ Add Image</button>
            <button className="panel-btn">⚙️ Advanced</button>
          </div>
          
          <div className="entries-list">
            {names.map((name, index) => (
              <div key={index} className="entry-item">
                <span className="entry-name">{name}</span>
                <button 
                  onClick={() => removeName(name)}
                  className="entry-remove"
                  title="Remove entry"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="add-entry">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault()
                  spinWheel()
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  addName()
                }
              }}
              placeholder="Type new entry here..."
              className="entry-input"
            />
          </div>
          
          {currentWinner && (
            <div className="winner-announcement">
              <h3>🎉 Winner: {currentWinner}! 🎉</h3>
            </div>
          )}
          
          {spinHistory.length > 0 && (
            <div className="results-history">
              <h4>Recent Results</h4>
              <div className="results-list">
                {spinHistory.slice(0, 5).map((result, index) => (
                  <div key={index} className="result-item">
                    <strong>{result.winner}</strong>
                    <span className="result-time">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Winner Modal */}
      {showWinnerModal && currentWinner && (
        <div className="modal-overlay" onClick={closeWinnerModal}>
          <div className="winner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 Congratulations! 🎉</h2>
              <button className="modal-close" onClick={closeWinnerModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="winner-circle">
                <div className="winner-name">{currentWinner}</div>
              </div>
              <p className="winner-subtitle">is the winner!</p>
              <div className="confetti">
                <span>🎊</span>
                <span>🎉</span>
                <span>🎈</span>
                <span>✨</span>
                <span>🎊</span>
                <span>🎉</span>
                <span>🎈</span>
                <span>✨</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn primary" onClick={closeWinnerModal}>
                Awesome!
              </button>
              <button className="modal-btn secondary" onClick={() => {
                closeWinnerModal()
                setTimeout(spinWheel, 500)
              }}>
                Spin Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
