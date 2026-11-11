import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Video, 
  FileText, 
  Loader2, 
  X, 
  Image as ImageIcon, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  User, 
  CheckCircle2, 
  PlayCircle 
} from 'lucide-react';
import API from '../services/api';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tous');
  const [deletingId, setDeletingId] = useState(null);

  // État pour la vue détaillée d'un cours (Course Overview)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [openSections, setOpenSections] = useState({ 1: true });

  // Modal State étendu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Développement',
    custom_category: '',
    sub_category: 'Web Dev',
    selling_type: 'Disponible en enregistré',
    instructor: 'Younes Leghmizi',
    base_price: '',
    discount_percent: 0,
    coverImage: null,
    videos: []
  });

  const categoriesList = ['Tous', 'Développement', 'Cybersécurité', 'Intelligence Artificielle', 'E-Book'];

  // Fetch Courses from API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Erreur chargement des cours :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle File Selections
  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCourse({ ...newCourse, coverImage: e.target.files[0] });
    }
  };

  const handleVideosChange = (e) => {
    if (e.target.files) {
      const selectedVideos = Array.from(e.target.files);
      setNewCourse({ ...newCourse, videos: selectedVideos });
    }
  };

  // Handle Course Creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      
      const finalCategory = newCourse.category === 'Autre' ? newCourse.custom_category : newCourse.category;
      formData.append('category', finalCategory);
      
      formData.append('sub_category', newCourse.sub_category);
      formData.append('selling_type', newCourse.selling_type);
      formData.append('instructor', newCourse.instructor);
      formData.append('base_price', newCourse.base_price || 0);
      formData.append('discount_percent', newCourse.discount_percent);
      
      if (newCourse.coverImage) {
        formData.append('cover_image', newCourse.coverImage);
      }
      
      newCourse.videos.forEach((video) => {
        formData.append('videos', video);
      });

      const res = await API.post('/api/admin/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCourses([res.data.course, ...courses]);
      setIsModalOpen(false);
      setNewCourse({
        title: '',
        description: '',
        category: 'Développement',
        custom_category: '',
        sub_category: 'Web Dev',
        selling_type: 'Disponible en enregistré',
        instructor: 'Younes Leghmizi',
        base_price: '',
        discount_percent: 0,
        coverImage: null,
        videos: []
      });
    } catch (err) {
      console.error('Erreur création cours :', err);
      alert('Impossible de créer le cours.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Course Deletion
  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation(); // Évite de déclencher l'ouverture du cours
    if (!window.confirm('Voulez-vous vraiment supprimer ce cours ?')) return;

    setDeletingId(courseId);
    try {
      await API.delete(`/api/admin/courses/${courseId}`);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error('Erreur suppression cours :', err);
      alert('Impossible de supprimer le cours.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'Tous' || course.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // ==========================================
  // VUE DÉTAILLÉE DU COURS (COURSE OVERVIEW)
  // ==========================================
  if (selectedCourse) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-full animate-fadeIn">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>

          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-violet-600/20 cursor-pointer">
            <Plus className="w-4 h-4" />
            Ajouter une Leçon
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Course Overview</h2>
          <p className="text-slate-400 text-xs mt-1">Vérifiez et gérez le contenu du cours en temps réel.</p>
        </div>

        {/* Grille principale 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche (Lecteur & Infos) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl aspect-video relative flex items-center justify-center">
              <video 
                controls 
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white leading-tight">{selectedCourse.title}</h1>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    {selectedCourse.instructor || "Younes Leghmizi"}
                    <span className="text-xs font-normal text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                      Instructeur
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">{selectedCourse.selling_type || "Disponible en enregistré"}</p>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="border-b border-slate-700/60 flex items-center gap-6">
              {['Overview', 'FAQ', 'Review'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
                    activeTab === tab
                      ? 'text-violet-400 border-b-2 border-violet-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Overview' && (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                <p>{selectedCourse.description || "Aucune description détaillée fournie pour ce cours."}</p>

                <div>
                  <h4 className="font-bold text-white mb-2 text-base">Ce que vous allez apprendre :</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Maîtrise complète des concepts fondamentaux et avancés de la thématique.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Application pratique à travers des cas réels et des projets professionnels.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite (Programme du cours / Accordéon) */}
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur-md shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">Course Content</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Catégorie : <span className="text-violet-400 font-semibold">{selectedCourse.category}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-700/70 rounded-xl overflow-hidden bg-slate-900/60">
                  <button
                    onClick={() => toggleSection(1)}
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">1. Introduction & Notions Clés</p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <PlayCircle className="w-3.5 h-3.5 text-violet-400" />
                        1 vidéo | 20 min
                      </span>
                    </div>
                    {openSections[1] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openSections[1] && (
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-800 bg-slate-950/40">
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs group">
                        <div className="flex items-center gap-2 text-slate-300 group-hover:text-white">
                          <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Présentation du programme</span>
                        </div>
                        <span className="text-[10px] text-slate-500">20 min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VUE PRINCIPALE (GRILLE DES COURS)
  // ==========================================
  return (
    <div className="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-violet-500" />
            Gestion des Cours & Formations
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Structurez et administrez les programmes d'apprentissage par catégorie.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nouveau Cours
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategoryFilter === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm font-medium">Chargement des cours...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
          Aucun cours trouvé dans cette catégorie.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)} // Clic pour ouvrir la vue détaillée
              className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-violet-500/50 transition-all duration-200 flex flex-col justify-between backdrop-blur-md shadow-xl cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCourse(e, course.id)}
                      disabled={deletingId === course.id}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === course.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1.5 leading-snug group-hover:text-violet-300 transition-colors">{course.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {course.description || "Aucune description détaillée fournie."}
                </p>
              </div>

              <div>
                {course.base_price && (
                  <div className="mb-3 flex items-center justify-between text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <span>Prix :</span>
                    <span>{course.base_price} DZD</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-400" />
                    {course.lessons || 10} leçons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-violet-400" />
                    {course.duration || '2h 00m'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nouveau Cours Pro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Ajouter un nouveau cours</h3>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Titre du cours *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Architecture microservices & FastAPI"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Décrivez le contenu et les objectifs du cours..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie *</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Développement">Développement</option>
                    <option value="Cybersécurité">Cybersécurité</option>
                    <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                    <option value="E-Book">E-Book</option>
                    <option value="Autre">Autre...</option>
                  </select>

                  {newCourse.category === 'Autre' && (
                    <input
                      type="text"
                      required
                      placeholder="Saisissez votre catégorie..."
                      value={newCourse.custom_category}
                      onChange={(e) => setNewCourse({ ...newCourse, custom_category: e.target.value })}
                      className="w-full mt-2 bg-slate-900 border border-violet-500 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sous-catégorie</label>
                  <input
                    type="text"
                    placeholder="Ex: Web Dev / Réseaux"
                    value={newCourse.sub_category}
                    onChange={(e) => setNewCourse({ ...newCourse, sub_category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-900/50 hover:border-violet-500 transition-all">
                  <ImageIcon className="w-6 h-6 mx-auto text-violet-400 mb-2" />
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Image de couverture (1 max)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 cursor-pointer"
                  />
                  {newCourse.coverImage && (
                    <p className="text-[11px] text-emerald-400 mt-1 truncate">✓ {newCourse.coverImage.name}</p>
                  )}
                </div>

                <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-900/50 hover:border-violet-500 transition-all">
                  <Video className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vidéos des leçons (Plusieurs)</label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideosChange}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  {newCourse.videos.length > 0 && (
                    <p className="text-[11px] text-emerald-400 mt-1">✓ {newCourse.videos.length} vidéo(s) sélectionnée(s)</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type de vente</label>
                  <select
                    value={newCourse.selling_type}
                    onChange={(e) => setNewCourse({ ...newCourse, selling_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Disponible en enregistré">Disponible en enregistré</option>
                    <option value="Online Live uniquement">Online Live uniquement</option>
                    <option value="Live & Enregistré">Live & Enregistré</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instructeur</label>
                  <input
                    type="text"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prix de base (DZD)</label>
                  <input
                    type="number"
                    placeholder="Ex: 15000"
                    value={newCourse.base_price}
                    onChange={(e) => setNewCourse({ ...newCourse, base_price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Remise (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCourse.discount_percent}
                    onChange={(e) => setNewCourse({ ...newCourse, discount_percent: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-600/20"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer le cours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;