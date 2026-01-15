import { useState, useEffect } from 'react';
import { Package, RefreshCw, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getProductsStats, getProductsList, syncProducts, formatCOP, CHANNEL_IDS } from '../../services/api';

const PRODUCTS_PER_PAGE = 25;

export default function StockGeneral() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, stock: 0, withSales: 0, noSales: 0 });
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    hasStock: '',
    hasSales: '',
    search: '',
    sortBy: 'sold_quantity',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadStats();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadStats = async () => {
    try {
      const { data } = await getProductsStats(CHANNEL_IDS.ML_MAIN);
      const activeStatus = data.by_status?.find(s => s.status === 'active');
      const pausedStatus = data.by_status?.find(s => s.status === 'paused');
      setStats({
        total: data.totals?.products || 0,
        stock: data.totals?.total_stock || 0,
        active: activeStatus?.count || 0,
        paused: pausedStatus?.count || 0,
        withSales: data.highlights?.with_sales || 0,
        noSales: (data.totals?.products || 0) - (data.highlights?.with_sales || 0)
      });
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      };
      if (filters.status) params.status = filters.status;
      if (filters.hasStock) params.has_stock = filters.hasStock;
      if (filters.hasSales) params.has_sales = filters.hasSales;
      if (filters.search) params.search = filters.search;

      const { data } = await getProductsList(CHANNEL_IDS.ML_MAIN, params);
      setProducts(data.products || []);
      setTotalCount(data.total_count || 0);
      setCurrentPage(1);
    } catch (e) {
      console.error('Error loading products:', e);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await syncProducts(CHANNEL_IDS.ML_MAIN, 5);
      if (data.success) {
        alert(`Sync completado!\n\nProcesados: ${data.processed}\nNuevos: ${data.new_items}\nActualizados: ${data.updated_items}`);
        loadStats();
        loadProducts();
      } else {
        alert('Error: ' + (data.error || 'Unknown'));
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setSyncing(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('_');
    setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder === 'asc' ? 'asc' : 'desc' }));
  };

  // Pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE) || 1;
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'paused': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-red-500/20 text-red-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      default: return 'Cerrado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-yellow-500" />
            Inventario ML
          </h1>
          <p className="text-gray-500">Todos los productos sincronizados</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#1a1a1a] flex items-center gap-2 text-sm text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button
            onClick={() => { loadStats(); loadProducts(); }}
            className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <p className="text-gray-500 text-xs mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <p className="text-gray-500 text-xs mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <p className="text-gray-500 text-xs mb-1">Pausados</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.paused}</p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <p className="text-gray-500 text-xs mb-1">Stock</p>
          <p className="text-2xl font-bold text-blue-500">{stats.stock.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <p className="text-gray-500 text-xs mb-1">Con Ventas</p>
          <p className="text-2xl font-bold text-purple-500">{stats.withSales}</p>
        </div>
        <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
          <p className="text-gray-500 text-xs mb-1">Sin Ventas</p>
          <p className="text-2xl font-bold text-red-500">{stats.noSales}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111] rounded-xl p-4 border border-[#222]">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="">Estado: Todos</option>
            <option value="active">Activos</option>
            <option value="paused">Pausados</option>
          </select>
          <select
            value={filters.hasStock}
            onChange={(e) => handleFilterChange('hasStock', e.target.value)}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="">Stock: Todos</option>
            <option value="true">Con stock</option>
            <option value="false">Sin stock</option>
          </select>
          <select
            value={filters.hasSales}
            onChange={(e) => handleFilterChange('hasSales', e.target.value)}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="">Ventas: Todos</option>
            <option value="true">Con ventas</option>
            <option value="false">Sin ventas</option>
          </select>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar..."
              className="bg-[#1a1a1a] border border-[#222] rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 text-white"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm">
            Mostrando {Math.min(currentPage * PRODUCTS_PER_PAGE, products.length)} de {totalCount}
          </span>
          <select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={handleSortChange}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="sold_quantity_desc">Más vendidos ↓</option>
            <option value="price_desc">Mayor precio ↓</option>
            <option value="available_quantity_desc">Mayor stock ↓</option>
            <option value="title_asc">Nombre A-Z</option>
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-yellow-500 mb-4" />
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#222]">
                  <th className="text-left pb-3 w-12"></th>
                  <th className="text-left pb-3">Producto</th>
                  <th className="text-center pb-3">Estado</th>
                  <th className="text-right pb-3">Precio</th>
                  <th className="text-right pb-3">Stock</th>
                  <th className="text-right pb-3">Vendidos</th>
                  <th className="text-center pb-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p, i) => (
                    <tr key={p.ml_item_id || i} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="py-2">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-10 h-10 rounded object-cover" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-10 h-10 bg-[#1a1a1a] rounded" />
                        )}
                      </td>
                      <td className="py-2">
                        <div className="font-medium text-white text-sm">
                          {p.title?.length > 50 ? p.title.substring(0, 50) + '...' : p.title}
                        </div>
                        <div className="text-xs text-gray-500">{p.ml_item_id}</div>
                      </td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusClass(p.status)}`}>
                          {getStatusLabel(p.status)}
                        </span>
                      </td>
                      <td className="py-2 text-right font-medium text-white">{formatCOP(p.price)}</td>
                      <td className={`py-2 text-right ${p.available_quantity === 0 ? 'text-red-500' : 'text-white'}`}>
                        {p.available_quantity?.toLocaleString()}
                      </td>
                      <td className={`py-2 text-right ${p.sold_quantity === 0 ? 'text-gray-500' : 'text-green-500'}`}>
                        {p.sold_quantity?.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline text-xs inline-flex items-center gap-1">
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#222]">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#1a1a1a] rounded-lg hover:bg-[#222] disabled:opacity-50 flex items-center gap-2 text-white"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-gray-500 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-[#1a1a1a] rounded-lg hover:bg-[#222] disabled:opacity-50 flex items-center gap-2 text-white"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
