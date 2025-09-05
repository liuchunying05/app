/**
 * 文件名: src/pages/Match3.tsx
 * 分类: 页面
 * 作用: 消消乐游戏页面
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
type Cell = {
  type: GemType
  id: string
}

const BOARD_WIDTH = 8
const BOARD_HEIGHT = 8
const GEM_TYPES: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

export default function Match3() {
  const navigate = useNavigate()
  const [board, setBoard] = useState<Cell[][]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(30)
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
  const [gameOver, setGameOver] = useState(false)

  // 生成随机宝石
  const generateGem = (): Cell => ({
    type: GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)],
    id: Math.random().toString(36).substr(2, 9)
  })

  // 初始化棋盘
  const initializeBoard = () => {
    const newBoard: Cell[][] = []
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      newBoard[row] = []
      for (let col = 0; col < BOARD_WIDTH; col++) {
        newBoard[row][col] = generateGem()
      }
    }
    setBoard(newBoard)
  }

  // 检查是否有匹配
  const checkMatches = (board: Cell[][]): {row: number, col: number}[] => {
    const matches: {row: number, col: number}[] = []
    
    // 检查水平匹配
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH - 2; col++) {
        if (board[row][col].type === board[row][col + 1].type && 
            board[row][col].type === board[row][col + 2].type) {
          matches.push({row, col}, {row, col: col + 1}, {row, col: col + 2})
        }
      }
    }
    
    // 检查垂直匹配
    for (let row = 0; row < BOARD_HEIGHT - 2; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (board[row][col].type === board[row + 1][col].type && 
            board[row][col].type === board[row + 2][col].type) {
          matches.push({row, col}, {row: row + 1, col}, {row: row + 2, col})
        }
      }
    }
    
    return matches
  }

  // 移除匹配的宝石并填充新宝石
  const removeMatches = (matches: {row: number, col: number}[]) => {
    if (matches.length === 0) return false
    
    setScore(prev => prev + matches.length * 10)
    
    const newBoard = board.map(row => [...row])
    matches.forEach(({row, col}) => {
      newBoard[row][col] = generateGem()
    })
    
    setBoard(newBoard)
    return true
  }

  // 交换宝石
  const swapGems = (row1: number, col1: number, row2: number, col2: number) => {
    const newBoard = board.map(row => [...row])
    const temp = newBoard[row1][col1]
    newBoard[row1][col1] = newBoard[row2][col2]
    newBoard[row2][col2] = temp
    setBoard(newBoard)
    
    // 检查交换后是否有匹配
    setTimeout(() => {
      const matches = checkMatches(newBoard)
      if (matches.length > 0) {
        removeMatches(matches)
      }
    }, 300)
  }

  // 处理点击
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || moves <= 0) return
    
    if (selectedCell) {
      const {row: selectedRow, col: selectedCol} = selectedCell
      
      // 检查是否相邻
      const isAdjacent = Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1
      
      if (isAdjacent) {
        swapGems(selectedRow, selectedCol, row, col)
        setMoves(prev => prev - 1)
        setSelectedCell(null)
      } else {
        setSelectedCell({row, col})
      }
    } else {
      setSelectedCell({row, col})
    }
  }

  // 检查游戏结束
  useEffect(() => {
    if (moves <= 0) {
      setGameOver(true)
    }
  }, [moves])

  // 初始化游戏
  useEffect(() => {
    initializeBoard()
  }, [])

  // 重新开始
  const resetGame = () => {
    setScore(0)
    setMoves(30)
    setSelectedCell(null)
    setGameOver(false)
    initializeBoard()
  }

  const getGemColor = (type: GemType) => {
    const colors = {
      red: '#ff4757',
      blue: '#3742fa',
      green: '#2ed573',
      yellow: '#ffa502',
      purple: '#9c88ff',
      orange: '#ff6348'
    }
    return colors[type]
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>💎 消消乐</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {gameOver ? '游戏结束！' : `得分: ${score} | 剩余步数: ${moves}`}
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

      {/* 游戏棋盘 */}
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
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`, 
            gap: 4
          }}>
            {board.map((row, rowIndex) => 
              row.map((cell, colIndex) => (
                <div
                  key={cell.id}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: 40,
                    height: 40,
                    background: getGemColor(cell.type),
                    borderRadius: 8,
                    cursor: gameOver ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    transition: 'all 0.2s ease',
                    border: selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 
                      '3px solid #fff' : 'none',
                    boxShadow: selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 
                      '0 0 10px rgba(255,255,255,0.5)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!gameOver) {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  💎
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 游戏说明 */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 12, 
        padding: 16,
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>游戏规则</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, opacity: 0.9 }}>
          <li>点击选择宝石，再点击相邻宝石交换位置</li>
          <li>三个或更多相同颜色的宝石连成一线即可消除</li>
          <li>消除宝石获得分数，步数用完游戏结束</li>
          <li>尽量获得更高的分数！</li>
        </ul>
      </div>
    </div>
  )
}
