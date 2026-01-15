import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, trend, trendValue, icon: Icon }) {
  return (
    <div className="bg-[#111111] border border-[#222222] p-5 rounded-xl hover:border-emerald-500/50 transition-colors cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Icon size={20} className="text-emerald-500" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </div>
      </div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  );
}
