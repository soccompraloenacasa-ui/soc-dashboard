import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFinancialsByProduct, formatCOP, formatDateForAPI, CHANNEL_IDS } from '../../services/api';

const PRODUCTS_PER_PAGE = 20;

export default function VentasProductos() {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('revenue_desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Date range (default: last 30 days)
  const [dateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const dateFrom = formatDateForAPI(dateRange.start);
      const dateTo = formatDateForAPI(dateRange.end);
      const { data } = await getFinancialsByProduct(CHANNEL_IDS.ML_MAIN, dateFrom, dateTo, 500);
      setAllProducts(data.products || []);
    } catch (e) {
      console.error('Error loading products:', e);
    }
    setLoading(false);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(searchLower));
    }

    // Sort
    const [field, order] = sortBy.split('_');
    result.sort((a, b) => {
      let valA, valB;
      switch (field) {
        case 'revenue': valA = a.revenue || 0; valB = b.revenue || 0; break;
        case 'units': valA = a.units_sold || 0; valB = b.units_sold || 0; break;
        case 'name': return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        case 'net': valA = a.net || 0; valB = b.net || 0; break;
        default: valA = a.revenue || 0; valB = b.revenue || 0;
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [allProducts, search, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const formatDateLabel = (d) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-500" />
            Ventas por Producto
          </h1>
          <p className="text-gray-500">Productos que vendieron en el período seleccionado</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#111] px-4 py-2 border border-[#222] rounded-lg text-sm text-gray-400">
            {formatDateLabel(dateRange.start)} - {formatDateLabel(dateRange.end)}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar..."
              className="bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-sm w-48 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm">
            Mostrando {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length}
          </span>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <optgroup label="Por Ingresos">
              <option value="revenue_desc">Mayor ingreso ↓</option>
              <option value="revenue_asc">Menor ingreso ↑</option>
            </optgroup>
            <optgroup label="Por Unidades">
              <option value="units_desc">Más unidades ↓</option>
              <option value="units_asc">Menos unidades ↑</option>
            </optgroup>
            <optgroup label="Por Nombre">
              <option value="name_asc">Nombre A-Z</option>
              <option value="name_desc">Nombre Z-A</option>
            </optgroup>
            <optgroup label="Por Rentabilidad">
              <option value="net_desc">Mayor neto ↓</option>
              <option value="net_asc">Menor neto ↑</option>
            </optgroup>
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
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p, i) => (
                    <tr key={p.title + i} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="py-3 text-gray-500">{(currentPage - 1) * PRODUCTS_PER_PAGE + i + 1}</td>
                      <td className="py-3 font-medium text-white">{p.title}</td>
                      <td className="py-3 text-right text-white">{p.units_sold?.toLocaleString()}</td>
                      <td className="py-3 text-right text-green-500">{p.formatted?.revenue || formatCOP(p.revenue)}</td>
                      <td className="py-3 text-right text-orange-500">-{p.formatted?.shipping || formatCOP(p.shipping || 0)}</td>
                      <td className="py-3 text-right text-red-500">-{p.formatted?.fees || formatCOP(p.fees || 0)}</td>
                      <td className="py-3 text-right font-medium text-green-400">{p.formatted?.net || formatCOP(p.net || 0)}</td>
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
