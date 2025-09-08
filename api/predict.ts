import { VercelRequest, VercelResponse } from '@vercel/node';

// Gender mapping
const GENDER_MAP = { "Male": 1, "Female": 0 };

// Selected features
const SELECTED = [
  "ExternalTransfers", "TransferLoginRatio", "NumOfProducts", 
  "Age", "Gender", "IsActiveMember", "LoginFrequency", 
  "Balance", "BalancePerProduct", "SalaryPerAge", "ActivityPerTenure"
];

function engineer(data: any) {
  // Feature engineering
  const engineered = { ...data };
  
  engineered.BalancePerProduct = engineered.Balance / (engineered.NumOfProducts + 1e-5);
  engineered.ActivityPerTenure = engineered.LoginFrequency / (engineered.Tenure + 1);
  engineered.SalaryPerAge = engineered.EstimatedSalary / (engineered.Age + 1);
  engineered.TransferLoginRatio = engineered.ExternalTransfers / (engineered.LoginFrequency + 1);
  engineered.IsActiveCredit = ((engineered.IsActiveMember === 1) && (engineered.CreditScore >= 700)) ? 1 : 0;
  
  // Gender mapping
  if (typeof engineered.Gender === 'string') {
    engineered.Gender = GENDER_MAP[engineered.Gender as keyof typeof GENDER_MAP] || 0;
  }
  
  return engineered;
}

function mockPredict(X: any) {
  // Heuristic prediction
  let prob = 0.05;
  
  if (X.ExternalTransfers < 5) prob += 0.15;
  if (X.NumOfProducts === 1) prob += 0.10;
  if (X.Age < 30) prob += 0.08;
  if (X.IsActiveMember === 0) prob += 0.12;
  if (X.Balance === 0) prob += 0.10;
  if (X.LoginFrequency < 5) prob += 0.08;
  
  prob = Math.max(0.01, Math.min(0.99, prob));
  const pred = prob > 0.5 ? 1 : 0;
  
  return { probability: prob, prediction: pred };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: "Churn Prediction API (Vercel)",
      status: "running"
    });
  }

  if (req.method === 'POST') {
    try {
      const data = req.body.data;
      
      // Feature engineering
      const engineered = engineer(data);
      
      // Fill missing features
      SELECTED.forEach(feature => {
        if (!(feature in engineered)) {
          if (feature === 'Gender') engineered[feature] = 0;
          else if (['HasCrCard', 'IsActiveMember'].includes(feature)) engineered[feature] = 1;
          else if (['ExternalTransfers', 'LoginFrequency'].includes(feature)) engineered[feature] = 1;
          else if (feature === 'CreditScore') engineered[feature] = 650;
          else if (feature === 'Tenure') engineered[feature] = 2;
          else engineered[feature] = 0;
        }
      });
      
      // Predict
      const result = mockPredict(engineered);
      
      return res.status(200).json({
        probability: result.probability,
        prediction: result.prediction,
        details: {
          used_features: SELECTED,
          model_type: "Heuristic (Vercel)",
          note: "Using heuristic rules for serverless deployment"
        }
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Prediction failed',
        details: error
      });
    }
  }

  return res.status(405).json({
    error: 'Method not allowed'
  });
}
