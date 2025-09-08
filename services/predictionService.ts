import { CustomerData } from '../types';

declare const XLSX: any;

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        try {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error("Error parsing Excel file."));
        }
      }
    };
    reader.onerror = (error) => {
        reject(new Error("Error reading file."));
    };
    reader.readAsArrayBuffer(file);
  });
};

// This is a MOCK prediction function that simulates the CatBoost model's logic.
// It uses a specified list of features, with four key variables having the most weight.
export const mockCatBoostPredict = (data: CustomerData[]): CustomerData[] => {
  return data.map(customer => {
    // === 1. Feature Engineering ===
    // New features from the user's list
    const balancePerProduct = customer.Balance / (customer.NumOfProducts + 1e-5);
    const activityPerTenure = customer.LoginFrequency / (customer.Tenure + 1);
    // Existing engineered features from the user's list
    const salaryPerAge = customer.EstimatedSalary / (customer.Age + 1);
    const transferLoginRatio = customer.ExternalTransfers / (customer.LoginFrequency + 1);

    // Quartile values from data analysis for more accurate heuristics
    const BALANCE_Q3 = 127771.35; // Customers with balance above this are in the top 25%
    const EXT_TRANSFERS_Q1 = 19;   // Customers with transfers below this are in the bottom 25%

    let churnProbability = 0.05; // Base probability

    // === 2. Heuristic Rules based on Feature Importance ===

    // --- Core Four Most Important Factors ---

    // a. Balance: Extremes (very high or zero) are strong indicators.
    if (customer.Balance > BALANCE_Q3) {
      churnProbability += 0.25; // High weight
    } else if (customer.Balance === 0) {
      churnProbability += 0.20; // High weight
    }

    // b. ExternalTransfers: Low transfers suggest low engagement.
    if (customer.ExternalTransfers < EXT_TRANSFERS_Q1) {
      churnProbability += 0.20; // High weight
    }

    // c. SalaryPerAge: A low salary-to-age ratio might indicate financial pressure.
    if (salaryPerAge < 2000) {
      churnProbability += 0.15; // High weight
    }
    
    // d. TransferLoginRatio: High ratio can indicate non-primary account usage.
    if (transferLoginRatio > 0.75) {
      churnProbability += 0.15; // High weight
    }
    
    // --- Other Contributing Factors from the List ---

    // NumOfProducts: Having too many products is a known churn indicator.
    if (customer.NumOfProducts > 2) {
      churnProbability += 0.10; // Medium weight
    }

    // IsActiveMember: Inactive members are a clear risk.
    if (customer.IsActiveMember === 0) {
      churnProbability += 0.10; // Medium weight
    }
    
    // Age: Older customers might be more likely to churn in some contexts.
    if (customer.Age > 45) {
      churnProbability += 0.05; // Low weight
    }

    // Gender: Add a small weight for gender difference if observed in data.
    if (customer.Gender === 'Female') {
        churnProbability += 0.05; // Low weight
    }

    // LoginFrequency: Infrequent logins suggest disengagement.
    if (customer.LoginFrequency < 10) {
        churnProbability += 0.05; // Low weight
    }
    
    // BalancePerProduct: High balance in few products can be risky.
    if (balancePerProduct > 100000 && customer.NumOfProducts === 1) {
        churnProbability += 0.10; // Medium weight
    }

    // ActivityPerTenure: Low activity over a long tenure is a red flag.
    if (activityPerTenure < 1.5) { // e.g., login freq is less than 1.5x tenure
        churnProbability += 0.10; // Medium weight
    }

    // --- Retention Factors ---
    
    // Having 2 products is often a stable point for customers.
    if (customer.NumOfProducts === 2) {
        churnProbability -= 0.10;
    }

    // Active members are less likely to churn.
    if (customer.IsActiveMember === 1) {
        churnProbability -= 0.05;
    }

    // Clip probability to be within a realistic range [0.01, 0.99]
    churnProbability = Math.max(0.01, Math.min(0.99, churnProbability));
    
    const prediction = churnProbability > 0.5 ? 1 : 0;
    const confidenceScore = prediction === 1 ? churnProbability : 1 - churnProbability;

    return {
      ...customer,
      Prediction: prediction,
      ChurnProbability: churnProbability,
      ConfidenceScore: confidenceScore,
    };
  });
};

export async function predict(payload: CustomerData[]) {
  // API URL - tự động detect environment
  const isProduction = window.location.hostname !== 'localhost';
  const base = isProduction 
    ? `${window.location.origin}/api`  // Vercel production
    : (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_PREDICT_API_URL) || 
      (window as any).VITE_PREDICT_API_URL || 
      "http://localhost:8000";  // Local development
  
  try {
    console.log(`🔗 Connecting to API: ${base} (production: ${isProduction})`);
    
    const responses = await Promise.all(payload.map(async (customer, index) => {
      console.log(`📤 Sending request ${index + 1}/${payload.length} for customer ${customer.CustomerId}`);
      
      const res = await fetch(`${base}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: customer }),
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API Error ${res.status}: ${txt}`);
      }
      
      const response = await res.json();
      console.log(`📥 Response ${index + 1}: Probability=${response.probability.toFixed(4)}, Prediction=${response.prediction}`);
      
      return response;
    }));

    console.log(`✅ Successfully processed ${responses.length} predictions`);

    // Map responses back into CustomerData[] structure
    return payload.map((customer, idx) => ({
      ...customer,
      Prediction: responses[idx].prediction,
      ChurnProbability: responses[idx].probability,
      ConfidenceScore: responses[idx].prediction === 1 ? responses[idx].probability : 1 - responses[idx].probability,
    }));
  } catch (err) {
    console.error('❌ Prediction API failed:', err);
    console.warn('🔄 Falling back to mock prediction...');
    return mockCatBoostPredict(payload);
  }
}