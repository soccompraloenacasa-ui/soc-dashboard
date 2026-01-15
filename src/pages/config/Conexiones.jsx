import { useState, useEffect } from 'react';
import { RefreshCw, ShoppingBag, Package, Store, Megaphone, Plug, Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import {
  getChannelsStatus, disconnectChannel, getMLAuthUrl,
  connectDropi, disconnectDropi as apiDisconnectDropi,
  connectShopify as apiConnectShopify, disconnectShopify as apiDisconnectShopify,
  getMetaAuthUrl, disconnectMeta as apiDisconnectMeta,
  CHANNEL_IDS
} from '../../services/api';

// Define multi-account channels
const DROPI_CHANNELS = [
  { id: CHANNEL_IDS.DROPI, name: 'Dropi Principal', description: 'Cuenta principal de Dropi' },
  { id: CHANNEL_IDS.DROPI_2, name: 'Dropi Productos Propios', description: 'Productos propios y clientes directos' },
];

const META_CHANNELS = [
  { id: CHANNEL_IDS.META, name: 'Meta Ads', description: 'Cuenta principal de Meta Ads' },
  { id: CHANNEL_IDS.META_2, name: 'Meta Ads 2', description: 'Segunda cuenta de Meta Ads' },
];

export default function Conexiones() {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [mlChannels, setMlChannels] = useState([]);
  const [dropiChannels, setDropiChannels] = useState([]);
  const [metaChannels, setMetaChannels] = useState([]);
  const [shopifyStatus, setShopifyStatus] = useState({ connected: false, shop: null });

  // Dropi form state (with channel selector)
  const [dropiForm, setDropiForm] = useState({ email: '', password: '', country: 'co', channelId: CHANNEL_IDS.DROPI });
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

      // ML channels
      const ml = allChannels.filter(c => c.type?.includes('MERCADO'));
      setMlChannels(ml);

      // Dropi channels (match by ID)
      const dropi = DROPI_CHANNELS.map(dc => {
        const found = allChannels.find(c => c.id === dc.id);
        return {
          ...dc,
          connected: found?.has_credentials || false,
          external_id: found?.external_id,
          status: found?.status
        };
      });
      setDropiChannels(dropi);

      // Meta channels (match by ID)
      const meta = META_CHANNELS.map(mc => {
        const found = allChannels.find(c => c.id === mc.id);
        return {
          ...mc,
          connected: found?.has_credentials || false,
          external_id: found?.external_id,
          status: found?.status
        };
      });
      setMetaChannels(meta);

      // Shopify
      const shopify = allChannels.find(c => c.type?.includes('SHOPIFY'));
      if (shopify?.has_credentials) {
        setShopifyStatus({ connected: true, shop: { url: shopify.external_id || shopify.name, name: shopify.name } });
      } else {
        setShopifyStatus({ connected: false, shop: null });
      }

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
      const { data } = await connectDropi(dropiForm.channelId, dropiForm.country, dropiForm.email, dropiForm.password);
      if (data.success) {
        alert('Dropi conectado exitosamente!');
        setDropiForm({ ...dropiForm, email: '', password: '' });
        loadStatus();
      } else {
        setDropiError(data.error || 'Error de autenticación');
      }
    } catch (e) {
      setDropiError('Error de conexión: ' + (e.response?.data?.detail || e.message));
    }
    setDropiLoading(false);
  };

  const handleDisconnectDropi = async (channelId, channelName) => {
    if (!confirm(`¿Desconectar ${channelName}?`)) return;
    try {
      await apiDisconnectDropi(channelId);
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

  const handleConnectMeta = (channelId) => {
    const url = getMetaAuthUrl(channelId);
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

  const handleDisconnectMeta = async (channelId, channelName) => {
    if (!confirm(`¿Desconectar ${channelName}?`)) return;
    try {
      await apiDisconnectMeta(channelId);
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
  const dropiConnected = dropiChannels.filter(c => c.connected).length;
  const metaConnected = metaChannels.filter(c => c.connected).length;

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
      <div className="grid grid-cols-5 gap-4">
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
          <p className={`text-xs mt-1 ${dropiConnected > 0 ? 'text-green-500' : 'text-yellow-500'}`}>
            {dropiConnected}/{dropiChannels.length} conectadas
          </p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <Store className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="font-medium text-white">Shopify</p>
          <p className={`text-xs mt-1 ${shopifyStatus.connected ? 'text-green-500' : 'text-yellow-500'}`}>
            {shopifyStatus.connected ? '1/1 conectadas' : '0/1 conectadas'}
          </p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <Megaphone className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="font-medium text-white">Meta Ads</p>
          <p className={`text-xs mt-1 ${metaConnected > 0 ? 'text-green-500' : 'text-yellow-500'}`}>
            {metaConnected}/{metaChannels.length} conectadas
          </p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center opacity-60">
          <Store className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <p className="font-medium text-white">MasterShops</p>
          <p className="text-xs mt-1 text-gray-500">Próximamente</p>
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
                    {c.has_credentials ? 'Conectado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[#222]">
              <p className="text-xs text-gray-500 mb-3">Para conectar una nueva cuenta:</p>
              <div className="flex gap-2">
                <button onClick={() => handleConnectML(CHANNEL_IDS.ML_CUENTA2)} className="flex-1 px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm text-white">
                  Conectar Cuenta 2
                </button>
                <button onClick={() => handleConnectML(CHANNEL_IDS.ML_CUENTA3)} className="flex-1 px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm text-white">
                  Conectar Cuenta 3
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dropi - Multi Account */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="bg-orange-500/10 px-5 py-4 border-b border-[#222]">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-orange-500" />
              Dropi
            </h3>
            <p className="text-gray-500 text-sm">Conecta tus cuentas de Dropi</p>
          </div>
          <div className="p-5 space-y-4">
            {/* Connected Dropi accounts */}
            <div className="space-y-3">
              {dropiChannels.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg ${c.connected ? 'bg-green-500/10 border border-green-500/30' : 'bg-[#1a1a1a]'}`}>
                  <div>
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </div>
                  {c.connected ? (
                    <button
                      onClick={() => handleDisconnectDropi(c.id, c.name)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">Pendiente</span>
                  )}
                </div>
              ))}
            </div>

            {/* Connect form for non-connected Dropi accounts */}
            {dropiChannels.some(c => !c.connected) && (
              <div className="pt-4 border-t border-[#222]">
                <p className="text-sm text-gray-400 mb-3">Conectar cuenta Dropi:</p>
                <form onSubmit={handleConnectDropi} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cuenta</label>
                      <select
                        value={dropiForm.channelId}
                        onChange={(e) => setDropiForm({ ...dropiForm, channelId: Number(e.target.value) })}
                        className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white"
                      >
                        {dropiChannels.filter(c => !c.connected).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">País</label>
                      <select
                        value={dropiForm.country}
                        onChange={(e) => setDropiForm({ ...dropiForm, country: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white"
                      >
                        <option value="co">Colombia</option>
                        <option value="mx">México</option>
                        <option value="pe">Perú</option>
                        <option value="ec">Ecuador</option>
                        <option value="cl">Chile</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={dropiForm.email}
                    onChange={(e) => setDropiForm({ ...dropiForm, email: e.target.value })}
                    placeholder="Email"
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white"
                    required
                  />
                  <input
                    type="password"
                    value={dropiForm.password}
                    onChange={(e) => setDropiForm({ ...dropiForm, password: e.target.value })}
                    placeholder="Contraseña"
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={dropiLoading}
                    className="w-full px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {dropiLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                    {dropiLoading ? 'Conectando...' : 'Conectar'}
                  </button>
                  {dropiError && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      {dropiError}
                    </div>
                  )}
                </form>
              </div>
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
                  <span className="text-green-500 font-medium">Conectado</span>
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

        {/* Meta Ads - Multi Account */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="bg-blue-500/10 px-5 py-4 border-b border-[#222]">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5 text-blue-500" />
              Meta Ads
            </h3>
            <p className="text-gray-500 text-sm">Conecta tus cuentas de Meta Business</p>
          </div>
          <div className="p-5 space-y-4">
            {/* Meta accounts list */}
            <div className="space-y-3">
              {metaChannels.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg ${c.connected ? 'bg-green-500/10 border border-green-500/30' : 'bg-[#1a1a1a]'}`}>
                  <div>
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </div>
                  {c.connected ? (
                    <button
                      onClick={() => handleDisconnectMeta(c.id, c.name)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectMeta(c.id)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30"
                    >
                      Conectar
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
              <p className="text-gray-400 text-xs">Cada cuenta de Meta Ads se conecta por separado mediante OAuth con Facebook.</p>
            </div>
          </div>
        </div>

        {/* MasterShops - Coming Soon */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden opacity-60">
          <div className="bg-purple-500/10 px-5 py-4 border-b border-[#222]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-white">
                <Store className="w-5 h-5 text-purple-500" />
                MasterShops
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Próximamente
              </span>
            </div>
            <p className="text-gray-500 text-sm">Marketplace de productos</p>
          </div>
          <div className="p-5">
            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222] text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 font-medium mb-1">Integración en desarrollo</p>
              <p className="text-gray-500 text-sm">
                Pronto podrás conectar tu cuenta de MasterShops para sincronizar productos y pedidos.
              </p>
            </div>
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
