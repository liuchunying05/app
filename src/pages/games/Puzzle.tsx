/**
 * 文件名: src/pages/Puzzle.tsx
 * 分类: 页面
 * 作用: 拼图游戏页面
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type PuzzlePiece = {
  id: number
  image: string
  position: { x: number; y: number }
  correctPosition: { x: number; y: number }
}

const PUZZLE_SIZE = 3 // 3x3 拼图
const PIECE_SIZE = 80

export default function Puzzle() {
  const navigate = useNavigate()
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // 生成拼图图片（使用emoji作为示例）
  const generatePuzzleImage = () => {
    const images = ['🦄', '🌈', '🎨', '🎭', '🎪', '🎨', '🎯', '🎲', '🎮']
    return images[Math.floor(Math.random() * images.length)]
  }

  // 初始化拼图
  const initializePuzzle = useCallback(() => {
    const puzzleImage = generatePuzzleImage()
    const newPieces: PuzzlePiece[] = []
    
    for (let i = 0; i < PUZZLE_SIZE * PUZZLE_SIZE; i++) {
      const x = i % PUZZLE_SIZE
      const y = Math.floor(i / PUZZLE_SIZE)
      
      newPieces.push({
        id: i,
        image: puzzleImage,
        position: { x, y },
        correctPosition: { x, y }
      })
    }
    
    // 打乱拼图
    const shuffledPieces = [...newPieces].sort(() => Math.random() - 0.5)
    shuffledPieces.forEach((piece, index) => {
      piece.position = { x: index % PUZZLE_SIZE, y: Math.floor(index / PUZZLE_SIZE) }
    })
    
    setPieces(shuffledPieces)
    setSelectedPiece(null)
    setMoves(0)
    setIsCompleted(false)
    setTimeElapsed(0)
    setIsPlaying(true)
  }, [])

  // 检查拼图是否完成
  const checkCompletion = useCallback(() => {
    const isComplete = pieces.every(piece => 
      piece.position.x === piece.correctPosition.x && 
      piece.position.y === piece.correctPosition.y
    )
    setIsCompleted(isComplete)
    if (isComplete) {
      setIsPlaying(false)
    }
  }, [pieces])

  // 计时器
  useEffect(() => {
    if (!isPlaying || isCompleted) return

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isCompleted])

  // 检查完成状态
  useEffect(() => {
    checkCompletion()
  }, [pieces, checkCompletion])

  // 处理拼图块点击
  const handlePieceClick = (pieceId: number) => {
    if (isCompleted) return

    if (selectedPiece === null) {
      setSelectedPiece(pieceId)
    } else {
      // 交换两个拼图块
      const piece1 = pieces.find(p => p.id === selectedPiece)
      const piece2 = pieces.find(p => p.id === pieceId)
      
      if (piece1 && piece2) {
        const newPieces = pieces.map(piece => {
          if (piece.id === selectedPiece) {
            return { ...piece, position: piece2.position }
          } else if (piece.id === pieceId) {
            return { ...piece, position: piece1.position }
          }
          return piece
        })
        
        setPieces(newPieces)
        setMoves(prev => prev + 1)
      }
      
      setSelectedPiece(null)
    }
  }

  // 重置游戏
  const resetGame = () => {
    initializePuzzle()
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      padding: 16
    }}>
      {/* 头部 */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 20,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        backdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={() => navigate('/games')} 
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            borderRadius: '50%', 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            color: 'white', 
            marginRight: 16 
          }}
        >
          <Icon name="ic-back" size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>🧩 拼图游戏</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {isCompleted ? '恭喜完成！' : `移动次数: ${moves} | 时间: ${formatTime(timeElapsed)}`}
          </div>
        </div>
        <button 
          onClick={resetGame}
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            borderRadius: 8, 
            padding: '8px 16px', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          重新开始
        </button>
      </header>

      {/* 游戏区域 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: 20 
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: 20, 
          borderRadius: 12,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${PUZZLE_SIZE}, 1fr)`, 
            gap: 2,
            background: '#000',
            padding: 10,
            borderRadius: 8
          }}>
            {pieces.map((piece) => (
              <div
                key={piece.id}
                onClick={() => handlePieceClick(piece.id)}
                style={{
                  width: PIECE_SIZE,
                  height: PIECE_SIZE,
                  background: selectedPiece === piece.id ? '#FFD700' : '#4CAF50',
                  border: selectedPiece === piece.id ? '3px solid #FF6B6B' : '2px solid #333',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isCompleted) {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {piece.image}
                {/* 显示拼图块编号 */}
                <div style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: 12,
                  padding: '2px 4px',
                  borderRadius: 4
                }}>
                  {piece.id + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 完成提示 */}
      {isCompleted && (
        <div style={{ 
          background: 'rgba(76, 175, 80, 0.2)', 
          border: '2px solid #4CAF50',
          borderRadius: 12, 
          padding: 20,
          textAlign: 'center',
          marginBottom: 20,
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#4CAF50' }}>🎉 恭喜完成！</h2>
          <p style={{ margin: 0, fontSize: 16 }}>
            用时: {formatTime(timeElapsed)} | 移动次数: {moves}
          </p>
        </div>
      )}

      {/* 游戏说明 */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 12, 
        padding: 16,
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>游戏说明</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, opacity: 0.9 }}>
          <li>点击选择第一个拼图块，再点击第二个拼图块进行交换</li>
          <li>将所有拼图块按正确顺序排列即可完成</li>
          <li>拼图块上的数字表示正确位置</li>
          <li>尽量用最少的移动次数完成拼图</li>
        </ul>
      </div>
    </div>
  )
}