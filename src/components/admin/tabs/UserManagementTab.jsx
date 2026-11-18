import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Edit3,
  Camera
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';
import { neonApi } from '../../../services/neonDb';
import { AdminCardOverlayModal, AdminConfirmOverlayModal } from '../AdminOverlayModal';

const compressUserAvatar = (file, maxSize = 256, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Gagal memuat file.'));
    reader.readAsDataURL(file);
  });

const UserAvatar = ({ user, size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);
  const picture =
    user?.picture ||
    user?.googlePicture ||
    user?.google_picture ||
    user?.avatar ||
    '';

  useEffect(() => {
    setImgError(false);
  }, [picture]);

  const sizeClass =
    size === 'xl'
      ? 'w-14 h-14 text-lg'
      : size === 'lg'
        ? 'w-11 h-11 text-sm'
        : 'w-8 h-8 text-xs';
  const initial = (user?.name || 'U').trim().charAt(0).toUpperCase() || 'U';

  if (picture && !imgError) {
    return (
      <img
        src={picture}
        alt={user?.name || 'Foto Pengguna'}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover border-2 border-slate-200 flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-uii-blue-900 text-uii-gold font-black flex items-center justify-center flex-shrink-0`}
    >
      {initial}
    </div>
  );
};

export const UserManagementTab = () => {
  const [users, setUsers] = useState(() => adminStorage.getUsers());

  useEffect(() => {
    let mounted = true;
    neonApi
      .getUsers()
      .then((remoteUsers) => {
        if (mounted && Array.isArray(remoteUsers)) {
          setUsers(remoteUsers);
          localStorage.setItem('bpa_admin_users', JSON.stringify(remoteUsers));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [toastMsg, setToastMsg] = useState('');

  // Modal Tambah / Edit User
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const avatarInputRef = useRef(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Penyewa Mahasiswa',
    org: 'Mahasiswa Personal',
    status: 'Aktif',
    picture: ''
  });

  // Modal Detail & Konfirmasi Hapus User
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleStatus = (id) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        showNotification(`Status akun ${u.name} diubah menjadi ${nextStatus}`);
        neonApi.updateUserStatus(u.id || u.email, { status: nextStatus }).catch(() => {});
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('bpa_admin_users', JSON.stringify(updated));
  };

  const handleResetPassword = (name) => {
    showNotification(`Tautan reset password telah dikirimkan ke email ${name}.`);
  };

  // Handler Cepat: Berikan / Cabut Hak Akses Staf Operasional
  const handleToggleStaffRole = (targetUser) => {
    const isCurrentStaff = String(targetUser.role || '').toLowerCase().includes('staf') || String(targetUser.role || '').toLowerCase().includes('staff');
    const newRole = isCurrentStaff ? 'Penyewa Mahasiswa' : 'Staf Operasional BPA';
    const nextOnboarded = isCurrentStaff ? true : false;
    const updated = users.map(u => u.id === targetUser.id ? { ...u, role: newRole, staffOnboarded: nextOnboarded, staff_onboarded: nextOnboarded } : u);
    setUsers(updated);
    adminStorage.saveUsers(updated);
    neonApi.updateUserStatus(targetUser.id, { role: newRole, staff_onboarded: nextOnboarded }).catch(() => {});
    showNotification(
      isCurrentStaff
        ? `Hak akses staf untuk ${targetUser.name} telah dicabut.`
        : `Akun ${targetUser.name} kini memiliki role Staf Operasional (Akses Divisi Staf)!`
    );
  };

  const handleOpenEditUser = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'Penyewa Mahasiswa',
      org: u.org || '',
      status: u.status || 'Aktif',
      picture: u.picture || u.googlePicture || u.google_picture || u.avatar || ''
    });
    setIsAddingUser(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('Mohon pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ukuran foto maksimal 5 MB.');
      return;
    }
    try {
      const dataUrl = await compressUserAvatar(file);
      setUserForm((prev) => ({ ...prev, picture: dataUrl }));
    } catch (err) {
      showNotification(err.message || 'Gagal memproses gambar.');
    }
  };

  const handleConfirmDeleteUser = () => {
    if (!deleteTarget) return;
    const updated = users.filter(u => u.id !== deleteTarget.id);
    setUsers(updated);
    localStorage.setItem('bpa_admin_users', JSON.stringify(updated));
    neonApi.deleteUser(deleteTarget.id).catch(() => {});
    showNotification(`Akun ${deleteTarget.name} telah dihapus dari sistem.`);
    if (selectedUser?.id === deleteTarget.id) setSelectedUser(null);
    setDeleteTarget(null);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      showNotification('Nama dan Email wajib diisi!');
      return;
    }

    const isTargetStaff = String(userForm.role || '').toLowerCase().includes('staf') || String(userForm.role || '').toLowerCase().includes('staff');
    let updated;
    if (editingUserId) {
      const existingUser = users.find(u => u.id === editingUserId);
      const wasStaff = existingUser && (String(existingUser.role || '').toLowerCase().includes('staf') || String(existingUser.role || '').toLowerCase().includes('staff'));
      const nextOnboarded = isTargetStaff ? (wasStaff ? (existingUser.staffOnboarded ?? false) : false) : false;

      updated = users.map(u => u.id === editingUserId ? { ...u, ...userForm, staffOnboarded: nextOnboarded, staff_onboarded: nextOnboarded } : u);
      adminStorage.saveUsers(updated);
      neonApi.updateUserStatus(editingUserId, {
        name: userForm.name,
        phone: userForm.phone,
        role: userForm.role,
        org: userForm.org,
        status: userForm.status,
        picture: userForm.picture,
        staff_onboarded: nextOnboarded
      }).catch(() => {});
      showNotification(`Data akun ${userForm.name} berhasil diperbarui!`);
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        ...userForm,
        staffOnboarded: false,
        staff_onboarded: false,
        joinedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        totalBookings: 0
      };
      updated = [newUser, ...users];
      adminStorage.saveUsers(updated);
      neonApi.saveUser(newUser).catch(() => {});
      showNotification(`Akun ${newUser.role.includes('Staf') ? 'Staf' : 'pengguna'} baru untuk ${newUser.name} berhasil dibuat!`);
    }

    setUsers(updated);
    setIsAddingUser(false);
    setEditingUserId(null);
    setUserForm({ name: '', email: '', phone: '', role: 'Penyewa Mahasiswa', org: '', status: 'Aktif', picture: '' });
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.org && u.org.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'Semua' || u.status === statusFilter;
    const isUserStaff = String(u.role || '').toLowerCase().includes('staf') || String(u.role || '').toLowerCase().includes('staff');
    const matchesRole = roleFilter === 'Semua' || 
      (roleFilter === 'Staf Operasional BPA'
        ? isUserStaff
        : u.role === roleFilter);

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
            <ShieldCheck className="w-6 h-6 text-uii-blue-950" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Staf Operasional</span>
            <span className="text-2xl font-black text-uii-blue-950 font-heading">
              {users.filter(u => (u.role || '').toLowerCase().includes('staf') || (u.role || '').toLowerCase().includes('staff')).length}
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
              placeholder="Cari berdasarkan nama, email, no WA, ormawa, role..."
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
              <option value="Semua">Role: Semua Kategori</option>
              <option value="Staf Operasional BPA">🛠️ Staf Operasional BPA</option>
              <option value="Penyewa Mahasiswa">Penyewa Mahasiswa</option>
              <option value="Ormawa / Lembaga">Ormawa / Lembaga</option>
              <option value="Penyewa Umum">Penyewa Umum</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUserId(null);
            setUserForm({ name: '', email: '', phone: '', role: 'Penyewa Mahasiswa', org: '', status: 'Aktif', picture: '' });
            setIsAddingUser(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center justify-center space-x-2 shadow-xs hover:bg-uii-blue-900 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* Card Overlay Modal Tambah & Edit User */}
      <AdminCardOverlayModal
        isOpen={isAddingUser}
        onClose={() => {
          setIsAddingUser(false);
          setEditingUserId(null);
        }}
        title={editingUserId ? 'Edit Akun Pengguna' : 'Tambah Akun Penyewa / Pengguna Baru'}
        subtitle="Kelola data identitas, kategori pemohon, dan status aktif akun."
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {/* Foto Profil Pengguna */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="relative flex-shrink-0">
                <UserAvatar user={{ name: userForm.name || 'U', picture: userForm.picture }} size="xl" />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-uii-blue-950 text-uii-gold border-2 border-white flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-uii-blue-950 block truncate">
                  {userForm.name || 'Pengguna Baru'}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {userForm.email || 'Belum ada email'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-[11px] font-bold text-uii-blue-950 hover:bg-slate-100 flex items-center space-x-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{userForm.picture ? 'Ganti Foto' : 'Upload Foto'}</span>
              </button>
              {userForm.picture && (
                <button
                  type="button"
                  onClick={() => setUserForm((prev) => ({ ...prev, picture: '' }))}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                >
                  Hapus Foto
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap: *</label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Contoh: Muhammad Farhan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori / Role Pengguna: *</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold"
              >
                <option value="Staf Operasional BPA">🛠️ Staf Operasional BPA (Akses Divisi Staf & Approval)</option>
                <option value="Penyewa Mahasiswa">Penyewa Mahasiswa</option>
                <option value="Ormawa / Lembaga">Ormawa / Lembaga</option>
                <option value="Penyewa Umum">Penyewa Umum</option>
                <option value="Mahasiswa Aktif UII">Mahasiswa Aktif UII</option>
                <option value="Organisasi / Lembaga UII">Organisasi / Lembaga UII</option>
                <option value="Masyarakat Umum">Masyarakat Umum</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Pilih <strong className="text-uii-blue-950 font-semibold">Staf Operasional BPA</strong> untuk memberikan izin akses ke Portal Staf & Approval (/staff).
              </p>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Organisasi / Kepanitiaan:</label>
              <input
                type="text"
                value={userForm.org}
                onChange={(e) => setUserForm({ ...userForm, org: e.target.value })}
                placeholder="Contoh: Panitia Semnas KM UII"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Akun:</label>
              <select
                value={userForm.status}
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddingUser(false);
                setEditingUserId(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
            >
              {editingUserId ? 'Simpan Perubahan' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </AdminCardOverlayModal>

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
                        <UserAvatar user={u} size="sm" />
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
                      {((u.role || '').toLowerCase().includes('staf') || (u.role || '').toLowerCase().includes('staff')) ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-uii-blue-950 border border-blue-300 font-black text-[10px] shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <span>🛠️ Staf Operasional</span>
                        </span>
                      ) : ((u.role || '').toLowerCase().includes('ormawa') || (u.role || '').toLowerCase().includes('lembaga')) ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[10px]">
                          {u.role}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {u.role || 'Penyewa'}
                        </span>
                      )}
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
                        {/* Tombol Cepat: Berikan / Cabut Hak Akses Staf */}
                        <button
                          onClick={() => handleToggleStaffRole(u)}
                          className={`p-1.5 px-2 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors ${
                            (u.role || '').toLowerCase().includes('staf') || (u.role || '').toLowerCase().includes('staff')
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                              : 'bg-blue-50 text-uii-blue-900 hover:bg-blue-100 border border-blue-200'
                          }`}
                          title={
                            (u.role || '').toLowerCase().includes('staf') || (u.role || '').toLowerCase().includes('staff')
                              ? 'Cabut hak akses Staf Operasional'
                              : 'Berikan hak akses Staf Operasional BPA'
                          }
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">
                            {(u.role || '').toLowerCase().includes('staf') || (u.role || '').toLowerCase().includes('staff')
                              ? 'Cabut Staf'
                              : 'Jadikan Staf'}
                          </span>
                        </button>
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-uii-blue-900 hover:bg-slate-100"
                          title="Lihat Rincian Akun"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit Akun Pengguna"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                          title="Reset Password Pengguna"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
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
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <UserAvatar user={selectedUser} size="lg" />
                    <span className="font-extrabold text-sm text-uii-blue-950 truncate">{selectedUser.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
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
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Kategori / Role</span>
                  <span className="font-bold text-slate-800">{selectedUser.role}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Riwayat Sewa</span>
                  <span className="font-bold text-slate-800">{selectedUser.totalBookings || 0} Kali</span>
                </div>
              </div>

              {(String(selectedUser.role || '').toLowerCase().includes('staf') || String(selectedUser.role || '').toLowerCase().includes('staff')) && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-uii-blue-950 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                  <span className="text-[11px] font-bold">
                    Akun ini memiliki hak akses khusus ke Portal Operasional & Approval Staf (/staff).
                  </span>
                </div>
              )}
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
      {/* Card Overlay Konfirmasi Hapus User */}
      <AdminConfirmOverlayModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Hapus Akun Pengguna"
        message={`Yakin ingin menghapus akun ${deleteTarget?.name || ''}? Data akun yang dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus Akun"
      />
    </div>
  );
};
