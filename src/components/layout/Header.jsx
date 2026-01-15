import { Bell, User, LayoutDashboard, Megaphone, BadgeDollarSign, Box, Settings } from 'lucide-react';

const headerModules = [
  { id: 'ventas', label: 'Ventas', icon: LayoutDashboard },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'finanzas', label: 'Finanzas', icon: BadgeDollarSign },
  { id: 'inventario', label: 'Inventario', icon: Box },
  { id: 'config', label: 'Config', icon: Settings },
];

export default function Header({ activeModule, onModuleChange }) {
  return (
    <header className="h-16 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black">S</div>
          <div className="leading-none">
            <span className="font-black text-lg block text-white">SOC HUB</span>
            <span className="text-[9px] text-emerald-500 font-bold">CÓMPRALO EN CASA</span>
          </div>
        </div>
        <nav className="flex gap-1">
          {headerModules.map(m => (
            <button
              key={m.id}
              onClick={() => onModuleChange(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                activeModule === m.id
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#111]'
              }`}
            >
              <m.icon size={16} /> {m.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-5">
        <Bell size={20} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
        <div className="flex items-center gap-3 pl-5 border-l border-[#222]">
          <div className="text-right leading-tight">
            <p className="text-xs font-bold text-white">Admin</p>
            <p className="text-[10px] text-emerald-500">Plan Empresa</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#111] border border-[#333] flex items-center justify-center">
            <User size={20} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
