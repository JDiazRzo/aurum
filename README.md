![Banner](https://capsule-render.vercel.app/api?type=waving&height=250&color=gradient&customColorList=20,10,5&text=Aurum&desc=AI-Powered%20Personal%20Finance%20Assistant&fontAlignY=38&descAlignY=60)

<div align="center">

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aurum-eosin.vercel.app/login)
[![Repo](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JDiazRzo/aurum)
[![Docs](https://img.shields.io/badge/DeepWiki-Docs-526CFE?style=for-the-badge&logo=gitbook&logoColor=white)](https://deepwiki.com/JDiazRzo/aurum)

---

### Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=fff)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=fff)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=fff)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=fff)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=fff)

---

### Features

- Dashboard with monthly balance, income vs expenses and spending trends
- Transaction management with category filtering
- Monthly budgets with per-category limits and real-time tracking
- ML anomaly detection using Isolation Forest (Python/FastAPI microservice)
- AI financial assistant powered by Groq's LLaMA 3 with access to real user data
- Authentication with Supabase Auth and Row Level Security
- Fully responsive with mobile bottom navigation
- Aurora animated background

---

---

### Getting Started

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev

# Python service
cd python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

### Environment Variables

**Backend `.env`**
```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GROQ_API_KEY=
PYTHON_SERVICE_URL=
CLIENT_URL=
PORT=3000
```

**Frontend `.env`**
```env
VITE_API_URL=
```

**Python `.env`**
```env
PORT=8000
```

</div>

![footer](https://capsule-render.vercel.app/api?type=waving&height=200&color=gradient&customColorList=20,10,5&text=Built%20with%20React%2C%20Node.js%20%26%20Python&section=footer&fontAlignY=65&fontSize=24)