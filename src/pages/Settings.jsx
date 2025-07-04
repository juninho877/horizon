
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const handleSave = () => {
    toast({
      title: "🚧 Funcionalidade não implementada",
      description: "Ainda não é possível salvar as configurações. Solicite no próximo prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Configurações - WhatsApp Bot SaaS</title>
        <meta name="description" content="Gerencie as configurações da sua conta e preferências." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Configurações</h1>
          <p className="text-gray-400 mt-1">Gerencie suas preferências e conta</p>
        </div>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Escolha como você recebe notificações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificações por E-mail</Label>
              <input type="checkbox" id="email-notifications" className="rounded border-white/10 bg-white/5 accent-green-500" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Notificações Push</Label>
              <input type="checkbox" id="push-notifications" className="rounded border-white/10 bg-white/5 accent-green-500" />
            </div>
            <Button onClick={handleSave}>Salvar Preferências</Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Altere sua senha e gerencie a segurança da conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input id="new-password" type="password" className="bg-white/5 border-white/10" />
            </div>
            <Button onClick={handleSave}>Alterar Senha</Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Settings;
