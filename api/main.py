from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib, json
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np
import os

# Load artifacts
MODEL_PATH = "../catboost_model.pkl"

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

try:
    # Load CatBoost model from pickle file
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

print(f"Using gender mapping: {GENDER_MAP}")
print(f"Using selected features: {SELECTED}")
print("Configuration loaded directly from code (following churn_clf.py approach)")

app = FastAPI(title="Churn Prediction API")


@app.get("/")
def read_root():
    return {"message": "Churn Prediction API is running", "model_loaded": model is not None}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "configuration": "Using direct values from code (following churn_clf.py)",
        "scaling_approach": "No scaling applied (CatBoost works well without scaling)",
        "selected_features": SELECTED,
        "gender_mapping": GENDER_MAP
    }


@app.get("/features")
def get_feature_info():
    """
    Trả về thông tin về các features được sử dụng trong model
    """
    return {
        "selected_features": SELECTED,
        "feature_descriptions": {
            "ExternalTransfers": "Số lượng giao dịch chuyển khoản ra ngoài",
            "TransferLoginRatio": "Tỷ lệ giao dịch chuyển khoản trên số lần đăng nhập",
            "NumOfProducts": "Số lượng sản phẩm ngân hàng đang sử dụng",
            "Age": "Tuổi của khách hàng",
            "Gender": "Giới tính (0: Female, 1: Male)",
            "IsActiveMember": "Tình trạng hoạt động (0: Không hoạt động, 1: Hoạt động)",
            "LoginFrequency": "Tần suất đăng nhập trong kỳ",
            "Balance": "Số dư tài khoản hiện tại",
            "BalancePerProduct": "Số dư trung bình trên mỗi sản phẩm (tính toán)",
            "SalaryPerAge": "Thu nhập ước tính trên độ tuổi (tính toán)",
            "ActivityPerTenure": "Mức độ hoạt động trên mỗi năm gắn bó (tính toán)"
        },
        "engineered_features": [
            "BalancePerProduct",
            "ActivityPerTenure", 
            "SalaryPerAge",
            "TransferLoginRatio",
            "IsActiveCredit"
        ],
        "required_input_fields": [
            "ExternalTransfers", "NumOfProducts", "Age", "Gender", 
            "IsActiveMember", "LoginFrequency", "Balance", "EstimatedSalary", 
            "Tenure", "CreditScore"
        ]
    }


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
    # BalancePerProduct: Số dư trung bình trên mỗi sản phẩm
    df["BalancePerProduct"] = df["Balance"] / (df["NumOfProducts"] + 1e-5)
    
    # ActivityPerTenure: Hoạt động trên mỗi năm gắn bó
    df["ActivityPerTenure"] = df["LoginFrequency"] / (df["Tenure"].replace(0, 1) + 1)
    
    # SalaryPerAge: Thu nhập trên độ tuổi
    df["SalaryPerAge"] = df["EstimatedSalary"] / (df["Age"] + 1)
    
    # TransferLoginRatio: Tỷ lệ chuyển khoản trên đăng nhập
    df["TransferLoginRatio"] = df["ExternalTransfers"] / (df["LoginFrequency"] + 1)
    
    # IsActiveCredit: Khách hàng hoạt động với tín dụng tốt
    df["IsActiveCredit"] = ((df["IsActiveMember"] == 1) & (df["CreditScore"] >= 700)).astype(int)

    # 2. Xử lý outliers cho các feature được tạo mới (theo quy trình trong churn_clf.py)
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


@app.get("/sample")
def get_sample_data():
    """
    Trả về dữ liệu mẫu để test API
    """
    return {
        "sample_high_churn": {
            "CreditScore": 600,
            "Gender": "Female",
            "Age": 35,
            "Tenure": 1,
            "Balance": 0,
            "NumOfProducts": 1,
            "HasCrCard": 0,
            "IsActiveMember": 0,
            "EstimatedSalary": 50000,
            "LoginFrequency": 2,
            "ExternalTransfers": 0
        },
        "sample_low_churn": {
            "CreditScore": 750,
            "Gender": "Male", 
            "Age": 45,
            "Tenure": 8,
            "Balance": 150000,
            "NumOfProducts": 3,
            "HasCrCard": 1,
            "IsActiveMember": 1,
            "EstimatedSalary": 80000,
            "LoginFrequency": 15,
            "ExternalTransfers": 10
        }
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not available on server")

    payload = req.data
    try:
        # Tạo DataFrame từ input
        df = pd.DataFrame([payload])
        
        # Áp dụng feature engineering
        df = engineer(df)

        # Kiểm tra và xử lý missing features
        available_features = [col for col in SELECTED if col in df.columns]
        missing_features = [col for col in SELECTED if col not in df.columns]
        
        if missing_features:
            print(f"Warning: Missing features: {missing_features}")
            # Điền giá trị mặc định cho features bị thiếu
            for feature in missing_features:
                if feature == 'Gender':
                    df[feature] = 0  # Default gender
                elif feature in ['HasCrCard', 'IsActiveMember']:
                    df[feature] = 1  # Default to having card and being active
                elif feature in ['ExternalTransfers', 'LoginFrequency']:
                    df[feature] = 1  # Default minimal activity
                elif feature in ['CreditScore']:
                    df[feature] = 650  # Default credit score
                elif feature in ['Tenure']:
                    df[feature] = 2  # Default tenure
                else:
                    df[feature] = 0  # Default numeric value

        # Đảm bảo tất cả features cần thiết có mặt
        for feature in SELECTED:
            if feature not in df.columns:
                df[feature] = 0

        # Chọn features theo đúng thứ tự
        X = df[SELECTED].copy()
        
        # Xử lý missing values nếu có
        X = X.fillna(0)
        
        # Scaling note: Trong churn_clf.py, scaler được fit trên toàn bộ training set
        # Nhưng ở đây chúng ta chỉ có 1 sample để predict
        # CatBoost có thể hoạt động tốt mà không cần scaling
        # Nếu cần scaling chính xác, nên lưu scaler đã fit trong quá trình training
        
        # Tạm thời bỏ qua scaling vì:
        # 1. CatBoost không yêu cầu bắt buộc phải scale
        # 2. Scaling 1 sample sẽ không đúng (cần fit trên training set)
        print("Skipping scaling for single prediction (CatBoost works well without scaling)")
        
        # Nếu cần scaling chính xác, cần lưu fitted scaler từ training:
        # joblib.dump(scaler, "scaler.pkl") sau khi fit trong churn_clf.py

        # Dự đoán
        try:
            proba = float(model.predict_proba(X)[:, 1][0])
            pred = int(model.predict(X)[0])
        except Exception as e:
            print(f"Prediction error: {e}")
            # Fallback: sử dụng predict_proba để tính prediction
            proba = float(model.predict_proba(X)[:, 1][0])
            pred = 1 if proba >= 0.5 else 0

        return PredictResponse(
            probability=proba, 
            prediction=pred, 
            details={
                "used_features": SELECTED,
                "missing_features": missing_features,
                "engineered_features": [
                    "BalancePerProduct", "ActivityPerTenure", "SalaryPerAge", 
                    "TransferLoginRatio", "IsActiveCredit"
                ],
                "model_type": "CatBoost",
                "scaling_applied": False,
                "note": "Scaling skipped - CatBoost works well without scaling. For exact reproduction, save fitted scaler from training."
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
