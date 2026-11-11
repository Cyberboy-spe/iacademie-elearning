import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, BookOpen, Award, Search, Loader2, X } from 'lucide-react';
import API from '../services/api'; // Utilisation de l'instance centralisée

export default function AdminFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulaire de création
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('Débutant');
  const [category, setCategory] = useState('Informatique');
  const [submitting, setSubmitting] = useState(false);

  // Charger les formations
  const fetchFormations = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/formations');
      setFormations(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des formations :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  // Soumettre une nouvelle formation
  const handleCreateFormation = async (e) => {
    e.preventDefault();
    if (!title || !category) return;

    try {
      setSubmitting(true);
      await API.post('/api/admin/formations', {
        title,
        description,
        level,
        category
      });
      setTitle('');
      setDescription('');
      setCategory('Informatique');
      setLevel('Débutant');
      setIsModalOpen(false);
      fetchFormations();
    } catch (err) {
      console.error("Erreur création formation :", err);
      alert("Erreur lors de l'enregistrement de la formation. Vérifie la console.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFormations = formations.filter(f => 
    f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 text-slate-100 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Layers className="text-violet-400" /> Gestion des Formations & Cursus
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Structurez et administrez les programmes d'apprentissage globaux de l'IACADEMIE.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25 cursor-pointer"
        >
          <Plus size={18} /> Nouvelle Formation
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher une formation ou une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* Contenu / Liste */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-violet-500" size={36} />
        </div>
      ) : filteredFormations.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-slate-800/60 rounded-2xl bg-slate-900/20">
          <BookOpen className="mx-auto mb-3 opacity-40" size={48} />
          <p>Aucune formation trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormations.map((form) => (
            <div 
              key={form.id}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl hover:border-violet-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {form.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Award size={14} className="text-emerald-400" /> {form.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{form.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                  {form.description || "Aucune description détaillée fournie pour ce cursus."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
                <span>ID Cursus : #{form.id}</span>
                <span className="text-violet-400 font-medium cursor-pointer hover:underline">Gérer le contenu</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Création */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Plus className="text-violet-400" /> Créer un nouveau cursus
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFormation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Titre de la formation</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cursus Cybersécurité Avancé"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Catégorie</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Informatique"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Niveau</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Résumé des objectifs du cursus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}