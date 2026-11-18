import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';

// Silky smooth cinematic easing (tidak goyang / tidak memantul)
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: 0,
    scale: 1.03,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.5, ease: 'easeOut' },
      scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.4, ease: 'easeIn' },
      scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export const HeroSlider = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slides, setSlides] = useState(() => adminStorage.getBanners());
  const timerRef = useRef(null);

  useEffect(() => {
    const syncBanners = () => {
      setSlides(adminStorage.getBanners());
      setPage([0, 0]);
    };
    window.addEventListener('bpa-data-updated', syncBanners);
    window.addEventListener('storage', syncBanners);
    return () => {
      window.removeEventListener('bpa-data-updated', syncBanners);
      window.removeEventListener('storage', syncBanners);
    };
  }, []);

  const hasSlides = slides.length > 0;
  // Modulo index agar selalu berada dalam range 0 s/d slides.length - 1
  const slideIndex = hasSlides ? ((page % slides.length) + slides.length) % slides.length : 0;

  const paginate = (newDirection) => {
    if (slides.length <= 1) return;
    setPage([page + newDirection, newDirection]);
  };

  const jumpToSlide = (targetIndex) => {
    if (targetIndex === slideIndex || slides.length <= 1) return;
    const newDirection = targetIndex > slideIndex ? 1 : -1;
    setPage([page + (targetIndex - slideIndex), newDirection]);
  };

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setPage(([curr]) => [curr + 1, 1]);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, page, slides.length]);

  if (!hasSlides) {
    return (
      <section className="relative w-full h-screen min-h-[100vh] bg-gradient-to-br from-uii-blue-950 via-uii-blue-900 to-slate-900 overflow-hidden select-none flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto text-uii-gold">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Badan Pengelola Aset KM UII
          </h1>
          <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed">
            Belum ada banner utama yang dipublikasikan. Admin dapat menambahkan banner melalui Dashboard Admin → CMS Website.
          </p>
        </div>
      </section>
    );
  }

  const currentSlide = slides[slideIndex];

  return (
    <section className="relative w-full h-screen min-h-[100vh] bg-uii-blue-950 overflow-hidden select-none">
      {/* Full Screen Carousel with Directional Spring Slide + Parallax Zoom Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold || offset.x < -100) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold || offset.x > 100) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
            onClick={() => {
              if (currentSlide.ctaPrimary?.link) {
                window.open(currentSlide.ctaPrimary.link, '_blank');
              }
            }}
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title || "Banner FTI UII"}
              className="w-full h-full object-cover object-center pointer-events-none"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle bottom gradient for arrows & control contrast */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Left Navigation Arrow */}
      <motion.button
        whileHover={{ scale: 1.15, backgroundColor: 'rgba(6, 51, 123, 0.9)' }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md transition-shadow hover:shadow-glow"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>

      {/* Right Navigation Arrow */}
      <motion.button
        whileHover={{ scale: 1.15, backgroundColor: 'rgba(6, 51, 123, 0.9)' }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); paginate(1); }}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md transition-shadow hover:shadow-glow"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>

      {/* Slide Navigation Capsule Bar (Bottom Center) */}
      <div className="absolute bottom-8 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-black/50 backdrop-blur-lg border border-white/20 shadow-2xl pointer-events-auto">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); jumpToSlide(index); }}
              className="relative p-1 focus:outline-none"
              aria-label={`Slide ${index + 1}`}
            >
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                  index === slideIndex
                    ? 'w-8 bg-uii-gold shadow-glow'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
