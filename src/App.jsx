import { Routes, Route } from 'react-router-dom';
import Shell from './components/Shell';
import Home from './pages/Home';
import Find from './pages/Find';
import Results from './pages/Results';
import DoctorProfile from './pages/DoctorProfile';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Account from './pages/Account';
import Queue from './pages/pro/Queue';
import Patients from './pages/pro/Patients';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find" element={<Find />} />
        <Route path="/results" element={<Results />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/compte" element={<Account />} />
        <Route
          path="/payment"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />
        <Route path="/confirm" element={<Confirmation />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/records" element={<Records />} />
        <Route path="/pro/queue" element={<Queue />} />
        <Route path="/pro/patients" element={<Patients />} />
      </Routes>
    </Shell>
  );
}
