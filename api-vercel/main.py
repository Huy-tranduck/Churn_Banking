from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import json

# Vercel serverless function adapter
app = FastAPI()

# CORS for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gender mapping - định nghĩa trực tiếp như trong churn_clf.py
GENDER_MAP = {"Male": 1, "Female": 0}

# Selected features - định nghĩa trực tiếp như trong churn_clf.py
SELECTED = [
    "ExternalTransfers",
    "TransferLoginRatio",
    "NumOfProducts", 
    "Age",
    'Gender',
    "IsActiveMember",
    'LoginFrequency',
    'Balance',
    "BalancePerProduct",
    "SalaryPerAge",
    "ActivityPerTenure"
]

class PredictRequest(BaseModel):
    data: dict

class PredictResponse(BaseModel):
    probability: float
    prediction: int
    details: dict | None = None

def engineer(df: pd.DataFrame) -> pd.DataFrame:
    """
    Feature engineering theo đúng quy trình trong churn_clf.py
    """
    df = df.copy()
    
    # 1. Feature Engineering - tạo các biến mới
    df["BalancePerProduct"] = df["Balance"] / (df["NumOfProducts"] + 1e-5)
    df["ActivityPerTenure"] = df["LoginFrequency"] / (df["Tenure"].replace(0, 1) + 1)
    df["SalaryPerAge"] = df["EstimatedSalary"] / (df["Age"] + 1)
    df["TransferLoginRatio"] = df["ExternalTransfers"] / (df["LoginFrequency"] + 1)
    df["IsActiveCredit"] = ((df["IsActiveMember"] == 1) & (df["CreditScore"] >= 700)).astype(int)

    # 2. Xử lý outliers cho các feature được tạo mới
    feature_engineered = [
        "BalancePerProduct",
        "ActivityPerTenure", 
        "SalaryPerAge",
        "TransferLoginRatio"
    ]
    
    for col in feature_engineered:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            df[col] = df[col].clip(lower, upper)

    # 3. Gender mapping
    if "Gender" in df.columns:
        df["Gender"] = df["Gender"].map(GENDER_MAP).fillna(0).astype(int)

    return df

def mock_catboost_predict(X):
    """
    Mock prediction function for Vercel deployment (without CatBoost model)
    Uses heuristic rules based on feature importance
    """
    # Basic heuristic prediction
    prob = 0.05  # Base probability
    
    # Important features impact
    if X["ExternalTransfers"] < 5:
        prob += 0.15
    if X["NumOfProducts"] == 1:
        prob += 0.10
    if X["Age"] < 30:
        prob += 0.08
    if X["IsActiveMember"] == 0:
        prob += 0.12
    if X["Balance"] == 0:
        prob += 0.10
    if X["LoginFrequency"] < 5:
        prob += 0.08
        
    # Clip probability
    prob = max(0.01, min(0.99, prob))
    pred = 1 if prob > 0.5 else 0
    
    return prob, pred

@app.get("/")
def read_root():
    return {"message": "Churn Prediction API (Vercel)", "status": "running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "deployment": "vercel-serverless",
        "model": "mock-heuristic",
        "selected_features": SELECTED,
        "gender_mapping": GENDER_MAP
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        # Tạo DataFrame từ input
        df = pd.DataFrame([req.data])
        
        # Áp dụng feature engineering
        df = engineer(df)

        # Xử lý missing features
        for feature in SELECTED:
            if feature not in df.columns:
                if feature == 'Gender':
                    df[feature] = 0
                elif feature in ['HasCrCard', 'IsActiveMember']:
                    df[feature] = 1
                elif feature in ['ExternalTransfers', 'LoginFrequency']:
                    df[feature] = 1
                elif feature in ['CreditScore']:
                    df[feature] = 650
                elif feature in ['Tenure']:
                    df[feature] = 2
                else:
                    df[feature] = 0

        # Chọn features theo đúng thứ tự
        X = df[SELECTED].copy().fillna(0)
        
        # Mock prediction (since we can't load large model in serverless)
        proba, pred = mock_catboost_predict(X.iloc[0])

        return PredictResponse(
            probability=proba, 
            prediction=pred, 
            details={
                "used_features": SELECTED,
                "model_type": "Mock Heuristic (Vercel)",
                "note": "Using heuristic rules for serverless deployment"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vercel handler
from mangum import Mangum
handler = Mangum(app)
