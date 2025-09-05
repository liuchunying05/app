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
import Home from '../pages/core/Home.tsx'
import Moment from '../pages/core/Moment.tsx'
import Me from '../pages/core/Me.tsx'
import Login from '../pages/core/Login.tsx'
import FriendPage from '../pages/core/Friend.tsx'
import InvitePage from '../pages/core/Invite.tsx'
import AnniversaryPage from '../pages/tools/Anniversary.tsx'
import SchedulePage from '../pages/tools/Schedule.tsx'
import MoviePage from '../pages/entertainment/Movie.tsx'
import MoviePlayerPage from '../pages/entertainment/MoviePlayer.tsx'
import ElfPage from '../pages/entertainment/Elf.tsx'
import RoulettePage from '../pages/entertainment/Roulette.tsx'
import FoodPage from '../pages/entertainment/Food.tsx'
import BankPage from '../pages/tools/Bank.tsx'
import NotesPage from '../pages/tools/Notes.tsx'
import GamesPage from '../pages/games/Games.tsx'
import GomokuPage from '../pages/games/Gomoku.tsx'
import ChessPage from '../pages/games/Chess.tsx'
import Match3Page from '../pages/games/Match3.tsx'
import SnakePage from '../pages/games/Snake.tsx'
import TetrisPage from '../pages/games/Tetris.tsx'
import PuzzlePage from '../pages/games/Puzzle.tsx'

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
      { path: 'games', element: <GamesPage /> },
      { path: 'games/gomoku', element: <GomokuPage /> },
      { path: 'games/chess', element: <ChessPage /> },
      { path: 'games/match3', element: <Match3Page /> },
      { path: 'games/snake', element: <SnakePage /> },
      { path: 'games/tetris', element: <TetrisPage /> },
      { path: 'games/puzzle', element: <PuzzlePage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
