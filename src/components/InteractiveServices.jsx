import React from 'react';
import { motion } from 'framer-motion';
import { 
  FlaskConical, FileText, Users, Briefcase, Handshake, 
  Award, Download, ExternalLink, ArrowRight, FileCheck
} from 'lucide-react';
import { siteData } from '../data/siteData';

export const InteractiveServices = ({ onOpenDownloads }) => {
  const iconMap = {
    FlaskConical: FlaskConical,
    FileText: FileText,
    Users: Users,
    Briefcase: Briefcase,
    Handshake: Handshake,
    Award: Award
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-uii-blue-50 text-uii-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-uii-gold-600" />
            <span>Ekosistem Kampus Terpadu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-uii-blue-950 font-heading tracking-tight">
            Layanan Akademik, Riset & Karir Mahasiswa
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Menyediakan infrastruktur digital modern untuk mendukung kenyamanan studi, akselerasi riset, hingga kesiapan karir profesional.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteData.services.map((service, idx) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-uii-blue-100 text-uii-blue-900 group-hover:bg-uii-blue-900 group-hover:text-uii-gold transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-uii-blue-900 transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-200/60">
                  {service.link ? (
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 text-xs font-bold text-uii-blue-900 hover:text-blue-700 transition-colors"
                    >
                      <span>Akses Layanan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={onOpenDownloads}
                      className="inline-flex items-center space-x-2 text-xs font-bold text-uii-blue-900 hover:text-blue-700 transition-colors"
                    >
                      <span>Lihat Dokumen Akreditasi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dedicated PDF Certificates Download Section */}
        <div id="downloads" className="mt-16 bg-gradient-to-br from-uii-blue-950 to-uii-blue-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-elevated">
          <div className="absolute top-0 right-0 w-80 h-80 bg-uii-gold/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-uii-gold text-xs font-bold uppercase tracking-wider mb-2">
                <FileCheck className="w-4 h-4" />
                <span>Dokumen Resmi Institusi</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Sertifikat Akreditasi Program Studi
              </h3>
              <p className="mt-1 text-blue-200 text-xs sm:text-sm">
                Unduh salinan resmi SK dan Sertifikat Akreditasi BAN-PT & LAM-Teknik untuk keperluan akademik dan verifikasi ijazah.
              </p>
            </div>

            <div className="flex-shrink-0">
              <span className="bg-uii-gold text-uii-blue-950 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-glow">
                Format PDF Terverifikasi
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {siteData.downloads.map((doc, dIdx) => (
              <a
                key={dIdx}
                href={doc.file}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-uii-gold flex-shrink-0" />
                  <span className="truncate group-hover:text-uii-gold transition-colors">{doc.name}</span>
                </div>
                <Download className="w-4 h-4 text-blue-300 group-hover:text-white flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

