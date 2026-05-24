import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ExistentialDepthProps {
  meaningScore: number
}

export default function ExistentialDepth({ meaningScore }: ExistentialDepthProps) {
  const shaftWidth = 40 + (meaningScore / 100) * 100
  const shaftX = 100 - shaftWidth / 2
  const glowOpacity = (meaningScore / 100) * 0.5
  
  const statusWord = meaningScore > 60 ? 'GROUNDED'
    : meaningScore > 30 ? 'DRIFTING'
    : 'VOID'
  
  const statusColor = meaningScore > 60 ? '#EF9F27'
    : meaningScore > 30 ? 'rgba(255,255,255,0.4)'
    : '#E24B4A'

  const showVoidText = meaningScore < 20

  const voidWords = ['emptiness', 'drift', 'nothing', 'later', 'eventually']

  return (
    <div style={{ width: '100%', minHeight: '140px' }} className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" width="100%" height="120">
        <defs>
          <radialGradient id="meaningGlow" cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor="rgba(239,159,39,0.5)"
              stopOpacity={glowOpacity} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* shaft walls */}
        <rect
          x={shaftX}
          y={10}
          width={shaftWidth}
          height={100}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.5}
          style={{ transition: 'all 1.2s ease-in-out' }}
        />
        {/* glow at bottom */}
        <ellipse
          cx={100}
          cy={110}
          rx={shaftWidth * 0.4}
          ry={10}
          fill={`url(#meaningGlow)`}
          style={{ transition: 'all 1.2s ease-in-out' }}
        />
      </svg>
      
      {showVoidText && (
        <VoidTextCycle words={voidWords} />
      )}
      
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        letterSpacing: '0.15em',
        color: statusColor,
        marginTop: '4px',
        transition: 'color 1s ease'
      }}>
        {statusWord}
      </span>
    </div>
  )
}

function VoidTextCycle({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [words])

  return (
    <motion.span
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: '4px'
      }}
    >
      {words[index]}
    </motion.span>
  )
}
