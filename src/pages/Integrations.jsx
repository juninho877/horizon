
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Zap, Plus, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'whatsapp-evolution',
      name: 'WhatsApp Evolution API',
      description: 'Conecte seus bots diretamente com a API do WhatsApp',
      status: 'connected',
      category: 'messaging',
      icon: '💬'
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Sincronize dados de conversas com planilhas',
      status: 'available',
      category: 'productivity',
      icon: '📊'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automatize workflows com milhares de aplicativos',
      status: 'available',
      category: 'automation',
      icon: '⚡'
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Gerencie leads e contatos automaticamente',
      status: 'available',
      category: 'crm',
      icon: '🎯'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Adicione contatos às suas listas de email',
      status: 'available',
      category: 'marketing',
      icon: '📧'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Receba notificações de conversas importantes',
      status: 'available',
      category: 'communication',
      icon: '💬'
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas', count: integrations.length },
    { id: 'messaging', name: 'Mensagens', count: integrations.filter(i => i.category === 'messaging').length },
    { id: 'crm', name: 'CRM', count: integrations.filter(i => i.category === 'crm').length },
    { id: 'productivity', name: 'Produtividade', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'automation', name: 'Automação', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'marketing', name: 'Marketing', count: integrations.filter(i => i.category === 'marketing').length },
    { id: 'communication', name: 'Comunicação', count: integrations.filter(i => i.category === 'communication').length }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const handleConnect = (integrationId) => {
    toast({
      title: "🚧 Esta integração ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const handleDisconnect = (integrationId) => {
    const updatedIntegrations = integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'available' }
        : integration
    );
    setIntegrations(updatedIntegrations);
    toast({
      title: "Integração desconectada",
      description: "A integração foi removida com sucesso",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Conectado</Badge>;
      case 'available':
        return <Badge variant="outline">Disponível</Badge>;
      default:
        return <Badge variant="secondary">Indisponível</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'available':
        return <Plus className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Integrações - WhatsApp Bot SaaS</title>
        <meta name="description" content="Conecte seus chatbots com ferramentas externas e automatize workflows" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Integrações</h1>
            <p className="text-gray-400 mt-1">Conecte seus bots com ferramentas externas</p>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-green-500 to-blue-500"
            onClick={() => toast({ title: "🚧 Solicitação de integração ainda não implementada—solicite no próximo prompt! 🚀" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Solicitar Integração
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Integrações Ativas</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Disponíveis</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'available').length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total</p>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? "bg-gradient-to-r from-green-500 to-blue-500" : ""}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect hover:border-green-500/30 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {integration.description}
                  </CardDescription>
                  
                  <div className="flex gap-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConnect(integration.id)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(integration.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Desconectar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(integration.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Conectar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Custom Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect border-dashed border-2 border-white/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Precisa de uma integração personalizada?</h3>
              <p className="text-gray-400 mb-6">
                Nossa equipe pode desenvolver integrações customizadas para suas necessidades específicas
              </p>
              <Button 
                className="bg-gradient-to-r from-green-500 to-blue-500"
                onClick={() => toast({ title: "🚧 Solicitação de integração personalizada ainda não implementada—solicite no próximo prompt! 🚀" })}
              >
                Solicitar Integração Personalizada
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Integrations;
