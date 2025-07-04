
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user } = useAuth();

  const handleSave = () => {
    toast({
      title: "🚧 Funcionalidade não implementada",
      description: "Ainda não é possível salvar o perfil. Solicite no próximo prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Perfil - WhatsApp Bot SaaS</title>
        <meta name="description" content="Gerencie as informações do seu perfil." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Meu Perfil</h1>
          <p className="text-gray-400 mt-1">Visualize e edite suas informações</p>
        </div>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados e foto de perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name} />
                <AvatarFallback className="text-4xl">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Alterar Foto</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full-name">Nome Completo</Label>
                <Input id="full-name" defaultValue={user?.user_metadata?.name || ''} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} disabled className="bg-white/10 border-white/20" />
              </div>
            </div>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Profile;
