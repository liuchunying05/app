/**
 * 文件名: src/main.tsx
 * 分类: 应用入口
 * 作用: 挂载 React 应用到 DOM，加载全局样式
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home'
import Moment from './pages/Moment'
import Me from './pages/Me'
import Login from './pages/Login'
import FriendPage from './pages/Friend'
import InvitePage from './pages/Invite'
import AnniversaryPage from './pages/Anniversary'
import SchedulePage from './pages/Schedule'
import MoviePage from './pages/Movie'
import MoviePlayerPage from './pages/MoviePlayer'
import ElfPage from './pages/Elf'
import RoulettePage from './pages/Roulette'
import FoodPage from './pages/Food'
import BankPage from './pages/Bank'
import NotesPage from './pages/Notes'

// 登录保护组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/invite',
    element: <InvitePage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'moment', element: <Moment /> },
      { path: 'friend', element: <FriendPage /> },
      { path: 'me', element: <Me /> },
      { path: 'anniversary', element: <AnniversaryPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'movie', element: <MoviePage /> },
      { path: 'movie/player/:id', element: <MoviePlayerPage /> },
      { path: 'elf', element: <ElfPage /> },
      { path: 'food', element: <FoodPage /> },
      { path: 'bank', element: <BankPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'roulette', element: <RoulettePage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
