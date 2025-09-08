export interface CustomerData {
  CustomerId: number;
  CreditScore: number;
  Gender: 'Male' | 'Female';
  Age: number;
  Tenure: number;
  Balance: number;
  NumOfProducts: number;
  HasCrCard: 0 | 1;
  IsActiveMember: 0 | 1;
  EstimatedSalary: number;
  LoginFrequency: number;
  ExternalTransfers: number;
  Exited?: 0 | 1;
  Prediction?: 0 | 1;
  ChurnProbability?: number;
  ConfidenceScore?: number;
}

export interface PredictionResult {
  totalCustomers: number;
  churnCount: number;
  retentionCount: number;
  dataWithPredictions: CustomerData[];
}