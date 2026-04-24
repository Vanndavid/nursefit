import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { auth, loginWithGoogle, logoutUser } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ensureUserExists } from './lib/data';
import Dashboard from './Dashboard';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { CalendarHeart, Activity } from 'lucide-react';

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] text-[#3D3D2D] font-sans p-4">
      <Card className="max-w-md w-full rounded-[32px] border border-[#E5E5DF] shadow-md bg-white">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-[#FAF9F6] border border-[#D1D1C7] text-[#5A5A40] rounded-full flex items-center justify-center mb-4">
            <CalendarHeart size={32} strokeWidth={1.5} />
          </div>
          <CardTitle className="text-3xl font-serif italic text-[#5A5A40]">NurseFit Premium</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-50 mt-2">Concierge Lifestyle Planner</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-8">
          <p className="text-[13px] leading-relaxed opacity-70 text-center mb-4 px-4 font-medium">
            Sign in to unlock your premium nutrition, hydration, shift, and training dashboard.
          </p>
          <Button onClick={() => loginWithGoogle()} className="w-full h-12 text-sm uppercase tracking-wide bg-[#5A5A40] hover:bg-[#3D3D2D] text-white rounded-full transition-colors">
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await ensureUserExists(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <Activity className="animate-spin text-[#5A5A40]" size={32} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} logout={logoutUser} /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
