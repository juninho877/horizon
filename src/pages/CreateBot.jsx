
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Bot, MessageSquare, Clock, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const CreateBot = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    welcome_message: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro de autenticação", description: "Você precisa estar logado para criar um bot.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('bots')
        .insert([{ ...formData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bot criado com sucesso!",
        description: `${data.name} foi criado e está pronto para uso`,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Erro ao criar bot",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const steps = [
    {
      icon: Bot,
      title: 'Informações Básicas',
      description: 'Nome e descrição do seu bot'
    },
    {
      icon: MessageSquare,
      title: 'Mensagem de Boas-vindas',
      description: 'Primeira mensagem que os usuários verão'
    },
    {
      icon: Clock,
      title: 'Horário de Funcionamento',
      description: 'Configure quando o bot estará ativo'
    },
    {
      icon: Zap,
      title: 'Finalizar',
      description: 'Revisar e criar o bot'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Criar Bot - WhatsApp Bot SaaS</title>
        <meta name="description" content="Crie um novo chatbot personalizado para WhatsApp com configurações avançadas" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Criar Novo Bot</h1>
            <p className="text-gray-400 mt-1">Configure seu chatbot personalizado</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Configuração do Bot</CardTitle>
              <CardDescription>
                Preencha as informações básicas para criar seu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Bot *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Atendimento Loja"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-green-500/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Breve descrição do bot"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-green-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas *</Label>
                  <Textarea
                    id="welcomeMessage"
                    placeholder="Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?"
                    value={formData.welcome_message}
                    onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-green-500/50 min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {loading ? "Criando..." : "Criar Bot"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default CreateBot;
