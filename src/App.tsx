import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
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
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState('')
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([])
  const [rotation, setRotation] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [searchFilter, setSearchFilter] = useState('')
  const wheelRef = useRef<SVGSVGElement>(null)
  const entriesListRef = useRef<HTMLDivElement>(null)

  // Virtual scrolling constants
  const ITEM_HEIGHT = 36 // Height of each entry item
  const CONTAINER_HEIGHT = 400 // Max height of entries list
  const BUFFER_ITEMS = 5 // Extra items to render for smooth scrolling

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Filter names based on search
  const filteredNames = useMemo(() => {
    if (!searchFilter.trim()) return names
    return names.filter(name => 
      name.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [names, searchFilter])

  // Calculate visible items for virtual scrolling (using filtered names)
  const virtualizedItems = useMemo(() => {
    const namesToUse = filteredNames
    if (namesToUse.length <= 50) {
      // For small lists, render all items
      return namesToUse.map((name, index) => ({ name, index }))
    }

    const visibleItems = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT)
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_ITEMS)
    const endIndex = Math.min(namesToUse.length, startIndex + visibleItems + BUFFER_ITEMS * 2)
    
    return namesToUse.slice(startIndex, endIndex).map((name, i) => ({
      name,
      index: startIndex + i
    }))
  }, [filteredNames, scrollTop, CONTAINER_HEIGHT, ITEM_HEIGHT, BUFFER_ITEMS])

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

  const importNames = useCallback((inputText: string) => {
    if (!inputText.trim()) return
    
    // Split by spaces and filter out empty strings
    const newNames = inputText
      .trim()
      .split(/\s+/) // Split by one or more whitespace characters
      .filter(name => name.length > 0) // Remove empty strings
      .filter(name => !names.includes(name)) // Remove duplicates
    
    if (newNames.length > 0) {
      // For very large imports, batch the updates to prevent UI freezing
      if (newNames.length > 500) {
        const batchSize = 100
        let currentBatch = 0
        
        const processBatch = () => {
          const start = currentBatch * batchSize
          const end = Math.min(start + batchSize, newNames.length)
          const batch = newNames.slice(start, end)
          
          setNames(prev => [...prev, ...batch])
          currentBatch++
          
          if (end < newNames.length) {
            // Continue processing in next frame
            setTimeout(processBatch, 0)
          }
        }
        
        processBatch()
      } else {
        setNames(prev => [...prev, ...newNames])
      }
    }
  }, [names])

  const handleImport = useCallback(() => {
    importNames(importText)
    setImportText('')
    setShowImportDialog(false)
  }, [importNames, importText])

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
    // Enhanced color palette for better distribution with many segments
    const colors = [
      '#4285F4', '#34A853', '#FBBC04', '#EA4335', // Google colors
      '#9C27B0', '#FF5722', '#607D8B', '#795548', // Material colors
      '#E91E63', '#00BCD4', '#8BC34A', '#FF9800',
      '#673AB7', '#009688', '#CDDC39', '#FFC107',
      '#3F51B5', '#4CAF50', '#FFEB3B', '#FF5722',
      '#2196F3', '#4CAF50', '#FFEB3B', '#F44336'
    ]
    
    // For very large numbers of segments, create more color variations
    if (index < colors.length) {
      return colors[index]
    }
    
    // Generate colors using HSL for infinite variety
    const hue = (index * 137.508) % 360 // Golden angle for good distribution
    const saturation = 70 + (index % 3) * 10 // Vary saturation 70-90%
    const lightness = 45 + (index % 4) * 5   // Vary lightness 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
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
                
                // Calculate text properties based on number of segments
                const shouldShowText = names.length <= 100 // Only show text for 100 or fewer names
                const strokeWidth = names.length > 500 ? 1 : names.length > 200 ? 2 : 3
                
                let fontSize = 18
                let textRadius = 140
                
                if (names.length > 50) {
                  fontSize = Math.max(8, 18 - (names.length - 50) * 0.1)
                  textRadius = 140
                }
                if (names.length > 100) {
                  fontSize = Math.max(6, 12 - (names.length - 100) * 0.02)
                }
                
                // Calculate text position and rotation
                const textAngle = startAngle + segmentAngle / 2
                const textRad = (textAngle * Math.PI) / 180
                const textX = 250 + textRadius * Math.cos(textRad)
                const textY = 250 + textRadius * Math.sin(textRad)
                
                // Truncate long names for smaller segments
                let displayName = name
                if (names.length > 50 && name.length > 8) {
                  displayName = name.substring(0, 8) + '...'
                }
                if (names.length > 200 && name.length > 5) {
                  displayName = name.substring(0, 5) + '...'
                }
                
                return (
                  <g key={`${name}-${index}`}>
                    <path
                      d={pathData}
                      fill={getSegmentColor(index)}
                      stroke="#fff"
                      strokeWidth={strokeWidth}
                    />
                    {shouldShowText && (
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize={fontSize}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                        style={{
                          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        {displayName}
                      </text>
                    )}
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
            <button className="panel-btn" onClick={() => setShowImportDialog(true)}>
              📥 Import
            </button>
            <button className="panel-btn">🖼️ Add Image</button>
            <button className="panel-btn">⚙️ Advanced</button>
          </div>
          
          {names.length > 20 && (
            <div className="search-container">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search entries..."
                className="search-input"
              />
            </div>
          )}
          
          <div 
            className="entries-list"
            ref={entriesListRef}
            onScroll={handleScroll}
            style={{
              maxHeight: filteredNames.length > 50 ? `${CONTAINER_HEIGHT}px` : 'auto',
              overflowY: filteredNames.length > 50 ? 'auto' : 'visible'
            }}
          >
            {filteredNames.length > 50 ? (
              // Virtual scrolling for large lists
              <div style={{ height: `${filteredNames.length * ITEM_HEIGHT}px`, position: 'relative' }}>
                {virtualizedItems.map(({ name, index }) => (
                  <div 
                    key={`${name}-${index}`}
                    className="entry-item"
                    style={{
                      position: 'absolute',
                      top: `${index * ITEM_HEIGHT}px`,
                      left: 0,
                      right: 0,
                      height: `${ITEM_HEIGHT}px`
                    }}
                  >
                    <span className="entry-name" title={name}>{name}</span>
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
            ) : (
              // Regular rendering for small lists
              filteredNames.map((name, index) => (
                <div key={`${name}-${index}`} className="entry-item">
                  <span className="entry-name">{name}</span>
                  <button 
                    onClick={() => removeName(name)}
                    className="entry-remove"
                    title="Remove entry"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            
            {searchFilter && filteredNames.length === 0 && (
              <div className="no-results">
                <p>No entries match "{searchFilter}"</p>
              </div>
            )}
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

      {/* Import Names Modal */}
      {showImportDialog && (
        <div className="modal-overlay" onClick={() => setShowImportDialog(false)}>
          <div className="import-modal" onClick={e => e.stopPropagation()}>
            <div className="import-header">
              <h2>Import Names</h2>
              <button className="close-btn" onClick={() => setShowImportDialog(false)}>×</button>
            </div>
            <div className="import-content">
              <p>Paste names separated by spaces. Each name will be added to the wheel.</p>
              <textarea
                className="import-textarea"
                placeholder="Enter names separated by spaces..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
              />
              <div className="import-preview">
                {importText && (
                  <div>
                    <strong>Preview:</strong> {importText.split(/\s+/).filter(name => name.trim()).length} names will be added
                    {importText.split(/\s+/).filter(name => name.trim()).length > 100 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                        📊 Large dataset detected. Text will be hidden on wheel for better performance.
                      </div>
                    )}
                    {importText.split(/\s+/).filter(name => name.trim()).length > 500 && (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#FBBC04' }}>
                        ⚡ Import will be processed in batches for optimal performance.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="import-actions">
              <button className="cancel-btn" onClick={() => setShowImportDialog(false)}>
                Cancel
              </button>
              <button 
                className="import-btn" 
                onClick={handleImport}
                disabled={!importText.trim()}
              >
                Import Names
              </button>
            </div>
          </div>
        </div>
      )}

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
