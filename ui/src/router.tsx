import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import EmployeeListPage from './pages/EmployeeListPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'
import HrRequestsPage from './pages/HrRequestsPage'
import ChatPage from './pages/ChatPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <EmployeeListPage /> },
      { path: '/employees/:id', element: <EmployeeDetailPage /> },
      { path: '/hr-requests', element: <HrRequestsPage /> },
      { path: '/chat', element: <ChatPage /> },
    ],
  },
])
