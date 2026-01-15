import { useState, useEffect } from 'react';
import { ShoppingBag, Package, RefreshCw, ArrowLeft } from 'lucide-react';
import { getFinancials, getOrdersStats, getFinancialsByProduct, formatCOP, formatDateForAPI, CHANNEL_IDS } from '../../services/api';

const CHANNELS = [
  // MercadoLibre channels
  { id: CHANNEL_IDS.ML_MAIN, name: 'COMPRALOENCASA', type: 'ml', color: 'yellow', externalId: '108098646' },
  { id: CHANNEL_IDS.ML_CUENTA2, name: 'ML Cuenta 2', type: 'ml', color: 'yellow', externalId: '106449348', pending: true },
  { id: CHANNEL_IDS.ML_CUENTA3, name: 'ML Cuenta 3', type: 'ml', color: 'yellow', externalId: '757777271', pending: true },
  // Dropi channels
  { id: CHANNEL_IDS.DROPI, name: 'Dropi Principal', type: 'dropi', color: 'orange', pending: true },
  { id: CHANNEL_IDS.DROPI_2, name: 'Dropi Productos Propios', type: 'dropi', color: 'orange', pending: true },
];

export default function VentasCanales() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState(null);
  const [products, setProducts] = useState([]);

  // Date range (default: last 30 days)
  const [dateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  });

  useEffect(() => {
    if (selectedChannel) {
      loadChannelData(selectedChannel);
    }
  }, [selectedChannel]);

  const loadChannelData = async (channel) => {
    setLoading(true);
    try {
      const dateFrom = formatDateForAPI(dateRange.start);
      const dateTo = formatDateForAPI(dateRange.end);

      const [financials, stats, prods] = await Promise.all([
        getFinancials(channel.id, dateFrom, dateTo),
        getOrdersStats(channel.id),
        getFinancialsByProduct(channel.id, dateFrom, dateTo, 15)
      ]);

      setChannelData({
        financials: financials.data,
        stats: stats.data,
        orders: stats.data.total_orders || 0
      });
      setProducts(prods.data.products || []);
    } catch (e) {
      console.error('Error loading channel data:', e);
      setChannelData(null);
      setProducts([]);
    }
    setLoading(false);
  };

  const formatDateLabel = (d) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  // Channel selection view
  if (!selectedChannel) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yellow-500" />
            Ventas por Canal
          </h1>
          <p className="text-gray-500">Selecciona un canal para ver sus métricas</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => !channel.pending && setSelectedChannel(channel)}
              disabled={channel.pending}
              className={`bg-[#111] rounded-xl p-5 border-l-4 text-left transition-all ${
                channel.pending
                  ? 'border-gray-600 opacity-50 cursor-not-allowed'
                  : `border-${channel.color}-500 hover:bg-[#1a1a1a] cursor-pointer`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`font-medium ${channel.pending ? 'text-gray-400' : `text-${channel.color}-500`}`}>
                  {channel.name}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  channel.pending
                    ? 'bg-gray-500/20 text-gray-400'
                    : `bg-${channel.color}-500/20 text-${channel.color}-500`
                }`}>
                  {channel.pending ? 'Pendiente' : 'Activa'}
                </span>
              </div>
              {channel.pending ? (
                <>
                  <p className="text-2xl font-bold text-gray-600">-</p>
                  <p className="text-gray-600 text-sm">Sin conectar</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-xs">ID: {channel.externalId}</p>
                  <p className="text-sm text-gray-400 mt-2">Click para ver detalles</p>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
          <p className="text-gray-400 text-center">
            Selecciona un canal arriba para ver el detalle de ventas, órdenes y productos.
          </p>
        </div>
      </div>
    );
  }

  // Channel detail view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => setSelectedChannel(null)} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">{selectedChannel.name}</h1>
            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
              {selectedChannel.id === CHANNEL_IDS.ML_MAIN ? 'Principal' : 'Canal ' + selectedChannel.id}
            </span>
          </div>
          <p className="text-gray-500">ID: {selectedChannel.externalId} • Canal {selectedChannel.id}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#111] px-4 py-2 border border-[#222] rounded-lg text-sm text-gray-400">
            {formatDateLabel(dateRange.start)} - {formatDateLabel(dateRange.end)}
          </div>
          <button
            onClick={() => loadChannelData(selectedChannel)}
            className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-yellow-500 mb-4" />
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      ) : channelData ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Ventas</span>
              <p className="text-2xl font-bold mt-1 text-green-500">
                {channelData.financials?.formatted?.revenue || formatCOP(channelData.financials?.totals?.revenue || 0)}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Órdenes</span>
              <p className="text-2xl font-bold mt-1 text-white">
                {(channelData.financials?.orders_count || channelData.orders || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Envíos</span>
              <p className="text-2xl font-bold mt-1 text-orange-500">
                -{channelData.financials?.formatted?.shipping || formatCOP(channelData.financials?.totals?.shipping || 0)}
              </p>
            </div>
            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
              <span className="text-gray-500 text-sm">Fees ML</span>
              <p className="text-2xl font-bold mt-1 text-red-500">
                -{channelData.financials?.formatted?.fees || formatCOP(channelData.financials?.totals?.fees || 0)}
              </p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
              <span className="text-gray-500 text-sm">Neto</span>
              <p className="text-2xl font-bold mt-1 text-green-400">
                {channelData.financials?.formatted?.net || formatCOP(channelData.financials?.totals?.net || 0)}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
            <h3 className="font-semibold mb-4 text-white">Desglose por Estado</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Pagadas</p>
                <p className="text-xl font-bold text-green-500">
                  {(channelData.stats?.orders_by_status?.paid || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Canceladas</p>
                <p className="text-xl font-bold text-red-500">
                  {(channelData.stats?.orders_by_status?.cancelled || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Reembolsos</p>
                <p className="text-xl font-bold text-orange-500">
                  {(channelData.stats?.orders_by_status?.partially_refunded || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-xl font-bold text-white">
                  {channelData.stats?.total_orders?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Productos de esta cuenta</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#222]">
                  <th className="text-left pb-3">#</th>
                  <th className="text-left pb-3">Producto</th>
                  <th className="text-right pb-3">Unidades</th>
                  <th className="text-right pb-3">Ingresos</th>
                  <th className="text-right pb-3">Envío</th>
                  <th className="text-right pb-3">Fee</th>
                  <th className="text-right pb-3">Neto</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((p, i) => (
                    <tr key={p.title + i} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="py-2 text-gray-500">{i + 1}</td>
                      <td className="py-2 text-white">{p.title}</td>
                      <td className="py-2 text-right text-white">{p.units_sold?.toLocaleString()}</td>
                      <td className="py-2 text-right text-green-500">{p.formatted?.revenue || formatCOP(p.revenue)}</td>
                      <td className="py-2 text-right text-orange-500">-{p.formatted?.shipping || formatCOP(p.shipping || 0)}</td>
                      <td className="py-2 text-right text-red-500">-{p.formatted?.fees || formatCOP(p.fees || 0)}</td>
                      <td className="py-2 text-right font-medium text-green-400">{p.formatted?.net || formatCOP(p.net || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">Sin productos en este período</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-[#111] rounded-xl p-6 border border-[#222] text-center">
          <p className="text-gray-400">No se pudieron cargar los datos del canal</p>
        </div>
      )}
    </div>
  );
}
