import { LayoutDashboard } from 'lucide-react';

export default function PlaceholderPage({ title, subtitle }) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <LayoutDashboard size={40} className="text-gray-700 mb-4" />
      <h2 className="text-xl font-bold text-white">{title || 'Vista en Desarrollo'}</h2>
      <p className="text-gray-500 text-sm">{subtitle || 'Próximamente'}</p>
    </div>
  );
}
