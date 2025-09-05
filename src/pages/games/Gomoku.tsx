/**
 * 文件名: src/pages/Gomoku.tsx
 * 分类: 页面
 * 作用: 五子棋游戏页面
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type Player = 'black' | 'white' | null
type Board = Player[][]

const BOARD_SIZE = 15

export default function Gomoku() {
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [winner, setWinner] = useState<Player>(null)
  const [gameOver, setGameOver] = useState(false)

  // 检查胜利条件
  const checkWinner = (board: Board, row: number, col: number, player: Player): boolean => {
    if (!player) return false

    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 对角线
      [1, -1]   // 反对角线
    ]

    for (const [dx, dy] of directions) {
      let count = 1

      // 向一个方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (newRow >= 0 && newRow < BOARD_SIZE && 
            newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }

      // 向相反方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (newRow >= 0 && newRow < BOARD_SIZE && 
            newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }

      if (count >= 5) return true
    }

    return false
  }

  // 处理点击
  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] || gameOver) return

    const newBoard = board.map(row => [...row])
    newBoard[row][col] = currentPlayer
    setBoard(newBoard)

    if (checkWinner(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer)
      setGameOver(true)
    } else {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black')
    }
  }

  // 重新开始游戏
  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)))
    setCurrentPlayer('black')
    setWinner(null)
    setGameOver(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>🎯 五子棋</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {gameOver ? `游戏结束 - ${winner === 'black' ? '黑棋' : '白棋'}获胜！` : 
             `当前玩家: ${currentPlayer === 'black' ? '黑棋' : '白棋'}`}
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
          background: '#8B4513', 
          padding: 20, 
          borderRadius: 12,
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, 
            gap: 1,
            background: '#654321',
            padding: 10,
            borderRadius: 8
          }}>
            {board.map((row, rowIndex) => 
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: 24,
                    height: 24,
                    background: cell ? 'transparent' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    cursor: cell || gameOver ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!cell && !gameOver) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!cell) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {cell === 'black' && '⚫'}
                  {cell === 'white' && '⚪'}
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
          <li>黑棋先手，白棋后手</li>
          <li>在棋盘上点击空位下棋</li>
          <li>率先连成5子者获胜</li>
          <li>可以横、竖、斜四个方向连线</li>
        </ul>
      </div>
    </div>
  )
}
