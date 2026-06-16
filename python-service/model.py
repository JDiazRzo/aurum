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
