import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Finanzas
import DashboardPL from './pages/finanzas/DashboardPL';
import Ingresos from './pages/finanzas/Ingresos';
import Gastos from './pages/finanzas/Gastos';
import FlujoCaja from './pages/finanzas/FlujoCaja';

// Ventas
import VentasResumen from './pages/ventas/index';
import VentasProductos from './pages/ventas/Productos';
import VentasCanales from './pages/ventas/Canales';
import GestionOrdenes from './pages/ventas/Ordenes';

// Marketing
import MarketingResumen from './pages/marketing/index';
import MetaAds from './pages/marketing/MetaAds';
import MLAds from './pages/marketing/MLAds';

// Inventario
import StockConsolidado from './pages/inventario/index';
import InventarioSync from './pages/inventario/Sync';

// Config
import Conexiones from './pages/config/index';
import Usuarios from './pages/config/Usuarios';
import Settings from './pages/config/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Default redirect to Finanzas Dashboard */}
        <Route index element={<Navigate to="/finanzas" replace />} />

        {/* Finanzas */}
        <Route path="finanzas" element={<DashboardPL />} />
        <Route path="finanzas/ingresos" element={<Ingresos />} />
        <Route path="finanzas/gastos" element={<Gastos />} />
        <Route path="finanzas/flujo" element={<FlujoCaja />} />

        {/* Ventas */}
        <Route path="ventas" element={<VentasResumen />} />
        <Route path="ventas/productos" element={<VentasProductos />} />
        <Route path="ventas/canales" element={<VentasCanales />} />
        <Route path="ventas/ordenes" element={<GestionOrdenes />} />

        {/* Marketing */}
        <Route path="marketing" element={<MarketingResumen />} />
        <Route path="marketing/meta" element={<MetaAds />} />
        <Route path="marketing/ml-ads" element={<MLAds />} />

        {/* Inventario */}
        <Route path="inventario" element={<StockConsolidado />} />
        <Route path="inventario/sync" element={<InventarioSync />} />

        {/* Config */}
        <Route path="config" element={<Conexiones />} />
        <Route path="config/usuarios" element={<Usuarios />} />
        <Route path="config/settings" element={<Settings />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/finanzas" replace />} />
      </Route>
    </Routes>
  );
}
