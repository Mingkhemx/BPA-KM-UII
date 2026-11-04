import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Phone, 
  Users, 
  MessageSquare, 
  Percent, 
  Wallet, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export const RentalProcedureSection = () => {
  const steps = [
    {
      number: "1",
      icon: Calendar,
      title: "Cek Jadwal",
      description: "Melihat jadwal peminjaman yang tersedia pada menu produk kami."
    },
    {
      number: "2",
      icon: Phone,
      title: "Hubungi",
      description: "Menghubungi CP(Contact Person) yang tersedia pada website yaitu pengelola SCC UII."
    },
    {
      number: "3",
      icon: Users,
      title: "Survey",
      description: "Melakukan survey ke tempat yang akan disewa / survey untuk melihat kondisi barang."
    },
    {
      number: "4",
      icon: MessageSquare,
      title: "Konfirmasi",
      description: "Setelah melakukan survey maka, langkah selanjutnya melakukan konfirmasi tanggal peminjaman."
    },
    {
      number: "5",
      icon: Percent,
      title: "Bayar DP",
      description: "Melakukan pembayaran DP peminjaman minimal sebesar 30% dari total penyewaan."
    },
    {
      number: "6",
      icon: Wallet,
      title: "Pelunasan",
      description: "Melakukan pelunasan pembayaran minimal h-7 dari hari sebelum kegiatan."
    },
    {
      number: "7",
      icon: ShieldCheck,
      title: "Siap Digunakan",
      description: "Barang siap digunakan untuk acara yang anda butuhkan"
    }
  ];

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const itemWidth = 320; // Step item width in pixels

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
  };

  // Auto-scroll stepper
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % steps.length;
        scrollToIndex(next);
        return next;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, steps.length]);

  // Handle manual scroll update
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const index = Math.round(scrollLeft / itemWidth);
    if (index >= 0 && index < steps.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const prev = (activeIndex - 1 + steps.length) % steps.length;
    setActiveIndex(prev);
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = (activeIndex + 1) % steps.length;
    setActiveIndex(next);
    scrollToIndex(next);
  };

  // Wave offsets for organic curved layout (sesuai referensi asli)
  const waveOffsets = [
    'mt-0',
    'mt-8 sm:mt-10',
    'mt-16 sm:mt-20',
    'mt-8 sm:mt-10',
    'mt-0',
    'mt-8 sm:mt-10',
    'mt-16 sm:mt-20'
  ];

  return (
    <section id="procedure" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-uii-blue-950 font-heading tracking-tight leading-tight">
              Tata Cara Penyewaan
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Bagaimana cara menyewa barang di BPA KM UII ? Jika anda ingin menyewa barang di BPA KM UII. Maka, bisa mengikuti beberapa langkah di bawah ini.
            </p>
          </div>

          {/* Stepper Navigation Controls */}
          <div className="flex items-center space-x-3 self-start sm:self-end">
            <span className="text-xs font-semibold text-slate-500">
              Langkah <strong className="text-uii-blue-950">{activeIndex + 1}</strong> dari 7
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-uii-blue-900 hover:text-white text-slate-700 transition-colors shadow-sm"
                aria-label="Langkah sebelumnya"
                title="Langkah sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-uii-blue-900 hover:text-white text-slate-700 transition-colors shadow-sm"
                aria-label="Langkah berikutnya"
                title="Langkah berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Continuous Auto-Scroll Carousel Track */}
        <div 
          className="relative pb-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Scrollable Container - Scrollbar disembunyikan total */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex items-start space-x-6 sm:space-x-8 overflow-x-auto scroll-smooth scrollbar-none no-scrollbar [&::-webkit-scrollbar]:hidden py-4 px-2 select-none"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    scrollToIndex(idx);
                  }}
                  style={{ scrollSnapAlign: 'start' }}
                  className={`flex-shrink-0 w-72 sm:w-80 cursor-pointer transition-all duration-300 ${waveOffsets[idx]}`}
                >
                  {/* Circular Badge + Watermark Number beside it (sesuai referensi asli) */}
                  <div className="relative flex items-center">
                    <div className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border shadow-sm flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isCurrent 
                        ? 'border-uii-blue-900 ring-4 ring-uii-blue-100 scale-105 shadow-md' 
                        : 'border-slate-200 hover:border-uii-blue-400'
                    }`}>
                      <StepIcon className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isCurrent ? 'text-uii-blue-900' : 'text-uii-blue-900/80'
                      }`} />
                    </div>

                    <span className={`text-6xl sm:text-8xl font-black select-none pointer-events-none ml-4 sm:ml-5 transition-colors duration-300 ${
                      isCurrent ? 'text-slate-300' : 'text-slate-100'
                    }`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4 sm:mt-5 space-y-1.5 max-w-xs">
                    <h3 className={`text-lg sm:text-xl font-bold font-heading transition-colors ${
                      isCurrent ? 'text-uii-blue-950' : 'text-slate-800'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Dots Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-8">
            {steps.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => {
                  setActiveIndex(dotIdx);
                  scrollToIndex(dotIdx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  dotIdx === activeIndex
                    ? 'w-8 h-2.5 bg-uii-blue-900'
                    : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Ke langkah ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
