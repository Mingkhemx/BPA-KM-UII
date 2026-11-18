import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';

export const NewsAndAnnouncements = ({ onOpenArticle, onNavigateSewa, currentUser, onNavigateAuth }) => {
  const [allProducts, setAllProducts] = useState(() => adminStorage.getProducts());

  useEffect(() => {
    const syncProducts = () => setAllProducts(adminStorage.getProducts());
    window.addEventListener('bpa-data-updated', syncProducts);
    window.addEventListener('storage', syncProducts);
    return () => {
      window.removeEventListener('bpa-data-updated', syncProducts);
      window.removeEventListener('storage', syncProducts);
    };
  }, []);

  const displayedProducts = allProducts.slice(0, 4);

  // Handler tombol Sewa: Jika belum login langsung ke page login/register, jika sudah login ke SewaPage
  const handleSewaAction = (e, item) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!currentUser) {
      if (onNavigateAuth) {
        onNavigateAuth('login');
      }
      return;
    }
    if (onNavigateSewa) {
      onNavigateSewa(item);
    }
  };

  return (
    <section id="programs" className="py-16 sm:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-uii-blue-900 mb-2">
            Unit Usaha & Layanan
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-uii-blue-950 font-heading tracking-tight">
            Produk & Layanan BPA KM UII
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Pusat penyewaan fasilitas, inventaris acara, pengadaan atribut resmi, dan layanan kelembagaan mahasiswa.
          </p>
        </div>

        {/* Product Card Container */}
        {displayedProducts.length === 0 ? (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Belum ada produk atau layanan</h3>
            <p className="text-xs text-slate-500">
              Data produk dan aset sewa belum ditambahkan oleh admin.
            </p>
          </div>
        ) : (
        <div className={`grid grid-cols-1 gap-6 ${displayedProducts.length === 1 ? 'max-w-xs mx-auto' : displayedProducts.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' : displayedProducts.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {displayedProducts.map((item) => {
            const imgSrc = item.image || item.images?.[0] || '/images/banner/banner.jpg';
            const descText = item.desc || item.description || '';
            const priceLabel = item.priceText || item.price || 'Hubungi Admin';

            return (
              <article
                key={item.id}
                onClick={(e) => handleSewaAction(e, item)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Gambar Produk */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={imgSrc}
                      alt={item.name}
                      className={`w-full h-full object-cover ${item.imagePosition || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                      onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                    />
                  </div>

                  {/* Konten: Judul Barang, Deskripsi, dan Harga */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {/* Judul Barang */}
                    <h3 className="font-bold text-uii-blue-950 text-base font-heading group-hover:text-uii-blue-900 transition-colors leading-snug line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Deskripsi Barang */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {descText}
                    </p>

                    {/* Harga Barang */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Harga Sewa</span>
                      <span className="text-sm font-extrabold text-uii-blue-900 font-heading">
                        {priceLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Sewa: Jika belum login langsung ke login/register, jika sudah login ke SewaPage */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    onClick={(e) => handleSewaAction(e, item)}
                    className="w-full py-2.5 px-4 rounded-xl bg-uii-blue-900 hover:bg-uii-blue-950 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-md flex items-center justify-center space-x-1.5 group/btn"
                  >
                    <Package className="w-3.5 h-3.5 text-uii-gold group-hover/btn:scale-110 transition-transform" />
                    <span>Sewa</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        )}

      </div>
    </section>
  );
};
