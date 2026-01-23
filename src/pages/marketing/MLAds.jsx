import { useState, useEffect } from 'react';
import {
  Megaphone, RefreshCw, TrendingUp, DollarSign, MousePointer,
  Eye, ShoppingCart, Download, Calendar, Building2
} from 'lucide-react';
import {
  getMLAdsCampaigns, getMLAdsMetrics, getMLAdsProfitability, syncMLAds,
  formatCOP, formatDateForAPI, CHANNEL_IDS
} from '../../services/api';

const ML_CHANNELS = [
  { id: null, name: 'Todos los canales' },
  { id: CHANNEL_IDS.ML_MAIN, name: 'COMPRALOENCASA' },
  { id: CHANNEL_IDS.ML_CUENTA2, name: 'ML Cuenta 2' },
  { id: CHANNEL_IDS.ML_CUENTA3, name: 'ML Cuenta 3' },
];

export default function MLAds() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  });

  // Data
  const [metrics, setMetrics] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // View mode
  const [viewMode, setViewMode] = useState('metrics'); // metrics, profitability

  useEffect(() => {
    loadData();
  }, [selectedChannel, dateRange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const dateFrom = formatDateForAPI(dateRange.start);
    const dateTo = formatDateForAPI(dateRange.end);

    try {
      // Load metrics and profitability in parallel
      const [metricsRes, profitRes] = await Promise.all([
        getMLAdsMetrics(selectedChannel, dateFrom, dateTo, 'day'),
        getMLAdsProfitability(selectedChannel, dateFrom, dateTo, 'month'),
      ]);

      setMetrics(metricsRes.data);
      setProfitability(profitRes.data);

      // Load campaigns for selected channel (or first channel if "all")
      const channelForCampaigns = selectedChannel || CHANNEL_IDS.ML_MAIN;
      const campaignsRes = await getMLAdsCampaigns(channelForCampaigns, dateFrom, dateTo);
      setCampaigns(campaignsRes.data.campaigns || []);

    } catch (e) {
      console.error('Error loading ML Ads data:', e);
      setError('Error al cargar datos de publicidad');
    }

    setLoading(false);
  };

  const handleSync = async () => {
    if (!selectedChannel) {
      alert('Selecciona un canal específico para sincronizar');
      return;
    }

    setSyncing(true);
    const dateFrom = formatDateForAPI(dateRange.start);
    const dateTo = formatDateForAPI(dateRange.end);

    try {
      await syncMLAds(selectedChannel, dateFrom, dateTo);
      alert('Sincronización iniciada en background. Los datos estarán disponibles en unos minutos.');
    } catch (e) {
      console.error('Error syncing ads:', e);
      alert('Error al iniciar sincronización');
    }

    setSyncing(false);
  };

  const formatNumber = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n?.toLocaleString() || '0';
  };

  const formatPercent = (n) => (n || 0).toFixed(2) + '%';

  // Calculate max for chart scaling
  const maxCost = metrics?.breakdown?.length > 0
    ? Math.max(...metrics.breakdown.map(d => d.cost || 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-yellow-500" />
            ML Product Ads
          </h1>
          <p className="text-gray-500">Métricas y análisis de publicidad en MercadoLibre</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Channel Selector */}
          <select
            value={selectedChannel || ''}
            onChange={(e) => setSelectedChannel(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-[#111] border border-[#333] text-white rounded-lg px-3 py-2"
          >
            {ML_CHANNELS.map(ch => (
              <option key={ch.id || 'all'} value={ch.id || ''}>{ch.name}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-[#111] border border-[#333] rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={formatDateForAPI(dateRange.start)}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="bg-transparent text-white text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={formatDateForAPI(dateRange.end)}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="bg-transparent text-white text-sm"
            />
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncing || !selectedChannel}
            className="px-4 py-2 bg-[#222] text-gray-300 rounded-lg hover:bg-[#333] flex items-center gap-2 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync BD
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('metrics')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'metrics'
              ? 'bg-yellow-500 text-black'
              : 'bg-[#111] text-gray-400 hover:bg-[#222]'
          }`}
        >
          Métricas de Ads
        </button>
        <button
          onClick={() => setViewMode('profitability')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'profitability'
              ? 'bg-green-500 text-black'
              : 'bg-[#111] text-gray-400 hover:bg-[#222]'
          }`}
        >
          Rentabilidad
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-yellow-500 mb-4" />
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      ) : viewMode === 'metrics' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                Gasto Total
              </div>
              <p className="text-2xl font-bold text-red-500">
                {formatCOP(metrics?.summary?.total_cost || 0)}
              </p>
            </div>

            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <ShoppingCart className="w-4 h-4" />
                Ventas Ads
              </div>
              <p className="text-2xl font-bold text-green-500">
                {formatCOP(metrics?.summary?.total_sales || 0)}
              </p>
            </div>

            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                ACOS
              </div>
              <p className="text-2xl font-bold text-yellow-500">
                {formatPercent(metrics?.summary?.avg_acos)}
              </p>
              <p className="text-xs text-gray-600">ROAS: {metrics?.summary?.roas?.toFixed(2) || 0}x</p>
            </div>

            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <MousePointer className="w-4 h-4" />
                Clicks
              </div>
              <p className="text-2xl font-bold text-blue-500">
                {formatNumber(metrics?.summary?.total_clicks)}
              </p>
              <p className="text-xs text-gray-600">CPC: {formatCOP(metrics?.summary?.avg_cpc || 0)}</p>
            </div>

            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Eye className="w-4 h-4" />
                Impresiones
              </div>
              <p className="text-2xl font-bold text-purple-500">
                {formatNumber(metrics?.summary?.total_impressions)}
              </p>
              <p className="text-xs text-gray-600">CTR: {formatPercent(metrics?.summary?.avg_ctr)}</p>
            </div>
          </div>

          {/* Cost by Day Chart */}
          <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
            <h3 className="font-semibold text-white mb-4">Gasto Diario</h3>
            <div className="h-48 flex items-end gap-1">
              {metrics?.breakdown?.slice(-30).map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-red-500/80 rounded-t hover:bg-red-400 transition-all"
                    style={{ height: `${maxCost > 0 ? (day.cost / maxCost) * 100 : 0}%`, minHeight: day.cost > 0 ? '4px' : '0' }}
                  />
                  <div className="absolute bottom-full mb-2 bg-black/90 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {day.date}: {formatCOP(day.cost)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>{metrics?.breakdown?.[0]?.date || '-'}</span>
              <span>{metrics?.breakdown?.[metrics.breakdown.length - 1]?.date || '-'}</span>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
            <h3 className="font-semibold text-white mb-4">
              Campañas ({campaigns.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-[#222]">
                    <th className="text-left pb-3">Campaña</th>
                    <th className="text-right pb-3">Presupuesto</th>
                    <th className="text-right pb-3">Gasto</th>
                    <th className="text-right pb-3">Ventas</th>
                    <th className="text-right pb-3">ACOS</th>
                    <th className="text-right pb-3">Clicks</th>
                    <th className="text-right pb-3">CPC</th>
                    <th className="text-center pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length > 0 ? campaigns.map((c, i) => {
                    const m = c.metrics || {};
                    const cost = m.cost || 0;
                    const sales = m.amount_total || 0;
                    const acos = sales > 0 ? (cost / sales * 100) : 0;

                    return (
                      <tr key={c.id || i} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                        <td className="py-3">
                          <p className="text-white font-medium">{c.name}</p>
                          <p className="text-gray-600 text-xs">ID: {c.id}</p>
                        </td>
                        <td className="py-3 text-right text-gray-400">
                          {formatCOP(c.budget || 0)}
                        </td>
                        <td className="py-3 text-right text-red-500">
                          {formatCOP(cost)}
                        </td>
                        <td className="py-3 text-right text-green-500">
                          {formatCOP(sales)}
                        </td>
                        <td className="py-3 text-right text-yellow-500">
                          {acos.toFixed(2)}%
                        </td>
                        <td className="py-3 text-right text-blue-400">
                          {(m.clicks || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-gray-400">
                          {formatCOP(m.cpc || 0)}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            c.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        No hay campañas disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Profitability View */
        <>
          {/* Grand Totals */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Ingresos</span>
              <p className="text-2xl font-bold text-green-500">
                {formatCOP(profitability?.grand_totals?.revenue || 0)}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Fees ML</span>
              <p className="text-2xl font-bold text-red-500">
                -{formatCOP(profitability?.grand_totals?.fees || 0)}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Envíos</span>
              <p className="text-2xl font-bold text-orange-500">
                -{formatCOP(profitability?.grand_totals?.shipping || 0)}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Ads</span>
              <p className="text-2xl font-bold text-purple-500">
                -{formatCOP(profitability?.grand_totals?.ads_cost || 0)}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Costos Totales</span>
              <p className="text-2xl font-bold text-red-400">
                -{formatCOP(profitability?.grand_totals?.total_costs || 0)}
              </p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
              <span className="text-gray-500 text-sm">Ganancia Neta</span>
              <p className="text-2xl font-bold text-green-400">
                {formatCOP(profitability?.grand_totals?.net_profit || 0)}
              </p>
              <p className="text-xs text-green-600">
                Margen: {profitability?.grand_totals?.margin_percent?.toFixed(1) || 0}%
              </p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
            <h3 className="font-semibold text-white mb-4">Rentabilidad por Mes</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#222]">
                  <th className="text-left pb-3">Período</th>
                  <th className="text-right pb-3">Ingresos</th>
                  <th className="text-right pb-3">Fees ML</th>
                  <th className="text-right pb-3">Envíos</th>
                  <th className="text-right pb-3">Ads</th>
                  <th className="text-right pb-3">Costos</th>
                  <th className="text-right pb-3">Neto</th>
                  <th className="text-right pb-3">Margen</th>
                </tr>
              </thead>
              <tbody>
                {profitability?.breakdown?.map((period, i) => {
                  const t = period.totals;
                  return (
                    <tr key={i} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="py-3 text-white font-medium">{period.period}</td>
                      <td className="py-3 text-right text-green-500">{formatCOP(t.revenue)}</td>
                      <td className="py-3 text-right text-red-500">-{formatCOP(t.fees)}</td>
                      <td className="py-3 text-right text-orange-500">-{formatCOP(t.shipping)}</td>
                      <td className="py-3 text-right text-purple-500">-{formatCOP(t.ads_cost)}</td>
                      <td className="py-3 text-right text-red-400">-{formatCOP(t.total_costs)}</td>
                      <td className={`py-3 text-right font-medium ${t.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCOP(t.net_profit)}
                      </td>
                      <td className={`py-3 text-right ${t.margin_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {t.margin_percent?.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Channel Breakdown per Period */}
          {profitability?.breakdown?.map((period, i) => (
            <div key={i} className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-yellow-500" />
                {period.period} - Por Canal
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(period.channels || {}).map(([name, data]) => (
                  <div key={name} className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-white font-medium mb-2">{name}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ingresos:</span>
                        <span className="text-green-500">{formatCOP(data.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Costos:</span>
                        <span className="text-red-500">-{formatCOP(data.total_costs)}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#333] pt-1 mt-1">
                        <span className="text-gray-400">Neto:</span>
                        <span className={data.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatCOP(data.net_profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Margen:</span>
                        <span className={data.margin_percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {data.margin_percent?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
