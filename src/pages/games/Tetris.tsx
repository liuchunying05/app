/**
 * 文件名: src/pages/Tetris.tsx
 * 分类: 页面
 * 作用: 俄罗斯方块游戏页面
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
type Position = { x: number; y: number }
type Tetromino = {
  type: TetrominoType
  shape: number[][]
  position: Position
  color: string
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_SPEED = 1000

const TETROMINOS: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f5ff' },
  O: { shape: [[1, 1], [1, 1]], color: '#ffff00' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff7f00' }
}

export default function Tetris() {
  const navigate = useNavigate()
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  )
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null)
  const [, setNextPiece] = useState<TetrominoType>('I')
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  // 生成随机方块
  const generateTetromino = useCallback((): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
    const type = types[Math.floor(Math.random() * types.length)]
    const tetrominoData = TETROMINOS[type]
    
    return {
      type,
      shape: tetrominoData.shape,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      color: tetrominoData.color
    }
  }, [])

  // 检查碰撞
  const isValidPosition = useCallback((piece: Tetromino, newPosition: Position, newShape?: number[][]) => {
    const shape = newShape || piece.shape
    const { x, y } = newPosition

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col
          const newY = y + row

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }

          if (newY >= 0 && board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }, [board])

  // 旋转方块
  const rotatePiece = useCallback((piece: Tetromino) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )
    return { ...piece, shape: rotated }
  }, [])

  // 移动方块
  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || !isPlaying) return

    const newPosition = { ...currentPiece.position }
    switch (direction) {
      case 'left':
        newPosition.x -= 1
        break
      case 'right':
        newPosition.x += 1
        break
      case 'down':
        newPosition.y += 1
        break
    }

    if (isValidPosition(currentPiece, newPosition)) {
      setCurrentPiece({ ...currentPiece, position: newPosition })
    } else if (direction === 'down') {
      // 方块落地，固定到棋盘
      placePiece()
    }
  }, [currentPiece, isPlaying, isValidPosition])

  // 固定方块到棋盘
  const placePiece = useCallback(() => {
    if (!currentPiece) return

    const newBoard = board.map(row => [...row])
    currentPiece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const x = currentPiece.position.x + colIndex
          const y = currentPiece.position.y + rowIndex
          if (y >= 0) {
            newBoard[y][x] = currentPiece.color
          }
        }
      })
    })

    setBoard(newBoard)
    setCurrentPiece(generateTetromino())
    setNextPiece(generateTetromino().type)

    // 清除满行
    setTimeout(() => {
      clearLines()
    }, 100)

    // 检查游戏结束
    if (!isValidPosition(generateTetromino(), { x: 4, y: 0 })) {
      setGameOver(true)
      setIsPlaying(false)
    }
  }, [currentPiece, board, generateTetromino, isValidPosition])

  // 清除满行
  const clearLines = useCallback(() => {
    const newBoard = board.filter(row => row.some(cell => cell === ''))
    const linesCleared = BOARD_HEIGHT - newBoard.length
    
    if (linesCleared > 0) {
      const newLines = Array(linesCleared).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
      setBoard([...newLines, ...newBoard])
      setLines(prev => prev + linesCleared)
      setScore(prev => prev + linesCleared * 100 * level)
      setLevel(Math.floor((lines + linesCleared) / 10) + 1)
      setSpeed(INITIAL_SPEED - (level * 50))
    }
  }, [board, lines, level])

  // 游戏循环
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const interval = setInterval(() => {
      movePiece('down')
    }, speed)

    return () => clearInterval(interval)
  }, [isPlaying, gameOver, movePiece, speed])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          movePiece('left')
          break
        case 'ArrowRight':
          movePiece('right')
          break
        case 'ArrowDown':
          movePiece('down')
          break
        case 'ArrowUp':
          if (currentPiece) {
            const rotated = rotatePiece(currentPiece)
            if (isValidPosition(rotated, currentPiece.position, rotated.shape)) {
              setCurrentPiece(rotated)
            }
          }
          break
        case ' ':
          e.preventDefault()
          // 硬降落
          while (currentPiece && isValidPosition(currentPiece, { ...currentPiece.position, y: currentPiece.position.y + 1 })) {
            movePiece('down')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, gameOver, currentPiece, movePiece, rotatePiece, isValidPosition])

  // 开始游戏
  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')))
    setCurrentPiece(generateTetromino())
    setNextPiece(generateTetromino().type)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(true)
    setSpeed(INITIAL_SPEED)
  }

  // 暂停/继续游戏
  const togglePause = () => {
    setIsPlaying(!isPlaying)
  }

  // 重置游戏
  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')))
    setCurrentPiece(null)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(false)
    setSpeed(INITIAL_SPEED)
  }

  // 触屏方向控制（↑旋转，← → 移动，↓ 加速下降）
  const handleTouchControl = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying || gameOver) return
    if (dir === 'up') {
      if (currentPiece) {
        const rotated = rotatePiece(currentPiece)
        if (isValidPosition(rotated, currentPiece.position, rotated.shape)) {
          setCurrentPiece(rotated)
        }
      }
      return
    }
    if (dir === 'left') return movePiece('left')
    if (dir === 'right') return movePiece('right')
    if (dir === 'down') return movePiece('down')
  }, [isPlaying, gameOver, currentPiece, movePiece, rotatePiece, isValidPosition])

  // 渲染方块
  const renderPiece = (piece: Tetromino) => {
    const result: string[][] = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
    
    piece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const x = piece.position.x + colIndex
          const y = piece.position.y + rowIndex
          if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
            result[y][x] = piece.color
          }
        }
      })
    })

    return result
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>🧩 俄罗斯方块</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {gameOver ? '游戏结束！' : `得分: ${score} | 等级: ${level} | 行数: ${lines}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!gameOver && (
            <button 
              onClick={isPlaying ? togglePause : startGame}
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
              {isPlaying ? '暂停' : '开始'}
            </button>
          )}
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
            重置
          </button>
        </div>
      </header>

      {/* 游戏区域 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 20,
        marginBottom: 20 
      }}>
        {/* 主游戏区域 */}
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: 20, 
          borderRadius: 12,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`, 
            gap: 1,
            background: '#000',
            padding: 10,
            borderRadius: 8
          }}>
            {(() => {
              const displayBoard = board.map(row => [...row])
              if (currentPiece) {
                const pieceBoard = renderPiece(currentPiece)
                pieceBoard.forEach((row, rowIndex) => {
                  row.forEach((cell, colIndex) => {
                    if (cell) {
                      displayBoard[rowIndex][colIndex] = cell
                    }
                  })
                })
              }
              return displayBoard
            })().map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    width: 20,
                    height: 20,
                    background: cell || '#333',
                    border: '1px solid #555',
                    borderRadius: 2
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* 下一个方块预览 */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: 16, 
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          minWidth: 120
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 14 }}>下一个</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 2,
            background: '#000',
            padding: 8,
            borderRadius: 4
          }}>
            {Array.from({ length: 16 }, (_, index) => (
              <div
                key={index}
                style={{
                  width: 16,
                  height: 16,
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: 1
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 触屏方向键 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ width: 200, height: 200, position: 'relative' }}>
          <button
            onClick={() => handleTouchControl('up')}
            className="touch-feedback"
            style={{
              position: 'absolute', left: '50%', top: 0, transform: 'translate(-50%, 0)',
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >↑</button>
          <button
            onClick={() => handleTouchControl('left')}
            className="touch-feedback"
            style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translate(0, -50%)',
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >←</button>
          <button
            onClick={() => handleTouchControl('right')}
            className="touch-feedback"
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translate(0, -50%)',
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >→</button>
          <button
            onClick={() => handleTouchControl('down')}
            className="touch-feedback"
            style={{
              position: 'absolute', left: '50%', bottom: 0, transform: 'translate(-50%, 0)',
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >↓</button>
        </div>
      </div>

      {/* 控制说明 */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 12, 
        padding: 16,
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>游戏说明</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, opacity: 0.9 }}>
          <li>方向键左右移动，下键加速下降</li>
          <li>移动端可用屏幕方向按钮：↑旋转，←→移动，↓加速</li>
          <li>上键旋转方块，空格键硬降落</li>
          <li>填满一行即可消除得分</li>
          <li>随着等级提升，下降速度加快</li>
        </ul>
      </div>
    </div>
  )
}
