# BuroZero — Anti-Burocracia Portugal

App mobile para gerir processos e prazos com entidades portuguesas:
AT, Segurança Social, AIMA, IMT, IMPIC, Câmaras Municipais.

---

## Stack

| Camada    | Tecnologia              |
|-----------|-------------------------|
| Backend   | FastAPI + MongoDB/Beanie|
| Frontend  | Expo (React Native)     |
| Deploy    | Railway / Render (grátis)|

---

## Estrutura

```
burozero/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── database.py       # MongoDB connection
│   │   ├── models/
│   │   │   ├── process.py    # Modelo de processo
│   │   │   └── alert.py      # Modelo de alerta
│   │   ├── routers/
│   │   │   ├── processes.py  # CRUD processos
│   │   │   ├── alerts.py     # Alertas
│   │   │   └── calendar.py   # Calendário fiscal PT
│   │   └── services/
│   │       ├── alert_service.py  # Lógica de alertas automáticos
│   │       └── templates.py      # Passos pré-definidos por processo
│   └── requirements.txt
├── frontend/
│   ├── screens/
│   │   ├── HomeScreen.js         # Dashboard principal
│   │   └── AddProcessScreen.js   # Adicionar processo
│   ├── components/
│   │   └── ProcessCard.js        # Card de processo
│   └── services/
│       └── api.js                # Chamadas ao backend
└── docker-compose.yml
```

---

## Como correr (desenvolvimento)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API disponível em http://localhost:8000
# Docs em http://localhost:8000/docs
```

### Ou com Docker

```bash
docker-compose up
```

### Frontend (Expo)

```bash
cd frontend
npx create-expo-app . --template blank
# Copiar os ficheiros desta pasta para o projeto Expo
npm install @react-native-community/datetimepicker
npx expo start
```

---

## API Endpoints

### Processos
| Método | Rota                                    | Descrição              |
|--------|-----------------------------------------|------------------------|
| GET    | /api/processes/?user_id=X               | Listar processos       |
| POST   | /api/processes/?user_id=X               | Criar processo         |
| GET    | /api/processes/{id}                     | Ver processo           |
| PATCH  | /api/processes/{id}                     | Actualizar processo    |
| PATCH  | /api/processes/{id}/steps/{n}/done      | Marcar passo concluído |
| DELETE | /api/processes/{id}                     | Eliminar processo      |

### Alertas
| Método | Rota                        | Descrição           |
|--------|-----------------------------|---------------------|
| GET    | /api/alerts/?user_id=X      | Listar alertas      |
| PATCH  | /api/alerts/{id}/read       | Marcar como lido    |
| PATCH  | /api/alerts/read-all        | Marcar todos lidos  |

### Calendário Fiscal
| Método | Rota                             | Descrição                   |
|--------|----------------------------------|-----------------------------|
| GET    | /api/calendar/?year=2026         | Calendário completo         |
| GET    | /api/calendar/upcoming?days=30   | Próximos 30 dias            |

---

## Lógica de alertas automáticos

O sistema gera alertas sem precisar de APIs das entidades:

- **🚨 Urgente** — prazo em ≤ 2 dias
- **⚠️ Aviso** — prazo em ≤ 7 dias  
- **⏸ Parado** — sem actualização há ≥ 30 dias

---

## Roadmap MVP → v1

### MVP (Semana 1–2)
- [x] CRUD processos
- [x] Alertas automáticos por prazo
- [x] Calendário fiscal PT 2026 pré-carregado
- [x] Passo-a-passo por tipo de processo
- [ ] Notificações push (Expo Notifications)
- [ ] Auth básica (email + OTP)

### v1 (Mês 2)
- [ ] Partilha de processo (link público)
- [ ] Exportar processo em PDF
- [ ] Suporte multi-utilizador (NIF separado)
- [ ] Plano Pro: €3,99/mês (Stripe)

### v2 (Mês 3+)
- [ ] OCR de documentos (foto do documento → dados extraídos)
- [ ] Assistente IA ("o que preciso para renovar autorização de residência?")
- [ ] Integração WhatsApp Business (alertas via WhatsApp)
