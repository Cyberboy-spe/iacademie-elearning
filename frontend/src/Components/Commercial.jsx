import React, { useState, useEffect } from 'react';

const Commercial = () => {
  const [activeTab, setActiveTab] = useState('invoices'); 
  const [invoices, setInvoices] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // État du formulaire de création de facture
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: `FAC-2026-00${Math.floor(Math.random() * 90) + 10}`,
    client_name: '',
    client_email: '',
    amount: '',
    status: 'En attente',
    due_date: ''
  });

  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resInvoices, resSales] = await Promise.all([
        fetch('http://localhost:8000/api/admin/invoices'),
        fetch('http://localhost:8000/api/admin/sales')
      ]);

      if (resInvoices.ok) {
        const dataInvoices = await resInvoices.json();
        setInvoices(dataInvoices);
      }
      if (resSales.ok) {
        const dataSales = await resSales.json();
        setSales(dataSales);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données commerciales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Soumission d'une nouvelle facture
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newInvoice,
          amount: parseFloat(newInvoice.amount)
        })
      });

      if (res.ok) {
        setShowModal(false);
        setNewInvoice({
          invoice_number: `FAC-2026-00${Math.floor(Math.random() * 90) + 10}`,
          client_name: '',
          client_email: '',
          amount: '',
          status: 'En attente',
          due_date: ''
        });
        fetchData(); 
      }
    } catch (error) {
      console.error("Erreur création facture:", error);
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      {/* En-tête avec titre et bouton d'action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            Gestion Commerciale & Facturation
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Suivez les ventes, le chiffre d'affaires et gérez la facturation de l'IACADEMIE.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>+</span> Nouvelle Facture
        </button>
      </div>

      {/* Onglets de navigation : Factures / Ventes */}
      <div className="flex gap-4 border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            activeTab === 'invoices' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Factures Clients ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            activeTab === 'sales' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Historique des Ventes ({sales.length})
        </button>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement des données...</div>
      ) : activeTab === 'invoices' ? (
        /* Tableau des Factures */
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-4 px-6">N° Facture</th>
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6">Montant (DZD)</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Aucune facture enregistrée.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id || inv[0]} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{inv.invoice_number || inv[1]}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{inv.client_name || inv[2]}</div>
                      <div className="text-xs text-gray-500">{inv.client_email || inv[3]}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-400">
                      {parseFloat(inv.amount || inv[4]).toLocaleString()} DZD
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (inv.status || inv[5]) === 'Payé'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : (inv.status || inv[5]) === 'En attente'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {inv.status || inv[5]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{inv.due_date || inv[6] || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tableau des Ventes */
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-4 px-6">Article / Service</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Prix</th>
                <th className="py-4 px-6">Moyen de Paiement</th>
                <th className="py-4 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Aucune vente enregistrée.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id || sale[0]} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{sale.item_title || sale[2]}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-xs">
                        {sale.item_type || sale[3]}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-400">
                      {parseFloat(sale.price || sale[4]).toLocaleString()} DZD
                    </td>
                    <td className="py-4 px-6 text-gray-400">{sale.payment_method || sale[5]}</td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {new Date(sale.created_at || sale[6]).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal / Popup pour Nouvelle Facture */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4 text-white">Créer une nouvelle facture</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">N° Facture</label>
                <input
                  type="text"
                  value={newInvoice.invoice_number}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nom du Client</label>
                <input
                  type="text"
                  placeholder="Ex: Karim Benjedou"
                  value={newInvoice.client_name}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client_name: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email Client</label>
                <input
                  type="email"
                  placeholder="karim@benjedou.com"
                  value={newInvoice.client_email}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client_email: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Montant (DZD)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Statut</label>
                  <select
                    value={newInvoice.status}
                    onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="En attente">En attente</option>
                    <option value="Payé">Payé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl text-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commercial;