import { DollarSign, ShoppingCart, Megaphone, Percent, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import KPICard from '../../components/ui/KPICard';

const waterfallData = [
  { name: 'Ingresos', value: 45200000, color: '#10b981' },
  { name: 'Fees ML', value: -6800000, color: '#ef4444' },
  { name: 'Envíos', value: -3100000, color: '#ef4444' },
  { name: 'Costo Prod.', value: -14800000, color: '#ef4444' },
  { name: 'Marketing', value: -4500000, color: '#ef4444' },
  { name: 'Utilidad', value: 15930000, color: '#3b82f6' },
];

const channelData = [
  { label: 'MercadoLibre', val: '$38.4M', p: 85, color: '#FFE600' },
  { label: 'Dropi', val: '$4.8M', p: 11, color: '#10b981' },
  { label: 'Shopify', val: '$1.9M', p: 4, color: '#96BF48' }
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

export default function DashboardPL() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard P&L</h1>
          <p className="text-gray-400 text-sm mt-1">Análisis de rentabilidad neta en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#111] px-4 py-2 border border-[#222] rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors">
            EXPORTAR PDF
          </button>
          <div className="bg-[#111111] px-4 py-2 border border-[#222222] rounded-lg text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Enero 2026
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Ventas Brutas" value="$45.2M" trend="up" trendValue="12.4%" icon={DollarSign} />
        <KPICard title="COGS (Costo)" value="$22.1M" trend="down" trendValue="3.1%" icon={ShoppingCart} />
        <KPICard title="Inversión Ads" value="$4.5M" trend="up" trendValue="8.2%" icon={Megaphone} />
        <KPICard title="Utilidad Neta" value="$15.9M" trend="up" trendValue="15.8%" icon={Percent} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waterfall Chart */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              Gráfico de Cascada (Waterfall)
              <Info size={14} className="text-gray-500" />
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid #222' }}
                  formatter={(val) => [formatCurrency(val), 'Monto']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ReferenceLine y={0} stroke="#333" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Efficiency */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-6">Eficiencia por Canal</h3>
          <div className="space-y-7">
            {channelData.map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-bold">{c.label}</span>
                  <span className="text-emerald-500 font-mono font-bold">{c.val}</span>
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${c.p}%`, backgroundColor: c.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
