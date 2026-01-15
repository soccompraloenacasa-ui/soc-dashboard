import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Box, ShoppingBag, ListOrdered, PieChart, Wallet,
  FileText, ArrowLeftRight, Smartphone, Users, Settings
} from 'lucide-react';

const menuConfig = {
  ventas: [
    { id: 'resumen', label: 'Resumen General', icon: BarChart3, path: '/ventas' },
    { id: 'productos', label: 'Por Producto', icon: Box, path: '/ventas/productos' },
    { id: 'canales', label: 'Por Canal', icon: ShoppingBag, path: '/ventas/canales' },
    { id: 'ordenes', label: 'Gestión de Órdenes', icon: ListOrdered, path: '/ventas/ordenes' },
  ],
  finanzas: [
    { id: 'dashboard', label: 'Dashboard P&L', icon: PieChart, path: '/finanzas' },
    { id: 'ingresos', label: 'Ingresos Brutos', icon: Wallet, path: '/finanzas/ingresos' },
    { id: 'gastos', label: 'Gastos y Fees', icon: FileText, path: '/finanzas/gastos' },
    { id: 'flujo', label: 'Flujo de Caja', icon: ArrowLeftRight, path: '/finanzas/flujo' },
  ],
  marketing: [
    { id: 'resumen', label: 'Resumen Marketing', icon: BarChart3, path: '/marketing' },
    { id: 'meta', label: 'Meta Ads', icon: Smartphone, path: '/marketing/meta' },
    { id: 'ml-ads', label: 'ML Advertising', icon: ShoppingBag, path: '/marketing/ml-ads' },
  ],
  inventario: [
    { id: 'stock', label: 'Stock Consolidado', icon: Box, path: '/inventario' },
    { id: 'sync', label: 'Sincronización', icon: ArrowLeftRight, path: '/inventario/sync' },
  ],
  config: [
    { id: 'conexiones', label: 'Conexiones API', icon: Smartphone, path: '/config' },
    { id: 'usuarios', label: 'Permisos Usuarios', icon: Users, path: '/config/usuarios' },
    { id: 'settings', label: 'Ajustes SOC', icon: Settings, path: '/config/settings' },
  ]
};

export default function Sidebar({ activeModule }) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = menuConfig[activeModule] || [];

  return (
    <aside className="w-64 border-r border-[#222] bg-[#0a0a0a] p-4 flex flex-col gap-1 shrink-0">
      <div className="px-3 mb-4">
        <div className="h-1 w-8 bg-emerald-500 rounded-full mb-2"></div>
        <p className="text-[10px] font-black text-gray-500 uppercase">Módulo {activeModule}</p>
      </div>

      {items.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all text-left ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-[#111]/50'
            }`}
          >
            <item.icon size={18} /> {item.label}
          </button>
        );
      })}

      <div className="mt-auto p-4 bg-[#111] rounded-2xl border border-[#222]">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-3">Estado API</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] text-gray-300">MercadoLibre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] text-gray-300">Dropi</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export { menuConfig };
