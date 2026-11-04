import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Users, Globe2, Sparkles } from 'lucide-react';
import { siteData } from '../data/siteData';

export const QuickStats = () => {
  const icons = [GraduationCap, Award, Users, Globe2];

  return (
    <section className="relative -mt-10 sm:-mt-14 z-30 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {siteData.stats.map((stat, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-5 shadow-soft hover:shadow-elevated border border-slate-100 transition-all flex items-start space-x-4 relative overflow-hidden group"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-uii-blue-900 to-uii-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              
              <div className="p-3 rounded-xl bg-uii-blue-50 text-uii-blue-900 group-hover:bg-uii-blue-900 group-hover:text-uii-gold transition-colors duration-300">
                <Icon className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold font-heading text-uii-blue-950">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-uii-gold-600 uppercase">
                    {stat.suffix}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-800 mt-0.5">
                  {stat.label}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

