import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/home/Home'
import Notices from './pages/notices/Notices'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'notices', element: <Notices /> },
    ],
  },
])

export default router
