import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_anomalies(transactions: list[dict]) -> list[dict]:
    """
    Recibe una lista de transacciones y retorna las que son anómalas.

    Isolation Forest funciona así:
    - Construye árboles de decisión aleatorios
    - Las anomalías son puntos que se aíslan más rápido (menos particiones)
    - Retorna -1 para anomalías y 1 para normales
    """

    if len(transactions) < 5:
        # Con menos de 5 datos el modelo no es confiable
        return []

    # Convertir a DataFrame para manipular
    df = pd.DataFrame(transactions)

    # Features que usa el modelo para detectar anomalías
    features = df[['amount']].copy()

    # Convertir a float por seguridad
    features['amount'] = features['amount'].astype(float)

    # Un gasto alto un lunes puede ser normal, un domingo no
    if 'transaction_date' in df.columns:
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        features['day_of_week'] = df['transaction_date'].dt.dayofweek
        features['day_of_month'] = df['transaction_date'].dt.day

    # Isolation Forest
    # contamination: qué porcentaje podrian ser anomalías (10%)
    # random_state: para resultados reproducibles
    model = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )

    predictions = model.fit_predict(features)

    scores = model.score_samples(features)
    # Agregar al dataframe
    df['is_anomaly'] = predictions == -1
    df['anomaly_score'] = scores

    # Filtrar las anómalas y construir respuesta
    anomalies = []
    for _, row in df[df['is_anomaly']].iterrows():
        avg_amount = float(features['amount'].mean())
        ratio = float(row['amount']) / avg_amount if avg_amount > 0 else 1

        anomalies.append({
            'id':            row.get('id'),
            'amount':        float(row['amount']),
            'description':   row.get('description', ''),
            'category':      row.get('category', 'Sin categoría'),
            'transaction_date': str(row.get('transaction_date', '')),
            'anomaly_score': round(float(row['anomaly_score']), 4),
            'reason':        build_reason(float(row['amount']), avg_amount, ratio)
        })

    # Ordenar por score
    anomalies.sort(key=lambda x: x['anomaly_score'])
    return anomalies


def build_reason(amount: float, avg: float, ratio: float) -> str:
    if ratio > 3:
        return f"Monto {ratio:.1f}x mayor al promedio (${avg:,.0f})"
    elif ratio > 2:
        return f"Monto inusualmente alto para tu historial"
    elif ratio < 0.1:
        return f"Monto muy pequeño comparado a tu historial"
    else:
        return f"Patrón de gasto inusual detectado"


def analyze_month_risk(transactions: list[dict]) -> dict:
    """
    Calcula el riesgo del mes completo usando los scores del Isolation Forest.
    A diferencia de detect_anomalies, evalúa TODAS las transacciones (no solo las anómalas)
    y devuelve un índice de riesgo 0-100 donde 100 = comportamiento completamente normal.
    """
    if len(transactions) < 3:
        return { "risk_score": None, "anomaly_count": 0, "worst_transaction": None }

    df = pd.DataFrame(transactions)
    features = df[['amount']].copy()
    features['amount'] = features['amount'].astype(float)

    if 'transaction_date' in df.columns:
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        features['day_of_week']  = df['transaction_date'].dt.dayofweek
        features['day_of_month'] = df['transaction_date'].dt.day

    model = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
    model.fit(features)

    # score_samples: más negativo = más anómalo. Rango típico: -0.7 a 0.1
    scores = model.score_samples(features)
    predictions = model.predict(features)

    df['anomaly_score'] = scores
    df['is_anomaly']    = predictions == -1

    # Normalizar a 0-100: -0.7 → 0 (máximo riesgo), 0.1 → 100 (normal)
    min_score, max_score = -0.7, 0.1
    mean_score = float(np.mean(scores))
    normalized = (mean_score - min_score) / (max_score - min_score)
    risk_index = int(round(max(0, min(100, normalized * 100))))

    anomaly_count = int(df['is_anomaly'].sum())

    # Peor transacción: la de score más bajo
    worst_idx = df['anomaly_score'].idxmin()
    worst_row = df.loc[worst_idx]
    avg_amount = float(features['amount'].mean())

    worst = {
        "id":               worst_row.get('id'),
        "amount":           float(worst_row['amount']),
        "description":      worst_row.get('description', ''),
        "category":         worst_row.get('category', 'Sin categoría'),
        "transaction_date": str(worst_row.get('transaction_date', '')),
        "ratio":            round(float(worst_row['amount']) / avg_amount, 1) if avg_amount > 0 else 1
    }

    return {
        "risk_score":        risk_index,       # 0=muy inusual, 100=muy normal
        "anomaly_count":     anomaly_count,
        "avg_amount":        round(avg_amount, 0),
        "worst_transaction": worst
    }
