import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Phone, 
  Mail, 
  Building, 
  Trash2, 
  KeyRound,
  Filter,
  Check,
  X
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';

export const UserManagementTab = () => {
  const [users, setUsers] = useState(() => adminStorage.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [toastMsg, setToastMsg] = useState('');

  // Modal Tambah User
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Penyewa Mahasiswa',
    org: 'Mahasiswa Personal',
    status: 'Aktif'
  });

  // Modal Detail User
  const [selectedUser, setSelectedUser] = useState(null);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleStatus = (id) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        showNotification(`Status akun ${u.name} diubah menjadi ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    adminStorage.saveUsers(updated);
  };

  const handleResetPassword = (name) => {
    alert(`Tautan pemulihan kata sandi telah dikirimkan ke email terdaftar untuk ${name}.`);
    showNotification(`Instruksi reset password ${name} berhasil diproses`);
  };

  const handleDeleteUser = (id, name) => {
    if (confirm(`Yakin ingin menghapus akun ${name}? Data akun tidak dapat dikembalikan.`)) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      adminStorage.saveUsers(updated);
      showNotification(`Akun ${name} telah dihapus dari sistem.`);
      if (selectedUser?.id === id) setSelectedUser(null);
    }
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert('Nama dan Email wajib diisi!');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      ...userForm,
      joinedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalBookings: 0
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    adminStorage.saveUsers(updated);
    setIsAddingUser(false);
    setUserForm({ name: '', email: '', phone: '', role: 'Penyewa Mahasiswa', org: '', status: 'Aktif' });
    showNotification(`Akun penyewa baru untuk ${newUser.name} berhasil dibuat!`);
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.org && u.org.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'Semua' || u.status === statusFilter;
    const matchesRole = roleFilter === 'Semua' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-uii-blue-950 text-uii-gold border border-uii-gold/40 shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-uii-gold" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Quick Stats Akun Pengguna */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-uii-blue-900 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengguna</span>
            <span className="text-2xl font-black text-uii-blue-950 font-heading">{users.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Akun Aktif</span>
            <span className="text-2xl font-black text-emerald-600 font-heading">
              {users.filter(u => u.status === 'Aktif').length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ormawa & Lembaga</span>
            <span className="text-2xl font-black text-amber-800 font-heading">
              {users.filter(u => u.role.includes('Ormawa') || u.role.includes('Lembaga')).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Akun Dinonaktifkan</span>
            <span className="text-2xl font-black text-rose-600 font-heading">
              {users.filter(u => u.status === 'Nonaktif').length}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Search & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, email, no WA, ormawa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/20 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <option value="Semua">Status: Semua</option>
              <option value="Aktif">Status: Aktif</option>
              <option value="Nonaktif">Status: Nonaktif</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <option value="Semua">Kategori: Semua</option>
              <option value="Penyewa Mahasiswa">Penyewa Mahasiswa</option>
              <option value="Ormawa / Lembaga">Ormawa / Lembaga</option>
              <option value="Penyewa Umum">Penyewa Umum</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsAddingUser(true)}
          className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center justify-center space-x-2 shadow-xs hover:bg-uii-blue-900 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* Form Tambah User Modal */}
      {isAddingUser && (
        <form onSubmit={handleSaveUser} className="p-6 bg-slate-50 border-2 border-uii-blue-900/20 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-sm font-black text-uii-blue-950 font-heading">
              Tambah Akun Penyewa / Pengguna Baru
            </h4>
            <button type="button" onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap: *</label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Contoh: Muhammad Farhan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email: *</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="nama@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp: *</label>
              <input
                type="tel"
                required
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Pengguna:</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Penyewa Mahasiswa">Penyewa Mahasiswa</option>
                <option value="Ormawa / Lembaga">Ormawa / Lembaga</option>
                <option value="Penyewa Umum">Penyewa Umum</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Organisasi / Kepanitiaan:</label>
              <input
                type="text"
                value={userForm.org}
                onChange={(e) => setUserForm({ ...userForm, org: e.target.value })}
                placeholder="Contoh: Panitia Semnas KM UII"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Akun:</label>
              <select
                value={userForm.status}
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      )}

      {/* Tabel Data Akun Pengguna */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Kontak (Email & WA)</th>
                <th className="py-3.5 px-4">Lembaga / Organisasi</th>
                <th className="py-3.5 px-4">Kategori Akun</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Riwayat Sewa</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-uii-blue-900 text-uii-gold font-black flex items-center justify-center text-xs flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-uii-blue-950 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 block">Gabung: {u.joinedDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-700 block truncate max-w-xs">{u.email}</span>
                        <span className="text-[10px] text-slate-400 block">{u.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {u.org || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-colors ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Klik untuk ubah status akun"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.status}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {u.totalBookings || 0} Pengajuan
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-uii-blue-900 hover:bg-slate-100"
                          title="Lihat Rincian Akun"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                          title="Reset Password Pengguna"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada akun pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail User */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-uii-blue-950 font-heading">Rincian Akun Pengguna</h4>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-uii-blue-950">{selectedUser.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedUser.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="text-slate-600 space-y-1">
                  <p className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.email}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.phone}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.org || 'Penyewa Mandiri'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Kategori</span>
                  <span className="font-bold text-slate-800">{selectedUser.role}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Riwayat Sewa</span>
                  <span className="font-bold text-slate-800">{selectedUser.totalBookings || 0} Kali</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
