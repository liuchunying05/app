import { Outlet } from 'react-router-dom'
import './App.css'
import { TabBar } from './components/TabBar'

function App() {
  const userPhone = localStorage.getItem('userPhone')

  return (
    <div className="app-container">
      {/* 移动端优化的头部 */}
      <header className="app-header">
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>
         日记本
        </div>
        <div style={{ fontSize: 14, color: '#666' }}>
          {userPhone ? `${userPhone.slice(0, 3)}****${userPhone.slice(-4)}` : '用户'}
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

export default App
