from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
from dotenv import load_dotenv
from model import detect_anomalies, analyze_month_risk
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



class BudgetCategory(BaseModel):
    id:           str
    category_id:  str
    category_name: Optional[str] = None
    limit_amount: float
    spent_amount: float

class RebalanceRequest(BaseModel):
    transactions:       list[Transaction]
    budget_categories:  list[BudgetCategory]
    days_remaining:     int
    total_budget:       float

class RebalanceResponse(BaseModel):
    success:        bool
    risk:           dict
    alert:          Optional[str]
    suggestions:    list[dict]


@app.post("/rebalance", response_model=RebalanceResponse)
def rebalance(request: RebalanceRequest):
    """
    1. Evalúa el riesgo del mes con Isolation Forest
    2. Si hay anomalías, calcula una redistribución del presupuesto restante
    """
    expenses = [
        t.model_dump()
        for t in request.transactions
        if t.type == "expense"
    ]

    # ── Paso 1: análisis de riesgo ────────────────────────────
    risk = analyze_month_risk(expenses) if len(expenses) >= 3 else {
        "risk_score": None, "anomaly_count": 0, "worst_transaction": None
    }

    # ── Paso 2: generar alerta ────────────────────────────────
    alert = None
    if risk["risk_score"] is not None and risk["risk_score"] < 50:
        worst = risk.get("worst_transaction")
        if worst:
            alert = (
                f"Patrón inusual detectado en {worst['category']}: "
                f"${worst['amount']:,.0f} ({worst['ratio']}x tu promedio). "
                f"{risk['anomaly_count']} transacciones fuera de tu historial normal."
            )

    # ── Paso 3: redistribución del presupuesto restante ───────
    suggestions = []
    cats = request.budget_categories

    if not cats or request.days_remaining <= 0:
        return RebalanceResponse(success=True, risk=risk, alert=alert, suggestions=[])

    # Categorías que están en riesgo de excederse (>75% usado)
    at_risk = [
        c for c in cats
        if c.limit_amount > 0 and (c.spent_amount / c.limit_amount) > 0.75
    ]

    # Categorías con margen disponible (< 50% usado)
    with_margin = [
        c for c in cats
        if c.limit_amount > 0 and (c.spent_amount / c.limit_amount) < 0.50
    ]

    total_remaining = sum(
        max(0, c.limit_amount - c.spent_amount) for c in cats
    )

    # Proyección lineal: ¿cuánto gastarán al ritmo actual?
    days_elapsed = 30 - request.days_remaining
    if days_elapsed > 0:
        for cat in at_risk:
            daily_rate   = cat.spent_amount / days_elapsed
            projected    = daily_rate * 30
            overshoot    = projected - cat.limit_amount

            if overshoot > 0:
                # ¿Cuánto necesitamos redirigir?
                needed_cut = round(overshoot * (request.days_remaining / 30))

                # ¿Dónde tomarlo? De categorías con margen, proporcionalmente
                donor_total = sum(
                    (c.limit_amount - c.spent_amount) for c in with_margin
                ) or 1

                transfers = []
                for donor in with_margin:
                    donor_margin = donor.limit_amount - donor.spent_amount
                    cut = round(needed_cut * (donor_margin / donor_total))
                    if cut > 1000:  # solo sugerir si es significativo (> $1.000 COP)
                        transfers.append({
                            "from_category": donor.category_name or donor.category_id,
                            "amount":        cut
                        })

                if transfers:
                    suggestions.append({
                        "category":   cat.category_name or cat.category_id,
                        "projected":  round(projected),
                        "overshoot":  round(overshoot),
                        "suggested_new_limit": round(cat.limit_amount + needed_cut),
                        "transfers":  transfers,
                        "message": (
                            f"{cat.category_name or 'Esta categoría'} va a excederse "
                            f"por ${overshoot:,.0f} al ritmo actual. "
                            f"Reduce ${needed_cut:,.0f} de otras categorías para compensar."
                        )
                    })

    return RebalanceResponse(
        success=True,
        risk=risk,
        alert=alert,
        suggestions=suggestions
    )

# ── Correr el servidor ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
