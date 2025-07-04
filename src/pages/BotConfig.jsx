import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  ArrowLeft,
  Save,
  MessageSquare,
  Settings,
  Zap,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const EvolutionApiIntegration = ({ bot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, connected, error
  const [connectionStatus, setConnectionStatus] = useState("Desconectado");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);

  const instanceName = `bot-${bot.id}`;

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-test-evolution-api",
        { body: {} },
      );

      if (error) {
        setConnectionTestResult({
          success: false,
          message: `Erro na função de teste: ${error.message}`,
        });
        return;
      }

      setConnectionTestResult({
        success: data.success,
        message:
          data.message ||
          (data.success ? "Conexão bem-sucedida!" : "Falha na conexão"),
      });
    } catch (err) {
      setConnectionTestResult({
        success: false,
        message: `Erro inesperado: ${err.message}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const callEvolutionApi = async (endpoint, method = "POST", body = {}) => {
    try {
      console.log("Chamando Evolution API:", { endpoint, method, body });

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-evolution-api-proxy",
        {
          body: { endpoint, method, body },
        },
      );

      console.log("Resposta completa do Supabase:", { data, error });

      if (error) {
        console.error("Erro do Supabase Functions:", error);

        // Check if it's a configuration error
        if (
          error.message &&
          error.message.includes("Evolution API URL not configured")
        ) {
          throw new Error(
            "As variáveis de ambiente EVOLUTION_API_URL e EVOLUTION_API_KEY não estão configuradas. Configure-as nas configurações do projeto.",
          );
        }

        throw new Error(`Erro na função: ${error.message}`);
      }

      if (data && data.error) {
        console.error("Erro da Evolution API:", data.error);

        // Handle specific Evolution API errors
        if (data.status === 404) {
          throw new Error(
            "Endpoint da Evolution API não encontrado. Verifique se a URL da API está correta.",
          );
        } else if (data.status === 401 || data.status === 403) {
          throw new Error(
            "Erro de autenticação com a Evolution API. Verifique se a API Key está correta.",
          );
        } else if (data.status >= 500) {
          throw new Error(
            "Erro interno da Evolution API. Tente novamente em alguns minutos.",
          );
        }

        throw new Error(`Erro da API (${data.status}): ${data.error}`);
      }

      return data;
    } catch (err) {
      console.error("Erro completo ao chamar Evolution API:", err);
      throw err;
    }
  };

  const createInstance = async () => {
    setStatus("loading");
    setQrCode("");
    setConnectionStatus("Criando instância...");

    try {
      console.log("Criando instância:", instanceName);

      const data = await callEvolutionApi(`instance/create`, "POST", {
        instanceName,
        qrcode: true,
      });

      console.log("Dados recebidos da criação:", data);

      if (data && data.hash && data.hash.qr) {
        setQrCode(data.hash.qr);
        setConnectionStatus("QR Code gerado - Escaneie para conectar");
        setStatus("idle");
      } else if (data && data.qr) {
        // Algumas versões da API retornam o QR diretamente
        setQrCode(data.qr);
        setConnectionStatus("QR Code gerado - Escaneie para conectar");
        setStatus("idle");
      } else {
        console.warn("QR Code não encontrado na resposta:", data);
        setConnectionStatus("Instância criada mas QR não recebido");
        toast({
          title: "QR Code não recebido",
          description:
            "A instância pode já existir ou estar conectada. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
        setStatus("error");
      }
    } catch (err) {
      console.error("Erro detalhado ao criar instância:", err);
      setConnectionStatus("Erro ao criar instância");

      let errorMessage = "Erro desconhecido";
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Erro ao criar instância",
        description: `${errorMessage}. Verifique o console para mais detalhes.`,
        variant: "destructive",
      });
      setStatus("error");
    }
  };

  const checkStatus = useCallback(async () => {
    try {
      console.log("Verificando status da instância:", instanceName);
      const data = await callEvolutionApi(
        `instance/connectionState/${instanceName}`,
        "GET",
      );
      console.log("Status recebido:", data);

      if (data && data.state === "open") {
        setStatus("connected");
        setConnectionStatus("Conectado");
        setQrCode("");
        toast({
          title: "WhatsApp Conectado!",
          description: "Sua instância foi conectada com sucesso.",
        });
        // Não fechar automaticamente para o usuário ver a confirmação
        setTimeout(() => setIsOpen(false), 2000);
      } else if (data && data.state) {
        setConnectionStatus(`Status: ${data.state}`);
      } else {
        setConnectionStatus("Aguardando conexão...");
      }
    } catch (err) {
      console.log(
        "Erro ao verificar status (normal se instância não existir):",
        err.message,
      );
      setConnectionStatus("Desconectado");
    }
  }, [instanceName]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      if (isOpen && status !== "connected") {
        checkStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, status, checkStatus]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      createInstance();
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={testConnection}
        disabled={testingConnection}
      >
        {testingConnection ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testando...
          </>
        ) : (
          "Testar Conexão"
        )}
      </Button>

      {connectionTestResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            connectionTestResult.success
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {connectionTestResult.message}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={!connectionTestResult?.success}
          >
            {connectionTestResult?.success ? "Conectar WhatsApp" : "Configurar"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conectar com WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com o app do WhatsApp para conectar seu bot.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col justify-center items-center h-80">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-16 h-16 animate-spin text-green-500" />
                <p className="text-sm text-gray-400">Criando instância...</p>
              </div>
            )}
            {status !== "loading" && qrCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    alt="WhatsApp QR Code"
                    src={`data:image/png;base64,${qrCode}`}
                    className="w-48 h-48"
                    onError={(e) => {
                      console.error("Erro ao carregar QR Code:", e);
                      e.target.src =
                        "https://images.unsplash.com/photo-1685586784800-42bac9c32db9?w=200&h=200";
                    }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Escaneie o QR Code com seu WhatsApp
                </p>
              </div>
            )}
            {status === "connected" && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="w-24 h-24 text-green-500" />
                <p className="text-sm text-green-400">Conectado com sucesso!</p>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="w-24 h-24 text-red-500" />
                <p className="text-sm text-red-400 text-center">
                  Erro ao criar instância.
                  <br />
                  Verifique o console para mais detalhes.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createInstance}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}
          </div>
          <div className="text-center font-semibold">
            Status: {connectionStatus}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BotConfig = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [bot, setBot] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBotData = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const { data: botData, error: botError } = await supabase
        .from("bots")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (botError) throw botError;
      setBot(botData);

      const { data: responsesData, error: responsesError } = await supabase
        .from("bot_responses")
        .select("*")
        .eq("bot_id", id)
        .eq("user_id", user.id);
      if (responsesError) throw responsesError;
      setResponses(responsesData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados do bot",
        description: error.message,
        variant: "destructive",
      });
      setBot(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData]);

  const handleSaveBot = async () => {
    setSaving(true);
    try {
      const { name, description, welcome_message } = bot;
      const { error } = await supabase
        .from("bots")
        .update({ name, description, welcome_message })
        .eq("id", id);
      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "As alterações foram aplicadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addResponse = async () => {
    const newResponse = {
      bot_id: id,
      user_id: user.id,
      trigger: "",
      response: "",
      active: true,
    };
    try {
      const { data, error } = await supabase
        .from("bot_responses")
        .insert(newResponse)
        .select()
        .single();
      if (error) throw error;
      setResponses([...responses, data]);
    } catch (error) {
      toast({
        title: "Erro ao adicionar resposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateResponse = async (responseId, field, value) => {
    const updatedResponses = responses.map((r) =>
      r.id === responseId ? { ...r, [field]: value } : r,
    );
    setResponses(updatedResponses);

    try {
      const { error } = await supabase
        .from("bot_responses")
        .update({ [field]: value })
        .eq("id", responseId);
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Erro ao atualizar resposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteResponse = async (responseId) => {
    try {
      const { error } = await supabase
        .from("bot_responses")
        .delete()
        .eq("id", responseId);
      if (error) throw error;
      setResponses(responses.filter((r) => r.id !== responseId));
      toast({
        title: "Resposta removida",
        description: "A resposta automática foi excluída",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir resposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Bot não encontrado</h1>
        <p className="text-gray-400">
          Verifique se o ID do bot está correto ou se você tem permissão para
          acessá-lo.
        </p>
        <Link to="/">
          <Button className="mt-4">Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Configurar Bot - {bot.name}</title>
        <meta
          name="description"
          content={`Configure respostas automáticas e ajustes para o bot ${bot.name}`}
        />
      </Helmet>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold gradient-text">{bot.name}</h1>
            <p className="text-gray-400 mt-1">
              Configure respostas e comportamentos
            </p>
          </div>
          <Button
            onClick={handleSaveBot}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-blue-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Respostas
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Ajuste as informações básicas do seu bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="botName">Nome do Bot</Label>
                    <Input
                      id="botName"
                      value={bot.name}
                      onChange={(e) => setBot({ ...bot, name: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-green-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="botDescription">Descrição</Label>
                    <Input
                      id="botDescription"
                      value={bot.description || ""}
                      onChange={(e) =>
                        setBot({ ...bot, description: e.target.value })
                      }
                      className="bg-white/5 border-white/10 focus:border-green-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMsg">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="welcomeMsg"
                    value={bot.welcome_message || ""}
                    onChange={(e) =>
                      setBot({ ...bot, welcome_message: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-green-500/50 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Respostas Automáticas
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Configure palavras-chave e respostas
                  </p>
                </div>
                <Button onClick={addResponse} variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Adicionar Resposta
                </Button>
              </div>
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">
                              Resposta #{index + 1}
                            </h3>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={response.active}
                                  onChange={(e) =>
                                    updateResponse(
                                      response.id,
                                      "active",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-white/10 bg-white/5 accent-green-500"
                                />
                                Ativo
                              </label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteResponse(response.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>
                                Palavras-chave (separadas por vírgula)
                              </Label>
                              <Input
                                placeholder="oi, olá, bom dia"
                                value={response.trigger}
                                onBlur={(e) =>
                                  updateResponse(
                                    response.id,
                                    "trigger",
                                    e.target.value,
                                  )
                                }
                                onChange={(e) =>
                                  setResponses(
                                    responses.map((r) =>
                                      r.id === response.id
                                        ? { ...r, trigger: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                                className="bg-white/5 border-white/10 focus:border-green-500/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Resposta</Label>
                              <Textarea
                                placeholder="Digite a resposta automática..."
                                value={response.response}
                                onBlur={(e) =>
                                  updateResponse(
                                    response.id,
                                    "response",
                                    e.target.value,
                                  )
                                }
                                onChange={(e) =>
                                  setResponses(
                                    responses.map((r) =>
                                      r.id === response.id
                                        ? { ...r, response: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                                className="bg-white/5 border-white/10 focus:border-green-500/50"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Conecte seu bot com outros serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        alt="WhatsApp Evolution API logo"
                        className="w-8 h-8"
                        src="https://images.unsplash.com/photo-1685586784800-42bac9c32db9"
                      />
                      <div>
                        <h3 className="font-semibold">
                          WhatsApp Evolution API
                        </h3>
                        <p className="text-sm text-gray-400">
                          Conectar com API
                        </p>
                      </div>
                    </div>
                    <EvolutionApiIntegration bot={bot} />
                  </div>
                  <div className="p-6 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        alt="CRM integration icon"
                        className="w-8 h-8"
                        src="https://images.unsplash.com/photo-1650951472998-4abf9d05f0c4"
                      />
                      <div>
                        <h3 className="font-semibold">CRM Integration</h3>
                        <p className="text-sm text-gray-400">
                          Sincronizar contatos
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        toast({
                          title:
                            "🚧 Integração ainda não implementada—solicite no próximo prompt! 🚀",
                        })
                      }
                    >
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default BotConfig;
