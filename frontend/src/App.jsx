import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './Components/Login';
import Register from './Components/Register';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminDashboard from './Components/AdminDashboard'; 

// Composants de secours pour l'espace étudiant
const StudentDashboard = () => <div className="p-8 text-2xl font-bold">Tableau de Bord Étudiant</div>;
const StudentFormations = () => <div className="p-8 text-2xl font-bold">Liste des Formations</div>;
const StudentCourses = () => <div className="p-8 text-2xl font-bold">Liste des Cours</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App w-screen h-screen overflow-hidden">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Espace Administrateur - Tableau de bord principal */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Espace Administrateur - Utilisateurs */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Espace Administrateur - Gestion des Cours */}
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Espace Administrateur - Gestion Commerciale */}
            <Route 
              path="/admin/commercial" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Espace Administrateur - Gestion des Stocks & Inventaire (C'ELLE-CI QUI MANQUAIT !) */}
            <Route 
              path="/admin/stock" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Espace Étudiant */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/formations" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentFormations />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/courses" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentCourses />
                </ProtectedRoute>
              } 
            />

            {/* Redirections automatiques */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<div className="p-8 text-red-500">Page non trouvée (404)</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;