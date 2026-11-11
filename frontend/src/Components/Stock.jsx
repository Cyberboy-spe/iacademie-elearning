import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import API from '../services/api'; // <--- Importation de l'instance Axios configurée

export default function Stock() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: '',
    quantity: 0,
    unit_price: 0,
    min_threshold: 5
  });

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/admin/stock');
      setStockItems(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la récupération du stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/admin/stock', newItem);
      setNewItem({ item_name: '', category: '', quantity: 0, unit_price: 0, min_threshold: 5 });
      fetchStock();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'ajout de l'article");
    }
  };

  const handleUpdateQuantity = async (id, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      await API.put(`/api/admin/stock/${id}/quantity?quantity=${newQty}`);
      fetchStock();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) return;
    try {
      await API.delete(`/api/admin/stock/${id}`);
      fetchStock();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-purple-500" /> Gestion des Stocks & Inventaire
          </h1>
          <p className="text-gray-400 text-sm">Suivez et gérez les articles, matériels et produits de la plateforme.</p>
        </div>
        <button onClick={fetchStock} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition cursor-pointer">
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleAddItem} className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nom de l'article</label>
          <input type="text" placeholder="Ex: Kit Arduino" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Catégorie</label>
          <input type="text" placeholder="Ex: Matériel" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Quantité initiale</label>
          <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Prix Unitaire (DZD)</label>
          <input type="number" step="0.01" value={newItem.unit_price} onChange={e => setNewItem({...newItem, unit_price: parseFloat(e.target.value) || 0})} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Seuil d'alerte</label>
          <input type="number" value={newItem.min_threshold} onChange={e => setNewItem({...newItem, min_threshold: parseInt(e.target.value) || 5})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm cursor-pointer">
          <Plus size={16} /> Ajouter
        </button>
      </form>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-gray-400 text-xs uppercase bg-slate-900/40">
              <th className="p-4">Article</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Quantité</th>
              <th className="p-4">Prix Unitaire</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-400">Chargement des stocks...</td></tr>
            ) : stockItems.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-400">Aucun article en stock pour le moment.</td></tr>
            ) : (
              stockItems.map((item) => {
                const isLowStock = item.quantity <= item.min_threshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-4 font-medium">{item.item_name}</td>
                    <td className="p-4 text-gray-400">{item.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} className="bg-slate-700 hover:bg-slate-600 w-7 h-7 rounded flex items-center justify-center text-xs font-bold cursor-pointer">-</button>
                        <span className={`font-semibold ${isLowStock ? 'text-red-400' : 'text-white'}`}>{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} className="bg-slate-700 hover:bg-slate-600 w-7 h-7 rounded flex items-center justify-center text-xs font-bold cursor-pointer">+</button>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{item.unit_price.toLocaleString()} DZD</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={12} /> Stock faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          En stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400 p-2 transition cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}