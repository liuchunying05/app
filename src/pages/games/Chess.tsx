/**
 * 文件名: src/pages/Chess.tsx
 * 分类: 页面
 * 作用: 中国象棋游戏页面
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'pawn'
type PieceColor = 'red' | 'black'
type Piece = {
  type: PieceType
  color: PieceColor
  id: string
}

type Board = (Piece | null)[][]

const BOARD_WIDTH = 9
const BOARD_HEIGHT = 10

export default function Chess() {
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board>(() => initializeBoard())
  const [selectedPiece, setSelectedPiece] = useState<{row: number, col: number} | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('red')
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<PieceColor | null>(null)

  function initializeBoard(): Board {
    const newBoard: Board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    
    // 红方棋子（下方）
    const redPieces: {type: PieceType, row: number, col: number}[] = [
      {type: 'chariot', row: 9, col: 0}, {type: 'chariot', row: 9, col: 8},
      {type: 'horse', row: 9, col: 1}, {type: 'horse', row: 9, col: 7},
      {type: 'elephant', row: 9, col: 2}, {type: 'elephant', row: 9, col: 6},
      {type: 'advisor', row: 9, col: 3}, {type: 'advisor', row: 9, col: 5},
      {type: 'king', row: 9, col: 4},
      {type: 'cannon', row: 7, col: 1}, {type: 'cannon', row: 7, col: 7},
      {type: 'pawn', row: 6, col: 0}, {type: 'pawn', row: 6, col: 2}, {type: 'pawn', row: 6, col: 4}, {type: 'pawn', row: 6, col: 6}, {type: 'pawn', row: 6, col: 8}
    ]
    
    // 黑方棋子（上方）
    const blackPieces: {type: PieceType, row: number, col: number}[] = [
      {type: 'chariot', row: 0, col: 0}, {type: 'chariot', row: 0, col: 8},
      {type: 'horse', row: 0, col: 1}, {type: 'horse', row: 0, col: 7},
      {type: 'elephant', row: 0, col: 2}, {type: 'elephant', row: 0, col: 6},
      {type: 'advisor', row: 0, col: 3}, {type: 'advisor', row: 0, col: 5},
      {type: 'king', row: 0, col: 4},
      {type: 'cannon', row: 2, col: 1}, {type: 'cannon', row: 2, col: 7},
      {type: 'pawn', row: 3, col: 0}, {type: 'pawn', row: 3, col: 2}, {type: 'pawn', row: 3, col: 4}, {type: 'pawn', row: 3, col: 6}, {type: 'pawn', row: 3, col: 8}
    ]
    
    // 放置红方棋子
    redPieces.forEach(({type, row, col}) => {
      newBoard[row][col] = {
        type,
        color: 'red',
        id: `red-${type}-${row}-${col}`
      }
    })
    
    // 放置黑方棋子
    blackPieces.forEach(({type, row, col}) => {
      newBoard[row][col] = {
        type,
        color: 'black',
        id: `black-${type}-${row}-${col}`
      }
    })
    
    return newBoard
  }

  const getPieceSymbol = (piece: Piece): string => {
    const symbols = {
      red: {
        king: '帅', advisor: '仕', elephant: '相', horse: '马',
        chariot: '车', cannon: '炮', pawn: '兵'
      },
      black: {
        king: '将', advisor: '士', elephant: '象', horse: '马',
        chariot: '车', cannon: '炮', pawn: '卒'
      }
    }
    return symbols[piece.color][piece.type]
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return

    const piece = board[row][col]
    
    if (selectedPiece) {
      const {row: selectedRow, col: selectedCol} = selectedPiece
      const selectedPieceData = board[selectedRow][selectedCol]
      
      if (selectedPieceData && selectedPieceData.color === currentPlayer) {
        // 尝试移动棋子
        if (canMove(selectedRow, selectedCol, row, col)) {
          const newBoard = board.map(row => [...row])
          newBoard[row][col] = selectedPieceData
          newBoard[selectedRow][selectedCol] = null
          setBoard(newBoard)
          
          // 检查游戏结束
          if (piece && piece.type === 'king') {
            setGameOver(true)
            setWinner(currentPlayer)
          } else {
            setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red')
          }
        }
      }
      setSelectedPiece(null)
    } else if (piece && piece.color === currentPlayer) {
      setSelectedPiece({row, col})
    }
  }

  const canMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol]
    const targetPiece = board[toRow][toCol]
    
    if (!piece) return false
    if (targetPiece && targetPiece.color === piece.color) return false
    
    // 简化的移动规则（实际象棋规则很复杂）
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    
    switch (piece.type) {
      case 'king':
        return rowDiff + colDiff === 1 && toRow >= 0 && toRow < BOARD_HEIGHT && toCol >= 0 && toCol < BOARD_WIDTH
      case 'advisor':
        return rowDiff === 1 && colDiff === 1
      case 'elephant':
        return rowDiff === 2 && colDiff === 2
      case 'horse':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      case 'chariot':
        return (rowDiff === 0 || colDiff === 0) && !hasPieceBetween(fromRow, fromCol, toRow, toCol)
      case 'cannon':
        return (rowDiff === 0 || colDiff === 0) && hasPieceBetween(fromRow, fromCol, toRow, toCol) === !!targetPiece
      case 'pawn':
        return rowDiff + colDiff === 1
      default:
        return false
    }
  }

  const hasPieceBetween = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0
    
    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol]) return true
      currentRow += rowStep
      currentCol += colStep
    }
    
    return false
  }

  const resetGame = () => {
    setBoard(initializeBoard())
    setSelectedPiece(null)
    setCurrentPlayer('red')
    setGameOver(false)
    setWinner(null)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #8B4513, #A0522D)',
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>♟️ 中国象棋</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {gameOver ? `游戏结束 - ${winner === 'red' ? '红方' : '黑方'}获胜！` : 
             `当前玩家: ${currentPlayer === 'red' ? '红方' : '黑方'}`}
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

      {/* 棋盘 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: 20 
      }}>
        <div style={{ 
          background: '#DEB887', 
          padding: 20, 
          borderRadius: 12,
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`, 
            gap: 2,
            background: '#F5DEB3',
            padding: 10,
            borderRadius: 8
          }}>
            {board.map((row, rowIndex) => 
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: 40,
                    height: 40,
                    background: cell ? 'transparent' : 'rgba(139, 69, 19, 0.1)',
                    border: '1px solid rgba(139, 69, 19, 0.3)',
                    borderRadius: '50%',
                    cursor: gameOver ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: cell?.color === 'red' ? '#DC143C' : '#000',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!gameOver) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = cell ? 'transparent' : 'rgba(139, 69, 19, 0.1)'
                  }}
                >
                  {cell && getPieceSymbol(cell)}
                  {selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex && (
                    <div style={{
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      border: '2px solid #FFD700',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }} />
                  )}
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
          <li>红方先手，黑方后手</li>
          <li>点击棋子选择，再点击目标位置移动</li>
          <li>吃掉对方将/帅即可获胜</li>
          <li>各棋子按中国象棋规则移动</li>
        </ul>
      </div>
    </div>
  )
}
