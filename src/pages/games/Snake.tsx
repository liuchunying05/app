/**
 * 文件名: src/pages/Snake.tsx
 * 分类: 页面
 * 作用: 贪吃蛇游戏页面
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type Position = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

const BOARD_WIDTH = 20
const BOARD_HEIGHT = 20
const INITIAL_SPEED = 200

export default function Snake() {
  const navigate = useNavigate()
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>('right')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  // 生成随机食物位置
  const generateFood = useCallback((): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  // 移动蛇
  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return

    setSnake(prevSnake => {
      const newSnake = [...prevSnake]
      const head = { ...newSnake[0] }

      // 根据方向移动头部
      switch (direction) {
        case 'up':
          head.y -= 1
          break
        case 'down':
          head.y += 1
          break
        case 'left':
          head.x -= 1
          break
        case 'right':
          head.x += 1
          break
      }

      // 检查碰撞
      if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
        setGameOver(true)
        setIsPlaying(false)
        return prevSnake
      }

      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        setIsPlaying(false)
        return prevSnake
      }

      newSnake.unshift(head)

      // 检查是否吃到食物
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood())
        setSpeed(prev => Math.max(50, prev - 5)) // 加速
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, isPlaying, gameOver, food, generateFood])

  // 游戏循环
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const interval = setInterval(moveSnake, speed)
    return () => clearInterval(interval)
  }, [moveSnake, isPlaying, gameOver, speed])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'down') setDirection('up')
          break
        case 'ArrowDown':
          if (direction !== 'up') setDirection('down')
          break
        case 'ArrowLeft':
          if (direction !== 'right') setDirection('left')
          break
        case 'ArrowRight':
          if (direction !== 'left') setDirection('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, isPlaying, gameOver])

  // 开始游戏
  const startGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection('right')
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
    setSpeed(INITIAL_SPEED)
  }

  // 暂停/继续游戏
  const togglePause = () => {
    setIsPlaying(!isPlaying)
  }

  // 重置游戏
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection('right')
    setGameOver(false)
    setScore(0)
    setIsPlaying(false)
    setSpeed(INITIAL_SPEED)
  }

  // 触屏方向控制
  const handleDirectionInput = useCallback((next: Direction) => {
    if (!isPlaying || gameOver) return
    if (
      (direction === 'up' && next === 'down') ||
      (direction === 'down' && next === 'up') ||
      (direction === 'left' && next === 'right') ||
      (direction === 'right' && next === 'left')
    ) {
      return
    }
    setDirection(next)
  }, [direction, isPlaying, gameOver])

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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>🐍 贪吃蛇</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {gameOver ? '游戏结束！' : `得分: ${score} | ${isPlaying ? '游戏中' : '已暂停'}`}
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
        marginBottom: 20 
      }}>
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
            background: '#1a1a1a',
            padding: 10,
            borderRadius: 8
          }}>
            {Array.from({ length: BOARD_HEIGHT }, (_, row) =>
              Array.from({ length: BOARD_WIDTH }, (_, col) => {
                const isSnake = snake.some(segment => segment.x === col && segment.y === row)
                const isHead = snake[0]?.x === col && snake[0]?.y === row
                const isFood = food.x === col && food.y === row
                
                return (
                  <div
                    key={`${row}-${col}`}
                    style={{
                      width: 20,
                      height: 20,
                      background: isSnake ? (isHead ? '#4CAF50' : '#8BC34A') : 
                                 isFood ? '#FF5722' : '#333',
                      borderRadius: isSnake ? '50%' : '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12
                    }}
                  >
                    {isFood && '🍎'}
                    {isHead && '🐍'}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* 触屏方向键 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ width: 180, height: 180, position: 'relative' }}>
          <button
            onClick={() => handleDirectionInput('up')}
            className="touch-feedback"
            style={{
              position: 'absolute', left: '50%', top: 0, transform: 'translate(-50%, 0)',
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >↑</button>
          <button
            onClick={() => handleDirectionInput('left')}
            className="touch-feedback"
            style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translate(0, -50%)',
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >←</button>
          <button
            onClick={() => handleDirectionInput('right')}
            className="touch-feedback"
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translate(0, -50%)',
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >→</button>
          <button
            onClick={() => handleDirectionInput('down')}
            className="touch-feedback"
            style={{
              position: 'absolute', left: '50%', bottom: 0, transform: 'translate(-50%, 0)',
              width: 56, height: 56, borderRadius: '50%',
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
          <li>使用方向键控制蛇的移动</li>
          <li>移动端可使用屏幕方向按钮（↑←→↓）</li>
          <li>吃到红色苹果可以增长身体和得分</li>
          <li>撞墙或撞到自己身体游戏结束</li>
          <li>随着得分增加，游戏速度会加快</li>
        </ul>
      </div>
    </div>
  )
}
