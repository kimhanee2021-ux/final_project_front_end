import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/home/Home'
import AiGames from './pages/ai/AiGames'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'ai-games', element: <AiGames /> },
    ],
  },
])

export default router
