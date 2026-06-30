import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './features/store';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import CalculatorPage from './pages/CalculatorPage';
import CalculatorList from './pages/CalculatorList';
import Login from './pages/Login';
import History from './pages/History';
import StockScreener from './pages/Screener';
import './index.css';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculators" element={<CalculatorList />} />
            <Route path="/calculator/:calculatorId" element={<CalculatorPage />} />
            <Route path="/screener" element={<StockScreener />} />
            <Route path="/portfolio" element={<StockScreener />} />
            <Route path="/history" element={<History />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
