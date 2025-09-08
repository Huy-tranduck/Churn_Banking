# Customer Churn Prediction Visualizer

A React application with FastAPI backend for predicting customer churn using CatBoost machine learning model.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + CatBoost
- **Deployment**: Vercel (Frontend) + Heroku/Railway (Backend)

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.8+

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to API directory:
   ```bash
   cd api
   ```

2. Install Python dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

3. Run the API server:
   ```bash
   python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_PREDICT_API_URL`: Your backend API URL

### Backend Options
- **Heroku**: Follow Python deployment guide
- **Railway**: Connect GitHub repo and deploy
- **Google Cloud Run**: Docker deployment
- **AWS Lambda**: Serverless deployment with Mangum

## 📊 Features

- **File Upload**: Excel/CSV customer data processing
- **Manual Entry**: Single customer prediction
- **Real-time Prediction**: CatBoost model integration  
- **Interactive Dashboard**: Charts and analytics
- **Responsive Design**: Works on all devices

## 🔧 Environment Variables

```bash
# Required
VITE_PREDICT_API_URL=http://localhost:8000

# Optional
VITE_NODE_ENV=development
GEMINI_API_KEY=your_api_key_here
```

## 📈 API Endpoints

- `GET /` - API status
- `GET /health` - Detailed health check
- `GET /features` - Feature information
- `GET /sample` - Sample data
- `POST /predict` - Churn prediction
