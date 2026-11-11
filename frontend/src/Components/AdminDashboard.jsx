import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Boxes, 
  Users as UsersIcon, 
  BookOpen, 
  Search, 
  Globe, 
  Bell, 
  LogOut,
  ChevronDown,
  Loader2,
  Check,
  Settings,
  User,
  X,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';
import Users from './Users'; 
import AdminCourses from './AdminCourses'; 
import Commercial from './Commercial';
import Stock from './Stock';

const languages = [
  { code: 'fr', label: 'FR - Français', flag: '🇫🇷' },
  { code: 'ar', label: 'AR - العربية', flag: '🇩🇿' },
  { code: 'en', label: 'EN - English', flag: '🇬🇧' }
];

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentLang, setCurrentLang] = useState(
    i18n.language ? i18n.language.substring(0, 2).toLowerCase() : 'fr'
  );

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    full_name: 'Younes Admin',
    email: 'admin@iacademie.com',
    current_password: '',
    new_password: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [stats, setStats] = useState({
    total_users: 0,
    total_courses: 0,
    total_videos: 0,
    total_earnings: 0,
    recent_sales: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const langCode = (i18n.language || 'fr').substring(0, 2).toLowerCase();
    setCurrentLang(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
  }, [i18n.language]);

  useEffect(() => {
    API.get('/api/admin/dashboard-stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Erreur chargement stats dashboard :', err))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleLanguageChange = (code) => {
    setCurrentLang(code);
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await API.put('/api/admin/profile', adminProfile);
      setProfileSuccess(res.data.message || 'Profil mis à jour avec succès !');
      setTimeout(() => {
        setIsEditProfileModalOpen(false);
        setProfileSuccess('');
      }, 1500);
      setAdminProfile(prev => ({ ...prev, current_password: '', new_password: '' }));
    } catch (err) {
      console.error('Erreur mise à jour profil :', err);
      const errorMsg = err.response?.data?.detail || "Erreur lors de la mise à jour du profil.";
      setProfileError(errorMsg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const selectedLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 m-0 p-0">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700/70 flex flex-col justify-between shrink-0 z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-700/60 gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
              IA
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white">IACADEMIE</h1>
              <p className="text-xs text-violet-400 font-medium">Admin System</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('menu_principal', 'Menu Principal')}
            </p>

            <Link 
              to="/admin/dashboard" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                location.pathname === '/admin/dashboard' || location.pathname === '/admin'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('tableau_de_bord', 'Tableau de Bord')}</span>
            </Link>

            <Link 
              to="/admin/commercial" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                location.pathname === '/admin/commercial' 
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-5 h-5 text-slate-400" />
              <span>{t('gestion_commerciale', 'Gestion Commerciale')}</span>
            </Link>

            <Link 
              to="/admin/stock" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                location.pathname === '/admin/stock' 
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Boxes className="w-5 h-5 text-slate-400" />
              <span>{t('stock_inventaire', 'Stock & Inventaire')}</span>
            </Link>

            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">
              {t('administration', 'Administration')}
            </p>

            <Link 
              to="/admin/users" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                location.pathname === '/admin/users' 
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              <span>{t('utilisateurs_roles', 'Utilisateurs & Rôles')}</span>
            </Link>

            <Link 
              to="/admin/courses" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                location.pathname === '/admin/courses' 
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{t('gestion_cours', 'Gestion des Cours')}</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700/60">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium text-sm transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('deconnexion', 'Déconnexion')}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 relative">
        
        {/* HEADER */}
        <header className="h-16 bg-slate-800 border-b border-slate-700/60 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('rechercher_placeholder', 'Rechercher des utilisateurs, cours...')} 
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-4">
            
            {/* SÉLECTEUR DE LANGUE */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm hover:border-violet-500/50"
              >
                <Globe className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="flex items-center gap-1.5">
                  <span>{selectedLangObj.flag}</span>
                  <span>{selectedLangObj.label}</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-44 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                        currentLang === lang.code 
                          ? 'bg-violet-600/20 text-violet-300 font-bold' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="relative p-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-700"></div>

            {/* PROFIL ADMINISTRATEUR */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 cursor-pointer pl-1 p-1 rounded-xl hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-700"
              >
                <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold text-sm">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-100 leading-tight">{adminProfile.full_name}</p>
                  <p className="text-[11px] text-violet-400">Super Administrateur</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Connecté en tant que</p>
                    <p className="text-xs font-semibold text-white truncate">{adminProfile.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsProfileOpen(false); setProfileError(''); setProfileSuccess(''); setIsEditProfileModalOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-violet-600/20 transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-violet-400" />
                    Paramètres du compte
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* CONTENU DYNAMIQUE STRICTEMENT SÉPARÉ SELON L'URL */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {location.pathname === '/admin/commercial' ? (
            <Commercial />  
          ) : location.pathname === '/admin/users' ? (
            <Users />
          ) : location.pathname === '/admin/courses' ? (
            <AdminCourses />
          ) : location.pathname === '/admin/stock' ? (
            <Stock />  
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome back, Younes Admin! 👋
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Track your management and LMS platform performance
                </p>
              </div>

              {/* CARTES AVEC LES CHIFFRES RÉELS DE LA BDD ET DZD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl hover:border-violet-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
                    <span className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs">👥</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-violet-400" /> : stats.total_users}
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <span>✓ Connecté à MySQL</span>
                  </p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl hover:border-violet-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Course</p>
                    <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">📚</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> : stats.total_courses}
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <span>✓ Actifs en BDD MySQL</span>
                  </p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl hover:border-violet-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Video</p>
                    <span className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">🎥</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400" /> : stats.total_videos}
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <span>✓ Leçons uploadées</span>
                  </p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl hover:border-violet-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earnings</p>
                    <span className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">💰</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {stats.total_earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })} DZD
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <span>✓ Revenus cumulés</span>
                  </p>
                </div>
              </div>

              {/* SECTION GRAPHIQUES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-base font-bold text-white">Overview</h3>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">▲ 23,5%</span>
                    </div>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-700/60">
                    {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Friday'].map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full max-w-[36px] bg-slate-900/60 rounded-t-xl flex flex-col justify-end overflow-hidden h-36">
                          <div className="bg-indigo-500/40 w-full" style={{ height: `${20 + (idx * 7)}%` }}></div>
                          <div className="bg-violet-600 w-full" style={{ height: `${30 + (idx * 5)}%` }}></div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Student Analysis</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-full">▼ 3.5%</span>
                  </div>
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-8 border-violet-600/30 border-t-violet-500 flex items-center justify-center shadow-inner">
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-white">72%</p>
                        <p className="text-[10px] text-slate-400 uppercase">Engagement</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 text-center">Basé sur l'activité hebdomadaire IA-CADEMIE.</p>
                </div>
              </div>

              {/* TABLE DES TRANSACTIONS DYNAMIQUES */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-700/80 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Transactions & Inscriptions Récentes</h3>
                  <Link to="/admin/commercial" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                    View All &rarr;
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                        <th className="p-4">ID Vente</th>
                        <th className="p-4">Cours / Élément</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Payment Methods</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-xs text-slate-300">
                      {stats.recent_sales && stats.recent_sales.length > 0 ? (
                        stats.recent_sales.map((sale) => (
                          <tr key={sale[0]}>
                            <td className="p-4 font-semibold text-white">#{sale[0]}</td>
                            <td className="p-4 font-medium text-white">{sale[1]}</td>
                            <td className="p-4 font-semibold text-emerald-400">{sale[2]} DZD</td>
                            <td className="p-4">💳 {sale[3]}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">Success</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-400">
                            Aucune transaction récente enregistrée en base de données.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

      </div>

      {/* MODALE PROFIL ADMIN */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              Paramètres du compte Administrateur
            </h3>

            {profileError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={adminProfile.full_name}
                  onChange={(e) => setAdminProfile({ ...adminProfile, full_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse E-mail</label>
                <input
                  type="email"
                  required
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ancien Mot de Passe (Requis pour modifier)</label>
                <input
                  type="password"
                  placeholder="Votre mot de passe actuel"
                  value={adminProfile.current_password}
                  onChange={(e) => setAdminProfile({ ...adminProfile, current_password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nouveau Mot de Passe (Optionnel)</label>
                <input
                  type="password"
                  placeholder="Laissez vide pour conserver l'actuel"
                  value={adminProfile.new_password}
                  onChange={(e) => setAdminProfile({ ...adminProfile, new_password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-600/20"
                >
                  {updatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;