from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
from dotenv import load_dotenv
from model import detect_anomalies
import os

load_dotenv()

app = FastAPI(
    title="Aurum AI Service",
    description="Microservicio de detección de anomalías financieras",
    version="1.0.0"
)

# CORS para que Node.js pueda consumir este servicio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Modelos de datos ──────────────────────────────────────────
class Transaction(BaseModel):
    id:               Optional[str]  = None
    amount:           float
    type:             str
    description:      Optional[str]  = None
    category:         Optional[str]  = None
    transaction_date: Optional[str]  = None


class AnalyzeRequest(BaseModel):
    transactions: list[Transaction]


class AnomalyResponse(BaseModel):
    success:   bool
    total:     int
    anomalies: list[dict]


# ── Endpoints ─────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "aurum-ai"}


@app.post("/analyze", response_model=AnomalyResponse)
def analyze(request: AnalyzeRequest):
    """
    Recibe transacciones y retorna las anómalas.
    Node.js llama este endpoint pasando el historial del usuario.
    """
    if not request.transactions:
        raise HTTPException(status_code=400, detail="No se enviaron transacciones")

    # Filtrar solo gastos (no tiene sentido analizar ingresos como anomalías)
    expenses = [
        t.model_dump()
        for t in request.transactions
        if t.type == "expense"
    ]

    if len(expenses) < 5:
        return AnomalyResponse(
            success=True,
            total=0,
            anomalies=[],
        )

    anomalies = detect_anomalies(expenses)

    return AnomalyResponse(
        success=True,
        total=len(anomalies),
        anomalies=anomalies
    )


# ── Correr el servidor ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
