/**
 * 文件名: src/pages/Games.tsx
 * 分类: 页面
 * 作用: 小游戏集合页面，包含五子棋、象棋、消消乐等游戏。
 */
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

export default function Games() {
  const navigate = useNavigate()

  const games = [
    {
      id: 'gomoku',
      name: '五子棋',
      description: '经典黑白棋对战',
      icon: '🎯',
      color: '#4CAF50',
      path: '/games/gomoku'
    },
    {
      id: 'chess',
      name: '象棋',
      description: '中国象棋对战',
      icon: '♟️',
      color: '#FF9800',
      path: '/games/chess'
    },
    {
      id: 'match3',
      name: '消消乐',
      description: '三消益智游戏',
      icon: '💎',
      color: '#E91E63',
      path: '/games/match3'
    },
    {
      id: 'snake',
      name: '贪吃蛇',
      description: '经典贪吃蛇游戏',
      icon: '🐍',
      color: '#9C27B0',
      path: '/games/snake'
    },
    {
      id: 'tetris',
      name: '俄罗斯方块',
      description: '经典方块游戏',
      icon: '🧩',
      color: '#2196F3',
      path: '/games/tetris'
    },
    {
      id: 'puzzle',
      name: '拼图',
      description: '图片拼图游戏',
      icon: '🧩',
      color: '#00BCD4',
      path: '/games/puzzle'
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* 头部 */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: 16, 
        background: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)' 
      }}>
        <button 
          onClick={() => navigate('/')} 
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 'bold' }}>🎮 小游戏</h1>
          <div style={{ opacity: 0.85, fontSize: 14 }}>选择你喜欢的游戏开始玩耍</div>
        </div>
      </header>

      {/* 游戏列表 */}
      <div style={{ padding: 16 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 16 
        }}>
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => navigate(game.path)}
              className="touch-feedback"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                padding: 20,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* 游戏图标 */}
              <div style={{ 
                fontSize: 48, 
                textAlign: 'center', 
                marginBottom: 12,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
                {game.icon}
              </div>
              
              {/* 游戏信息 */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  color: game.color
                }}>
                  {game.name}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  opacity: 0.8,
                  lineHeight: 1.4
                }}>
                  {game.description}
                </p>
              </div>

              {/* 装饰性边框 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${game.color}, transparent)`,
                borderRadius: '16px 16px 0 0'
              }} />
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 32, 
          opacity: 0.7,
          fontSize: 14
        }}>
          💡 更多游戏正在开发中...
        </div>
      </div>
    </div>
  )
}
