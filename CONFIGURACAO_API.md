# Configuração da Evolution API

## Onde configurar as variáveis de ambiente:

### 1. No Tempo (Plataforma atual):
- Vá para a **página inicial do projeto**
- Clique em **"Project Settings"** ou **"Configurações do Projeto"**
- Procure pela seção **"Environment Variables"** ou **"Variáveis de Ambiente"**
- Adicione as seguintes variáveis:

```
EVOLUTION_API_URL=https://evov2.duckdns.org
EVOLUTION_API_KEY=79Bb4lpu2TzxrSMu3SDfSGvB3MIhkur7
```

### 2. Formato correto das variáveis:

**EVOLUTION_API_URL:**
- Valor: `https://evov2.duckdns.org`
- Certifique-se de incluir o `https://` no início

**EVOLUTION_API_KEY:**
- Valor: `79Bb4lpu2TzxrSMu3SDfSGvB3MIhkur7`
- Use exatamente como fornecido

### 3. Após configurar:
1. Salve as configurações
2. Aguarde alguns segundos para as variáveis serem aplicadas
3. Volte para a página de configuração do bot
4. Clique em **"Testar Conexão"** para verificar se está funcionando
5. Se o teste passar, você poderá clicar em **"Conectar WhatsApp"**

### 4. Localização no Tempo:
- **Home Page** → **Project Settings** → **Environment Variables**
- Ou procure por um ícone de engrenagem/configurações na interface

## Importante:
- NÃO adicione essas informações diretamente no código
- Use sempre as variáveis de ambiente por segurança
- Após configurar, teste a conexão antes de tentar conectar o WhatsApp
