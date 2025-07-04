
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Bot, MessageCircle, Users, TrendingUp, Settings, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Dashboard = () => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBots = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar bots",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const toggleBotStatus = async (botId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const { data, error } = await supabase
        .from('bots')
        .update({ status: newStatus })
        .eq('id', botId)
        .select()
        .single();

      if (error) throw error;

      setBots(bots.map(bot => (bot.id === botId ? data : bot)));
      toast({
        title: `Bot ${newStatus === 'active' ? 'ativado' : 'pausado'}`,
        description: `${data.name} foi ${newStatus === 'active' ? 'ativado' : 'pausado'} com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const metrics = [
    {
      title: 'Total de Bots',
      value: bots.length,
      icon: Bot,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Conversas Hoje',
      value: bots.reduce((acc, bot) => acc + (bot.conversations || 0), 0),
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Usuários Ativos',
      value: '2.4k',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Taxa de Resposta',
      value: '94%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - WhatsApp Bot SaaS</title>
        <meta name="description" content="Gerencie seus chatbots do WhatsApp, visualize métricas e monitore performance em tempo real" />
      </Helmet>

      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-gray-400 mt-1">Gerencie seus chatbots e monitore performance</p>
          </div>
          <Link to="/create-bot">
            <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Bot
            </Button>
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bots List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Meus Bots</h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
             </div>
          ) : bots.length === 0 ? (
            <Card className="glass-effect">
              <CardContent className="p-12 text-center">
                <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum bot criado ainda</h3>
                <p className="text-gray-400 mb-6">Crie seu primeiro chatbot para começar a automatizar conversas</p>
                <Link to="/create-bot">
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Bot
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot, index) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bot-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <div className={`w-3 h-3 rounded-full ${bot.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      </div>
                      <CardDescription>
                        Status: {bot.status === 'active' ? 'Ativo' : 'Pausado'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Conversas</span>
                          <span className="font-medium">{bot.conversations || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Respostas</span>
                          <span className="font-medium">{bot.responses || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBotStatus(bot.id, bot.status)}
                          className="flex-1"
                        >
                          {bot.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                        <Link to={`/bot/${bot.id}/config`}>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
