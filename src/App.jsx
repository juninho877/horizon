
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CreateBot from '@/pages/CreateBot';
import BotConfig from '@/pages/BotConfig';
import Analytics from '@/pages/Analytics';
import Integrations from '@/pages/Integrations';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>WhatsApp Bot SaaS - Plataforma de Chatbots Inteligentes</title>
          <meta name="description" content="Crie e gerencie chatbots personalizados para WhatsApp com nossa plataforma SaaS avançada. Automatize respostas, analise interações e integre com seus sistemas." />
        </Helmet>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/create-bot" element={<CreateBot />} />
                  <Route path="/bot/:id/config" element={<BotConfig />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Layout>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
