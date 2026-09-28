import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InternshipForm from './pages/InternshipForm';
import InternshipDetail from './pages/InternshipDetail';

function Guard({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

function BootScreen() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-brand-700 animate-pulse" />
        <p className="text-sm text-mute">Loading InternTrack…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />
      <Route
        path="/app"
        element={
          <Guard>
            <Dashboard />
          </Guard>
        }
      />
      <Route
        path="/app/new"
        element={
          <Guard>
            <InternshipForm />
          </Guard>
        }
      />
      <Route
        path="/app/:id"
        element={
          <Guard>
            <InternshipDetail />
          </Guard>
        }
      />
      <Route
        path="/app/:id/edit"
        element={
          <Guard>
            <InternshipForm />
          </Guard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
