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
  PlayCircle,
  Star,
  MessageSquare,
  HelpCircle
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
  const [courseLessons, setCourseLessons] = useState([]);
  
  // Leçon / Vidéo actuellement sélectionnée
  const [activeLesson, setActiveLesson] = useState(null);

  // ÉTATS FAQ (Persistés via API)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [showFaqForm, setShowFaqForm] = useState(false);

  // ÉTATS REVIEWS / AVIS (Persistés via API)
  const [reviews, setReviews] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [userRating, setUserRating] = useState(5);

  // Modal Nouveau / Édition Cours
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Développement',
    custom_category: '',
    sub_category: 'Web Dev',
    selling_type: 'Disponible en enregistré',
    instructor: 'Ben Jeddou Technologies',
    base_price: '',
    discount_percent: 0,
    coverImage: null,
    videos: []
  });

  // Modal Nouvelle Leçon
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [submittingLesson, setSubmittingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    duration: '20 min',
    videoFile: null
  });

  const categoriesList = ['Tous', 'Développement', 'Cybersécurité', 'Intelligence Artificielle', 'E-Book'];

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

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setActiveLesson(null);
    try {
      // Charger les leçons
      const resLessons = await API.get(`/api/admin/courses/${course.id}/lessons`);
      const lessonsData = resLessons.data || [];
      setCourseLessons(lessonsData);
      if (lessonsData.length > 0) {
        setActiveLesson(lessonsData[0]);
      }

      // Charger la FAQ (sécurisé pour ne pas bloquer si la route échoue)
      const resFaq = await API.get(`/api/courses/${course.id}/faq`).catch(() => ({ data: [] }));
      setFaqs(resFaq.data || []);

      // Charger les Avis (sécurisé pour ne pas bloquer si la route échoue)
      const resReviews = await API.get(`/api/courses/${course.id}/reviews`).catch(() => ({ data: [] }));
      setReviews(resReviews.data || []);

    } catch (err) {
      console.error('Erreur récupération des données du cours :', err);
      setCourseLessons([]);
      setFaqs([]);
      setReviews([]);
    }
  };

  // Gestion suppression FAQ via API
  const handleDeleteFaq = async (faqId) => {
    try {
      await API.delete(`/api/admin/faq/${faqId}`);
      setFaqs(faqs.filter(f => f.id !== faqId));
    } catch (err) {
      console.error('Erreur suppression FAQ :', err);
      alert("Impossible de supprimer la question.");
    }
  };

  // Gestion ajout FAQ via API
  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim() || !selectedCourse) return;
    try {
      await API.post(`/api/courses/${selectedCourse.id}/faq`, newFaq);
      const resFaq = await API.get(`/api/courses/${selectedCourse.id}/faq`);
      setFaqs(resFaq.data || []);
      setNewFaq({ question: '', answer: '' });
      setShowFaqForm(false);
    } catch (err) {
      console.error('Erreur ajout FAQ :', err);
      alert("Impossible d'ajouter la question.");
    }
  };

  // Gestion suppression Review via API
  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/api/admin/reviews/${reviewId}`);
      setReviews(reviews.filter(rev => rev.id !== reviewId));
    } catch (err) {
      console.error('Erreur suppression avis :', err);
      alert("Impossible de supprimer l'avis.");
    }
  };

  // Gestion ajout Review via API
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim() || !selectedCourse) return;
    try {
      const reviewPayload = {
        name: 'Administrateur',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        rating: userRating,
        comment: newFeedback
      };
      await API.post(`/api/courses/${selectedCourse.id}/reviews`, reviewPayload);
      const resReviews = await API.get(`/api/courses/${selectedCourse.id}/reviews`);
      setReviews(resReviews.data || []);
      setNewFeedback('');
    } catch (err) {
      console.error('Erreur ajout avis :', err);
      alert("Impossible d'ajouter l'avis.");
    }
  };

  // CALCUL AUTOMATIQUE DE LA NOTE MOYENNE ET DES POURCENTAGES DÉTAILLÉS
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  const getStarPercentage = (starCount) => {
    if (totalReviews === 0) return '0%';
    const count = reviews.filter(rev => rev.rating === starCount).length;
    return `${Math.round((count / totalReviews) * 100)}%`;
  };

  const handleOpenEditModal = (e, course) => {
    e.stopPropagation();
    setEditingCourseId(course.id);
    setPreviewImage(course.cover_image ? `http://localhost:8000${course.cover_image}` : null);
    setNewCourse({
      title: course.title || '',
      description: course.description || '',
      category: categoriesList.includes(course.category) ? course.category : 'Autre',
      custom_category: categoriesList.includes(course.category) ? '' : course.category,
      sub_category: course.sub_category || '',
      selling_type: course.selling_type || 'Disponible en enregistré',
      instructor: course.instructor || 'Ben Jeddou Technologies',
      base_price: course.base_price || '',
      discount_percent: course.discount_percent || 0,
      coverImage: null,
      videos: []
    });
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setPreviewImage(null);
    setNewCourse({
      title: '',
      description: '',
      category: 'Développement',
      custom_category: '',
      sub_category: 'Web Dev',
      selling_type: 'Disponible en enregistré',
      instructor: 'Ben Jeddou Technologies',
      base_price: '',
      discount_percent: 0,
      coverImage: null,
      videos: []
    });
    setIsModalOpen(true);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.videoFile || !selectedCourse) return;

    setSubmittingLesson(true);
    try {
      const formData = new FormData();
      if (newLesson.title.trim()) {
        formData.append('title', newLesson.title);
      }
      formData.append('duration', newLesson.duration);
      formData.append('video', newLesson.videoFile);

      const res = await API.post(`/api/admin/courses/${selectedCourse.id}/lessons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const addedLesson = res.data.lesson;
      setCourseLessons(prev => [...prev, addedLesson]);
      
      if (!activeLesson) {
        setActiveLesson(addedLesson);
      }

      setSelectedCourse(prev => ({
        ...prev,
        lessons: (prev.lessons || 0) + 1
      }));

      setIsLessonModalOpen(false);
      setNewLesson({ title: '', duration: '20 min', videoFile: null });
    } catch (err) {
      console.error('Erreur ajout leçon :', err);
      alert("Impossible d'ajouter la leçon.");
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCourse({ ...newCourse, coverImage: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleVideosChange = (e) => {
    if (e.target.files) {
      const selectedVideos = Array.from(e.target.files);
      setNewCourse(prev => ({
        ...prev,
        videos: [...prev.videos, ...selectedVideos]
      }));
    }
  };

  const handleSaveCourse = async (e) => {
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

      if (editingCourseId) {
        const res = await API.put(`/api/admin/courses/${editingCourseId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setCourses(courses.map(c => c.id === editingCourseId ? { ...c, ...res.data.course } : c));
        if (selectedCourse && selectedCourse.id === editingCourseId) {
          setSelectedCourse(prev => ({ ...prev, ...res.data.course }));
        }
      } else {
        newCourse.videos.forEach((video) => {
          formData.append('videos', video);
        });

        const res = await API.post('/api/admin/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setCourses([res.data.course, ...courses]);
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error('Erreur détaillée sauvegarde cours :', err.response?.data || err.message);
      alert(`Impossible d'enregistrer le cours : ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation();
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

  if (selectedCourse) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-full">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>

          <button 
            onClick={() => setIsLessonModalOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Leçon
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Course Overview</h2>
          <p className="text-slate-400 text-xs mt-1">Vérifiez et gérez le contenu du cours en temps réel.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Lecteur Vidéo Optimisé 16:9 */}
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative aspect-video w-full max-h-[600px] mx-auto flex items-center justify-center">
              {activeLesson && activeLesson.video_url ? (
                <video 
                  key={activeLesson.id || activeLesson.video_url}
                  controls 
                  autoPlay
                  className="w-full h-full object-cover rounded-2xl"
                  src={`http://localhost:8000${activeLesson.video_url}`}
                  poster={selectedCourse.cover_image ? `http://localhost:8000${selectedCourse.cover_image}` : undefined}
                >
                  Votre navigateur ne prend pas en charge la lecture de vidéos.
                </video>
              ) : (
                <div className="text-center p-8 space-y-2">
                  <PlayCircle className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">
                    {courseLessons.length > 0 
                      ? "Cliquez sur une leçon à droite pour lancer la vidéo" 
                      : "Aucune vidéo disponible pour ce cours."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white leading-tight">
                {activeLesson ? activeLesson.title : selectedCourse.title}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    {selectedCourse.instructor || "Ben Jeddou Technologies"}
                    <span className="text-xs font-normal text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                      Instructeur
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">{selectedCourse.selling_type || "Disponible en enregistré"}</p>
                </div>
              </div>
            </div>

            {/* BARRE DES ONGLETS */}
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

            {/* OVERVIEW */}
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

            {/* FAQ (Persistée via API) */}
            {activeTab === 'FAQ' && (
              <div className="space-y-4 bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-violet-400" />
                    Foire Aux Questions (FAQ)
                  </h3>
                  <button
                    onClick={() => setShowFaqForm(!showFaqForm)}
                    className="text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    {showFaqForm ? "Fermer" : "+ Ajouter une Question"}
                  </button>
                </div>

                {showFaqForm && (
                  <form onSubmit={handleAddFaq} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Question..."
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                    />
                    <textarea
                      placeholder="Réponse..."
                      rows="2"
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-3 focus:outline-none focus:border-violet-500"
                    ></textarea>
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Enregistrer la question
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {faqs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Aucune question FAQ pour ce cours.</p>
                  ) : (
                    faqs.map((faq, index) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div key={faq.id || index} className="border-b border-slate-700/60 pb-3">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                              className="flex-1 flex items-center justify-between text-left py-2 text-sm font-medium text-white hover:text-violet-300 transition-colors cursor-pointer"
                            >
                              <span>{faq.question}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-violet-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-1.5 ml-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer cette question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {isOpen && (
                            <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-1">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* REVIEW (Persistée via API & Calcul dynamique) */}
            {activeTab === 'Review' && (
              <div className="space-y-6 bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-700/60 pb-6">
                  <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white">{averageRating}</span>
                    <div className="flex items-center gap-1 my-2 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Average Rating ({totalReviews} avis)</span>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <h4 className="text-sm font-bold text-white mb-3">Detailed Rating</h4>
                    {[
                      { stars: 5 },
                      { stars: 4 },
                      { stars: 3 },
                      { stars: 2 },
                      { stars: 1 },
                    ].map((item, idx) => {
                      const pct = getStarPercentage(item.stars);
                      return (
                        <div key={idx} className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="w-8 text-right">{pct}</span>
                          <div className="flex items-center text-amber-400 w-16">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < item.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                              />
                            ))}
                          </div>
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                            <div className={`bg-violet-500 h-full rounded-full transition-all duration-300`} style={{ width: pct }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Commentaires des étudiants</h4>
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Aucun commentaire pour le moment.</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl space-y-2 relative group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={rev.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"} alt={rev.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                            <div>
                              <p className="text-xs font-bold text-white">{rev.name}</p>
                              <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer ce commentaire"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-11">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddReview} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">Make feedback here...</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`w-4 h-4 cursor-pointer transition-colors ${
                            star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows="3"
                    placeholder="Saisissez votre avis ou remarque..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-violet-500 placeholder:text-slate-500"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-violet-600/20 cursor-pointer"
                  >
                    Submit Now
                  </button>
                </form>
              </div>
            )}
          </div>

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
                      <p className="text-xs font-bold text-white">Programme & Leçons Vidéo</p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <PlayCircle className="w-3.5 h-3.5 text-violet-400" />
                        {courseLessons.length} vidéo(s)
                      </span>
                    </div>
                    {openSections[1] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openSections[1] && (
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-800 bg-slate-950/40">
                      {courseLessons && courseLessons.length > 0 ? (
                        courseLessons.map((lesson, idx) => {
                          const isCurrent = activeLesson?.id === lesson.id;
                          return (
                            <div 
                              key={lesson.id || idx} 
                              onClick={() => setActiveLesson(lesson)}
                              className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-all ${
                                isCurrent 
                                  ? 'bg-violet-600/30 border border-violet-500/50 text-white font-semibold' 
                                  : 'hover:bg-slate-800/60 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <PlayCircle className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-violet-400' : 'text-emerald-400'}`} />
                                <span className="truncate">{idx + 1}. {lesson.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0 ml-2">{lesson.duration || "20 min"}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500 p-2">Aucune leçon vidéo enregistrée pour ce cours.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Ajouter une Leçon */}
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-violet-400" /> Ajouter une Leçon Vidéo
                </h3>
                <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Titre de la leçon (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Introduction au module..."
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fichier Vidéo (MP4, MKV...)</label>
                  <input
                    type="file"
                    accept="video/*"
                    required
                    onChange={(e) => setNewLesson({ ...newLesson, videoFile: e.target.files[0] })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl p-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsLessonModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLesson}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingLesson && <Loader2 className="w-4 h-4 animate-spin" />}
                    Uploader la vidéo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-violet-500 w-7 h-7" /> Gestion des Cours & Formations
          </h1>
          <p className="text-slate-400 text-sm">Créez, modifiez et gérez l'ensemble des cours et leçons vidéo de la plateforme.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-600/20 cursor-pointer shrink-0"
        >
          <Plus size={18} /> Nouveau Cours
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-violet-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center p-16 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-medium">Aucun cours trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl hover:border-violet-500/50 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                {course.cover_image ? (
                  <img
                    src={`http://localhost:8000${course.cover_image}`}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] font-bold text-violet-400">
                  {course.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description || "Aucune description fournie."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-violet-400" /> {course.lessons || 0} leçons
                    </span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {course.base_price > 0 ? `${course.base_price.toLocaleString()} DZD` : 'Gratuit'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={(e) => handleOpenEditModal(e, course)}
                    className="p-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Modifier le cours"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCourse(e, course.id)}
                    disabled={deletingId === course.id}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    title="Supprimer le cours"
                  >
                    {deletingId === course.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CRÉATION / ÉDITION COURS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" />
                {editingCourseId ? "Modifier le cours" : "Créer un nouveau cours"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Titre du cours *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maîtriser React & FastAPI de A à Z"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description détaillée</label>
                <textarea
                  rows="3"
                  placeholder="Décrivez le contenu et les objectifs du cours..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                  >
                    {categoriesList.filter(c => c !== 'Tous').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Autre">Autre (Personnalisée)</option>
                  </select>
                </div>

                {newCourse.category === 'Autre' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de la catégorie personnalisée</label>
                    <input
                      type="text"
                      placeholder="Ex: Marketing Digital"
                      value={newCourse.custom_category}
                      onChange={(e) => setNewCourse({ ...newCourse, custom_category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prix de base (DZD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000"
                    value={newCourse.base_price}
                    onChange={(e) => setNewCourse({ ...newCourse, base_price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instructeur</label>
                  <input
                    type="text"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type de diffusion</label>
                  <input
                    type="text"
                    value={newCourse.selling_type}
                    onChange={(e) => setNewCourse({ ...newCourse, selling_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image de couverture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl p-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 cursor-pointer"
                />
                {previewImage && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                    <img src={previewImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {!editingCourseId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vidéos du cours (Leçons multiples)</label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideosChange}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl p-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 cursor-pointer"
                  />
                  {newCourse.videos.length > 0 && (
                    <p className="text-xs text-violet-400 mt-2 font-medium">
                      {newCourse.videos.length} vidéo(s) sélectionnée(s) pour l'upload.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCourseId ? "Enregistrer les modifications" : "Créer le cours"}
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