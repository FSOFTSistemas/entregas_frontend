import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Usuarios from './pages/Usuarios';
import Entregas from './pages/Entregas';
import Empresas from './pages/Empresas';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/produtos" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Produtos />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/usuarios" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/entregas" element={
            <ProtectedRoute>
              <Layout>
                <Entregas />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/empresas" element={
            <ProtectedRoute requiredRole="master">
              <Layout>
                <Empresas />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirecionar rotas não encontradas para o dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

