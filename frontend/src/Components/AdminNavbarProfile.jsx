import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Lock, Mail, Camera, Check, X } from 'lucide-react';
import API from '../services/api';

const AdminProfileDropdown = ({ adminUser, onUpdateUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Formulaire de modification de profil
  const [formData, setFormData] = useState({
    full_name: adminUser?.full_name || 'Younes Admin',
    email: adminUser?.email || 'admin@iacademie.com',
    current_password: '',
    new_password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Appel API pour mettre à jour les infos de l'admin
      const res = await API.put(`/api/admin/profile`, formData);
      if (onUpdateUser) onUpdateUser(res.data.user);
      alert('Profil mis à jour avec succès !');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du profil.');
    } finally {
      setSubmitting(false);
    }
  };

  // Obtenir les initiales
  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Profil Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all duration-200 cursor-pointer text-left"
      >
        <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold flex items-center justify-center text-sm shadow-inner">
          {getInitials(adminUser?.full_name)}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">{adminUser?.full_name || 'Younes Admin'}</p>
          <p className="text-[11px] text-violet-400 font-medium">Super Administrateur</p>
        </div>
      </button>

      {/* Menu Déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2.5 border-b border-slate-800">
            <p className="text-xs text-slate-400">Connecté en tant que</p>
            <p className="text-xs font-semibold text-white truncate">{adminUser?.email || 'admin@iacademie.com'}</p>
          </div>

          <button
            onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-violet-600/20 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-violet-400" />
            Modifier mon compte
          </button>

          <div className="border-t border-slate-800 my-1"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Déconnexion
          </button>
        </div>
      )}

      {/* Modal Édition de Compte */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              Modifier le compte Administrateur
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom Complet</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nouveau Mot de Passe (Optionnel)</label>
                <input
                  type="password"
                  placeholder="Laissez vide pour conserver l'actuel"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {submitting ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileDropdown;