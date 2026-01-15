import { useState, useEffect } from 'react';
import { RefreshCw, ShoppingBag, Package, Store, Megaphone, Plug, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import {
  getChannelsStatus, disconnectChannel, getMLAuthUrl,
  connectDropi, disconnectDropi as apiDisconnectDropi,
  connectShopify as apiConnectShopify, disconnectShopify as apiDisconnectShopify,
  getMetaAuthUrl, disconnectMeta as apiDisconnectMeta,
  CHANNEL_IDS
} from '../../services/api';

export default function Conexiones() {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [mlChannels, setMlChannels] = useState([]);
  const [dropiStatus, setDropiStatus] = useState({ connected: false, user: null });
  const [shopifyStatus, setShopifyStatus] = useState({ connected: false, shop: null });
  const [metaStatus, setMetaStatus] = useState({ connected: false });

  // Dropi form state
  const [dropiForm, setDropiForm] = useState({ email: '', password: '', country: 'co' });
  const [dropiLoading, setDropiLoading] = useState(false);
  const [dropiError, setDropiError] = useState('');

  // Shopify form state
  const [shopifyForm, setShopifyForm] = useState({ url: '', token: '' });
  const [shopifyLoading, setShopifyLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const { data } = await getChannelsStatus();
      const allChannels = data.channels || [];
      setChannels(allChannels);

      const ml = allChannels.filter(c => c.type?.includes('MERCADO'));
      setMlChannels(ml);

      const dropi = allChannels.find(c => c.type?.includes('DROPI'));
      if (dropi?.has_credentials) {
        setDropiStatus({ connected: true, user: { id: dropi.external_id || 'Conectado' } });
      } else {
        setDropiStatus({ connected: false, user: null });
      }

      const shopify = allChannels.find(c => c.type?.includes('SHOPIFY'));
      if (shopify?.has_credentials) {
        setShopifyStatus({ connected: true, shop: { url: shopify.external_id || shopify.name, name: shopify.name } });
      } else {
        setShopifyStatus({ connected: false, shop: null });
      }

      const meta = allChannels.find(c => c.type?.includes('CHATEAPRO') || c.type?.includes('META'));
      setMetaStatus({ connected: meta?.has_credentials || false });

    } catch (e) {
      console.error('Error loading status:', e);
    }
    setLoading(false);
  };

  const handleConnectML = (channelId) => {
    window.open(getMLAuthUrl(channelId), '_blank');
    alert(`Se abrió una ventana para autorizar la cuenta ML #${channelId}.\n\nDespués de autorizar, actualiza esta página.`);
  };

  const handleConnectDropi = async (e) => {
    e.preventDefault();
    setDropiLoading(true);
    setDropiError('');
    try {
      const { data } = await connectDropi(CHANNEL_IDS.DROPI, dropiForm.country, dropiForm.email, dropiForm.password);
      if (data.success) {
        setDropiStatus({ connected: true, user: { id: data.user_id, name: data.user_name, email: data.email } });
        alert('Dropi conectado exitosamente!');
        loadStatus();
      } else {
        setDropiError(data.error || 'Error de autenticación');
      }
    } catch (e) {
      setDropiError('Error de conexión: ' + (e.response?.data?.detail || e.message));
    }
    setDropiLoading(false);
  };

  const handleDisconnectDropi = async () => {
    if (!confirm('¿Desconectar Dropi?')) return;
    try {
      await apiDisconnectDropi(CHANNEL_IDS.DROPI);
      setDropiStatus({ connected: false, user: null });
      loadStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectShopify = async (e) => {
    e.preventDefault();
    setShopifyLoading(true);
    try {
      const { data } = await apiConnectShopify(CHANNEL_IDS.SHOPIFY, shopifyForm.url, shopifyForm.token);
      if (data.success) {
        setShopifyStatus({ connected: true, shop: { url: data.shop_url, name: data.shop_name } });
        alert('Shopify conectado exitosamente!');
        loadStatus();
      } else {
        alert('Error: ' + (data.detail || data.error || 'Token inválido'));
      }
    } catch (e) {
      alert('Error: ' + (e.response?.data?.detail || e.message));
    }
    setShopifyLoading(false);
  };

  const handleDisconnectShopify = async () => {
    if (!confirm('¿Desconectar Shopify?')) return;
    try {
      await apiDisconnectShopify(CHANNEL_IDS.SHOPIFY);
      setShopifyStatus({ connected: false, shop: null });
      loadStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectMeta = () => {
    const url = getMetaAuthUrl(CHANNEL_IDS.META);
    const width = 600, height = 700;
    const left = Math.round((window.innerWidth - width) / 2 + window.screenX);
    const top = Math.round((window.innerHeight - height) / 2 + window.screenY);
    const popup = window.open(url, 'meta_oauth_popup', `width=${width},height=${height},left=${left},top=${top}`);

    const checkPopup = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopup);
        setTimeout(() => loadStatus(), 1000);
      }
    }, 1000);
  };

  const handleDisconnectMeta = async () => {
    if (!confirm('¿Desconectar Meta Ads?')) return;
    try {
      await apiDisconnectMeta(CHANNEL_IDS.META);
      setMetaStatus({ connected: false });
      loadStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnectChannel = async (channelId, channelName) => {
    if (!confirm(`¿Desconectar ${channelName}?`)) return;
    try {
      await disconnectChannel(channelId);
      alert(`${channelName} desconectado`);
      loadStatus();
    } catch (e) {
      alert('Error al desconectar');
    }
  };

  const mlConnected = mlChannels.filter(c => c.has_credentials).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plug className="w-6 h-6" /> Conexiones
          </h1>
          <p className="text-gray-500">Configura las conexiones a tus plataformas</p>
        </div>
        <button
          onClick={loadStatus}
          className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#1a1a1a] flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Estado
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p className="font-medium text-white">Mercado Libre</p>
          <p className={`text-xs mt-1 ${mlConnected > 0 ? 'text-green-500' : 'text-gray-500'}`}>
            {mlConnected}/{mlChannels.length} conectadas
          </p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <p className="font-medium text-white">Dropi</p>
          <p className={`text-xs mt-1 ${dropiStatus.connected ? 'text-green-500' : 'text-yellow-500'}`}>
            {dropiStatus.connected ? '✓ Conectado' : '⏳ Pendiente'}
          </p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <Store className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="font-medium text-white">Shopify</p>
          <p className={`text-xs mt-1 ${shopifyStatus.connected ? 'text-green-500' : 'text-yellow-500'}`}>
            {shopifyStatus.connected ? '✓ Conectado' : '⏳ Pendiente'}
          </p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <Megaphone className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="font-medium text-white">Meta Ads</p>
          <p className={`text-xs mt-1 ${metaStatus.connected ? 'text-green-500' : 'text-yellow-500'}`}>
            {metaStatus.connected ? '✓ Conectado' : '⏳ Pendiente'}
          </p>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Mercado Libre */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="bg-yellow-500/10 px-5 py-4 border-b border-[#222]">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <ShoppingBag className="w-5 h-5 text-yellow-500" />
              Mercado Libre
            </h3>
            <p className="text-gray-500 text-sm">Conecta tus cuentas de vendedor</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-3">
              {mlChannels.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg ${c.has_credentials ? 'bg-green-500/10 border border-green-500/30' : 'bg-[#1a1a1a]'}`}>
                  <div>
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">ID: {c.external_id || 'Sin conectar'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${c.has_credentials ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}>
                    {c.has_credentials ? '✓ Conectado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[#222]">
              <p className="text-xs text-gray-500 mb-3">Para conectar una nueva cuenta:</p>
              <div className="flex gap-2">
                <button onClick={() => handleConnectML(7)} className="flex-1 px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm text-white">
                  Conectar Cuenta 2
                </button>
                <button onClick={() => handleConnectML(8)} className="flex-1 px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm text-white">
                  Conectar Cuenta 3
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dropi */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="bg-orange-500/10 px-5 py-4 border-b border-[#222]">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-orange-500" />
              Dropi
            </h3>
            <p className="text-gray-500 text-sm">Conecta tu cuenta de Dropi</p>
          </div>
          <div className="p-5">
            {dropiStatus.connected ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div>
                  <span className="text-green-500 font-medium">✓ Conectado</span>
                  <p className="text-xs text-gray-400 mt-1">
                    {dropiStatus.user?.name || `Usuario ID: ${dropiStatus.user?.id}`}
                  </p>
                </div>
                <button onClick={handleDisconnectDropi} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30">
                  Desconectar
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectDropi} className="space-y-4">
                <div className="mb-4 p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
                  <p className="text-gray-300 text-sm">Usa las mismas credenciales que usas en Dropi</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">País</label>
                  <select
                    value={dropiForm.country}
                    onChange={(e) => setDropiForm({ ...dropiForm, country: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="co">Colombia</option>
                    <option value="mx">México</option>
                    <option value="pe">Perú</option>
                    <option value="ec">Ecuador</option>
                    <option value="cl">Chile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={dropiForm.email}
                    onChange={(e) => setDropiForm({ ...dropiForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={dropiForm.password}
                    onChange={(e) => setDropiForm({ ...dropiForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={dropiLoading}
                  className="w-full px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {dropiLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                  {dropiLoading ? 'Conectando...' : 'Conectar'}
                </button>
                {dropiError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {dropiError}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Shopify */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="bg-green-500/10 px-5 py-4 border-b border-[#222]">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Store className="w-5 h-5 text-green-500" />
              Shopify
            </h3>
            <p className="text-gray-500 text-sm">Conecta tu tienda Shopify</p>
          </div>
          <div className="p-5">
            {shopifyStatus.connected ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div>
                  <span className="text-green-500 font-medium">✓ Conectado</span>
                  <p className="text-xs text-gray-400 mt-1">
                    {shopifyStatus.shop?.name || shopifyStatus.shop?.url}
                  </p>
                </div>
                <button onClick={handleDisconnectShopify} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30">
                  Desconectar
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectShopify} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">URL de la tienda</label>
                  <input
                    type="text"
                    value={shopifyForm.url}
                    onChange={(e) => setShopifyForm({ ...shopifyForm, url: e.target.value })}
                    placeholder="mi-tienda.myshopify.com"
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Access Token</label>
                  <input
                    type="password"
                    value={shopifyForm.token}
                    onChange={(e) => setShopifyForm({ ...shopifyForm, token: e.target.value })}
                    placeholder="shpat_xxxx..."
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={shopifyLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {shopifyLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                  {shopifyLoading ? 'Conectando...' : 'Conectar Shopify'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Meta Ads */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="bg-blue-500/10 px-5 py-4 border-b border-[#222]">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5 text-blue-500" />
              Meta Ads
            </h3>
            <p className="text-gray-500 text-sm">Conecta tu cuenta de Meta Business</p>
          </div>
          <div className="p-5">
            {metaStatus.connected ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div>
                  <span className="text-green-500 font-medium">✓ Conectado</span>
                  <p className="text-xs text-gray-400 mt-1">Cuenta de Meta Business conectada</p>
                </div>
                <button onClick={handleDisconnectMeta} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30">
                  Desconectar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
                  <p className="text-gray-300 text-sm">Conecta tu cuenta para ver métricas de campañas</p>
                </div>
                <button
                  onClick={handleConnectMeta}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plug className="w-4 h-4" />
                  Conectar con Facebook
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Channels Table */}
      <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222]">
          <h3 className="font-semibold text-white">Todos los Canales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-[#222]">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Tipo</th>
                <th className="text-left py-3 px-4">External ID</th>
                <th className="text-center py-3 px-4">Credenciales</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-center py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(c => (
                <tr key={c.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                  <td className="py-3 px-4 text-gray-400">{c.id}</td>
                  <td className="py-3 px-4 font-medium text-white">{c.name}</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-1 rounded bg-[#1a1a1a] text-gray-400">{c.type}</span></td>
                  <td className="py-3 px-4 text-gray-400">{c.external_id || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    {c.has_credentials ? <CheckCircle className="w-4 h-4 text-green-500 inline" /> : <span className="text-gray-500">-</span>}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">{c.status}</td>
                  <td className="py-3 px-4 text-center">
                    {c.has_credentials ? (
                      <button onClick={() => handleDisconnectChannel(c.id, c.name)} className="text-xs text-red-400 hover:text-red-300">
                        Desconectar
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
