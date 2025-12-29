import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MovieDetails from './pages/MovieDetails'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import History from './pages/History'
import Watchlist from './pages/Watchlist'
import NotFound from './pages/NotFound'
import { useAuth } from './state/AuthContext'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  

  if (!user) return <Navigate to="/login" replace />
  

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  
  return children
}
// Adds or removes 'at-top' class based on scroll position.
export default function App() {
  useEffect(() => {
    const onScroll = () => {
      const atTop = (window.scrollY || window.pageYOffset || 0) <= 0
      document.body.classList.toggle('at-top', atTop)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app">
      <main id="main">
        <Routes>
           //Everybody see these page 
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetails />} />

    
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <Admin />
              </PrivateRoute>
            }
          />


          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <PrivateRoute>
                <Watchlist />
              </PrivateRoute>
            }
          />


          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}