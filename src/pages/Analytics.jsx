
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BarChart3, MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from '@/components/ui/use-toast';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState({
    conversations: [],
    responses: [],
    users: []
  });

  useEffect(() => {
    // Simular dados de analytics
    const generateMockData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const conversations = [];
      const responses = [];
      const users = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

        conversations.push({
          date: dateStr,
          value: Math.floor(Math.random() * 50) + 20
        });

        responses.push({
          date: dateStr,
          value: Math.floor(Math.random() * 200) + 100
        });

        users.push({
          date: dateStr,
          value: Math.floor(Math.random() * 30) + 10
        });
      }

      setAnalyticsData({ conversations, responses, users });
    };

    generateMockData();
  }, [timeRange]);

  const metrics = [
    {
      title: 'Total de Conversas',
      value: analyticsData.conversations.reduce((acc, item) => acc + item.value, 0),
      change: '+12%',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Respostas Enviadas',
      value: analyticsData.responses.reduce((acc, item) => acc + item.value, 0),
      change: '+8%',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Usuários Únicos',
      value: analyticsData.users.reduce((acc, item) => acc + item.value, 0),
      change: '+15%',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Taxa de Resposta',
      value: '94%',
      change: '+2%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Análises - WhatsApp Bot SaaS</title>
        <meta name="description" content="Visualize métricas detalhadas e performance dos seus chatbots do WhatsApp" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Análises</h1>
            <p className="text-gray-400 mt-1">Monitore a performance dos seus bots</p>
          </div>
          
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-gradient-to-r from-green-500 to-blue-500" : ""}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </Button>
            ))}
          </div>
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
                      <p className="text-sm text-green-400 mt-1">{metric.change}</p>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Conversas por Dia</CardTitle>
                <CardDescription>
                  Número de conversas iniciadas diariamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.conversations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Respostas Enviadas</CardTitle>
                <CardDescription>
                  Volume de respostas automáticas por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.responses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#gradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Top Palavras-chave</CardTitle>
                <CardDescription>Mais utilizadas pelos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['preço', 'horário', 'produto', 'suporte', 'informação'].map((keyword, index) => (
                    <div key={keyword} className="flex items-center justify-between">
                      <span className="text-sm">{keyword}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${100 - index * 15}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{100 - index * 15}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
                <CardDescription>Quando os usuários mais interagem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '09:00 - 12:00', percentage: 85 },
                    { time: '14:00 - 17:00', percentage: 92 },
                    { time: '19:00 - 22:00', percentage: 78 },
                    { time: '22:00 - 02:00', percentage: 45 },
                    { time: '02:00 - 08:00', percentage: 12 }
                  ].map((period) => (
                    <div key={period.time} className="flex items-center justify-between">
                      <span className="text-sm">{period.time}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${period.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{period.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Relatórios e exportações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => toast({ title: "🚧 Exportação ainda não implementada—solicite no próximo prompt! 🚀" })}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Relatório Mensal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => toast({ title: "🚧 Exportação ainda não implementada—solicite no próximo prompt! 🚀" })}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => toast({ title: "🚧 Configuração ainda não implementada—solicite no próximo prompt! 🚀" })}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Configurar Alertas
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
