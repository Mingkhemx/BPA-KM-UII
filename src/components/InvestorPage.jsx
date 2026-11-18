import React, { useState, useEffect, useMemo } from 'react';
import { User, Download, FileText, Users } from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';

const DIVISION_TITLES = {
  'Presiden Direktur': 'Presiden Direktur',
  ADKEU: 'Administrasi dan Keuangan (ADKEU)',
  PUS: 'Pengembangan Usaha Strategis (PUS)',
  PDP: 'Publikasi dan Pemasaran (PDP)',
  PSP: 'Pengembangan Strategis dan Pengelolaan (PSP)',
  PSDM: 'Pengembangan Sumber Daya Manusia (PSDM)',
};

const DIVISION_ORDER = ['Presiden Direktur', 'ADKEU', 'PUS', 'PDP', 'PSP', 'PSDM'];

export const InvestorPage = () => {
  const [members, setMembers] = useState(() => adminStorage.getTeam());
  const [documents, setDocuments] = useState(() => adminStorage.getDocuments());

  useEffect(() => {
    const syncInvestorData = () => {
      setMembers(adminStorage.getTeam());
      setDocuments(adminStorage.getDocuments());
    };
    window.addEventListener('bpa-data-updated', syncInvestorData);
    window.addEventListener('storage', syncInvestorData);
    return () => {
      window.removeEventListener('bpa-data-updated', syncInvestorData);
      window.removeEventListener('storage', syncInvestorData);
    };
  }, []);

  const groupedDivisions = useMemo(() => {
    const groups = new Map();
    members.forEach((m) => {
      const key = m.division || 'Lainnya';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    });
    const keys = Array.from(groups.keys()).sort((a, b) => {
      const ia = DIVISION_ORDER.indexOf(a);
      const ib = DIVISION_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    return keys.map((key) => ({
      key,
      title: DIVISION_TITLES[key] || key,
      list: groups.get(key),
    }));
  }, [members]);

  const skDocs = useMemo(
    () => documents.filter((d) => (d.type || '').toUpperCase().includes('SK')),
    [documents]
  );

  const lpjDocs = useMemo(
    () => documents.filter((d) => !(d.type || '').toUpperCase().includes('SK')),
    [documents]
  );

  const MemberCard = ({ member }) => {
    const [imgError, setImgError] = useState(false);

    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-between text-center w-full max-w-[250px] mx-auto group">
        <div>
          <div className="w-28 h-36 rounded-[48px] overflow-hidden bg-slate-700 mx-auto relative shadow-inner border-2 border-slate-100 flex items-center justify-center">
            {!imgError && member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-slate-600 to-slate-800 flex flex-col items-center justify-center text-white/70">
                <User className="w-12 h-12 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider">
                  {(member.name || 'BP').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>
            )}
          </div>

          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm font-heading tracking-wide uppercase mt-4 mb-1 leading-snug line-clamp-2">
            {member.name}
          </h4>
        </div>

        <p className="text-[10px] sm:text-[11px] font-bold text-sky-600 uppercase tracking-wider mt-1">
          {member.role}
        </p>
      </div>
    );
  };

  const renderDocCard = (doc) => (
    <div key={doc.id || doc.title} className="flex flex-col space-y-3 max-w-[260px]">
      <div className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-center bg-slate-50 overflow-hidden group min-h-[200px]">
        {doc.fileImage ? (
          <img
            src={doc.fileImage}
            alt={doc.title}
            className="w-full h-auto max-h-[320px] object-contain group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="py-12 text-slate-300 flex flex-col items-center">
            <FileText className="w-10 h-10 mb-2" />
            <span className="text-[11px] font-semibold text-slate-400">{doc.period || doc.type || 'Dokumen'}</span>
          </div>
        )}
      </div>
      <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
        {doc.title}
      </h4>
      {doc.downloadUrl && (
        <a
          href={doc.downloadUrl}
          download
          className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Laporan</span>
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* 1. Header Judul Halaman */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-uii-blue-950 font-heading tracking-tight leading-tight">
            Struktur Organisasi
            <span className="block text-uii-blue-900 mt-1">BPA KM UII</span>
          </h1>
        </div>

        {/* 2. Bagan Struktur Organisasi */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="rounded-3xl overflow-hidden shadow-elevated border border-slate-200/80 bg-[#122844]">
            <img
              src="/images/INVESTOR/DPM-UII-Komisi-IV.png"
              alt="Struktur Organisasi BPA KM UII"
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>

        {/* 3. Teks Keterangan Pengantar */}
        <p className="text-center text-sm sm:text-base text-slate-600 max-w-3xl mx-auto mb-14 leading-relaxed">
          Struktur Organisasi BPA KM UII dipimpin oleh Presiden Direktur dan dibantu oleh manajer serta staf pada setiap divisi.
        </p>

        {/* 4. Daftar Anggota per Divisi */}
        {groupedDivisions.length === 0 ? (
          <section className="mb-16">
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 max-w-xl mx-auto space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum ada data struktur fungsionaris</h3>
              <p className="text-xs text-slate-500">
                Data pengurus dan fungsionaris BPA KM UII akan tampil setelah ditambahkan oleh admin.
              </p>
            </div>
          </section>
        ) : (
          groupedDivisions.map((group) => (
            <section key={group.key} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-8">
                {group.title}
              </h2>
              {group.list.length === 1 ? (
                <div className="flex justify-center">
                  <MemberCard member={group.list[0]} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {group.list.map((m, idx) => (
                    <MemberCard key={m.id || idx} member={m} />
                  ))}
                </div>
              )}
            </section>
          ))
        )}

        {/* 5. Bagian Surat Keputusan (SK) BPA KM UII */}
        <section className="mb-16 pt-10 border-t border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading mb-8">
            Surat Keputusan BPA KM UII
          </h2>
          {skDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 text-xs text-slate-500">
              Belum ada dokumen Surat Keputusan (SK) yang dipublikasikan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {skDocs.map(renderDocCard)}
            </div>
          )}
        </section>

        {/* 6. Bagian Laporan Pertanggungjawaban (LPJ) BPA KM UII */}
        <section className="mb-16 pt-10 border-t border-slate-200">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading leading-tight">
              Laporan Pertanggung
              <span className="block">Jawaban BPA KM UII</span>
            </h2>
          </div>
          {lpjDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 text-xs text-slate-500">
              Belum ada dokumen Laporan Pertanggungjawaban (LPJ) yang dipublikasikan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {lpjDocs.map(renderDocCard)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
