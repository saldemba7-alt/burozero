# 🚀 Guia de Deploy — BuroZero

## Visão geral

```
GitHub ──► Railway (Backend API)
                │
                ▼
          MongoDB Atlas (DB)
                │
                ▼
         Expo EAS (App Android/iOS)
```

---

## PARTE 1 — MongoDB Atlas (base de dados grátis)

1. Vai a **https://cloud.mongodb.com** → cria conta grátis
2. Cria um cluster **M0 Free**
3. Em **Database Access** → cria utilizador:
   - Username: `burozero`
   - Password: (gera uma forte e guarda)
4. Em **Network Access** → clica **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
5. Em **Databases** → clica **Connect** → **Drivers** → copia a connection string:
   ```
   mongodb+srv://burozero:<password>@cluster0.xxxxx.mongodb.net/burozero
   ```
   Substitui `<password>` pela password que criaste.

---

## PARTE 2 — Railway (backend grátis $5/mês créditos)

1. Vai a **https://railway.app** → Login com GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Selecciona o repositório `burozero`
4. Railway detecta o `Dockerfile` automaticamente

### Variáveis de ambiente (Settings → Variables):

| Chave | Valor |
|-------|-------|
| `MONGODB_URL` | `mongodb+srv://burozero:PASSWORD@cluster0.xxxxx.mongodb.net/burozero` |
| `JWT_SECRET` | (gera: `openssl rand -hex 32`) |
| `SMTP_USER` | `o.teu@gmail.com` |
| `SMTP_PASS` | (App Password do Gmail) |
| `DB_NAME` | `burozero` |

5. **Deploy** → aguarda ~2 min
6. Em **Settings → Domains** → clica **Generate Domain**
   - Resultado: `https://burozero-api.up.railway.app`
7. Testa: abre `https://burozero-api.up.railway.app/docs`

---

## PARTE 2B — Render (alternativa 100% grátis)

1. Vai a **https://render.com** → Login com GitHub
2. **New** → **Web Service** → selecciona o repositório
3. Configuração:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Adiciona as mesmas variáveis de ambiente (ver tabela acima)
5. **Create Web Service**

> ⚠️ O Render grátis "adormece" após 15 min de inactividade (cold start ~30s).
> Para produção usa Railway ou paga o Render Starter ($7/mês).

---

## PARTE 3 — App Android com Expo EAS

### Pré-requisitos
```bash
npm install -g eas-cli
eas login          # login na tua conta Expo
```

### Configurar o projecto
```bash
cd frontend
npx expo install expo-notifications expo-secure-store
# Edita .env com a URL do Railway:
echo "EXPO_PUBLIC_API_URL=https://burozero-api.up.railway.app/api" > .env
```

### Build APK para teste (grátis)
```bash
eas build --platform android --profile preview
# Aguarda ~10 min → recebe link para download do APK
# Instala directamente no Android (sem Play Store)
```

### Build para Google Play Store
```bash
eas build --platform android --profile production
# Gera .aab para submeter na Play Store
```

### Submeter na Play Store
1. Cria conta **Google Play Console** (taxa única de $25)
2. **Create app** → preenche informações
3. Em **Internal Testing** → faz upload do `.aab`
4. Partilha o link de teste com utilizadores

---

## PARTE 4 — Gmail App Password (para o SMTP)

1. Vai a **myaccount.google.com**
2. **Segurança** → **Verificação em dois passos** (activa se não estiver)
3. **Palavras-passe de aplicações** → cria uma nova
4. Selecciona **Correio** + **Outro** (escreve "BuroZero")
5. Copia a password de 16 caracteres → usa como `SMTP_PASS`

---

## Checklist final

- [ ] MongoDB Atlas criado e connection string copiada
- [ ] Railway/Render a correr com todas as variáveis
- [ ] Endpoint `/docs` responde em HTTPS
- [ ] `.env` do frontend actualizado com URL de produção
- [ ] APK gerado e testado no telemóvel
- [ ] Gmail SMTP configurado (testar com `/api/auth/request-otp`)

---

## URLs importantes

| Serviço | URL |
|---------|-----|
| API (Railway) | `https://burozero-api.up.railway.app` |
| Docs Swagger | `https://burozero-api.up.railway.app/docs` |
| MongoDB Atlas | `https://cloud.mongodb.com` |
| Expo Build | `https://expo.dev/accounts/[user]/projects/burozero` |
| Play Console | `https://play.google.com/console` |
