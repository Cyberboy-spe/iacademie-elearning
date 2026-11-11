import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Users as UsersIcon, Trash2, Search, Loader2, ShieldCheck, User, ChevronDown, Check, GraduationCap } from 'lucide-react';
import API from '../services/api';

// --- Composant Dropdown de Rôle Moderne ---
const RoleDropdown = ({ currentRole, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    {
      id: 'student',
      label: 'Étudiant',
      icon: GraduationCap,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
    },
    {
      id: 'admin',
      label: 'Administrateur',
      icon: ShieldCheck,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20'
    }
  ];

  const activeRole = roles.find((r) => r.id === currentRole) || roles[0];
  const ActiveIcon = activeRole.icon;

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 shadow-sm ${activeRole.color} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md active:scale-95'
        }`}
      >
        <ActiveIcon className="w-4 h-4 shrink-0" />
        <span>{activeRole.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover / Menu déroulant moderne */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1 space-y-1">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = currentRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    onChange(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all duration-150 ${
                    isSelected
                      ? 'bg-violet-600/20 text-violet-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <RoleIcon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span>{role.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Composant Principal Users ---
const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    API.get('/api/admin/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Erreur chargement utilisateurs :', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRoleId(userId);
    try {
      await API.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Erreur de mise à jour du rôle :', err);
      alert('Impossible de modifier le rôle.');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDelete = (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    setDeletingId(userId);
    API.delete(`/api/admin/users/${userId}`)
      .then(() => setUsers(users.filter((u) => u.id !== userId)))
      .catch((err) => {
        console.error('Erreur de suppression :', err);
        alert('Impossible de supprimer cet utilisateur.');
      })
      .finally(() => setDeletingId(null));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-full">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-violet-500" />
            {t('utilisateurs_roles', 'Utilisateurs & Rôles')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gérez les comptes inscrits et leurs autorisations dans la plateforme IACADEMIE.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Tableau des Utilisateurs */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-visible shadow-xl backdrop-blur-md">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm font-medium">Chargement de la liste des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{user.id}</td>
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/30 shadow-sm">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleDropdown
                        currentRole={user.role || 'student'}
                        onChange={(newRole) => handleRoleChange(user.id, newRole)}
                        disabled={updatingRoleId === user.id}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deletingId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;