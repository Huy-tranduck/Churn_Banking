# 🚀 Deployment Guide

## 📋 Vercel Deployment Steps

### Prerequisites
1. GitHub account
2. Vercel account (linked to GitHub)
3. Project pushed to GitHub repository

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Through Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 3: Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:
```
VITE_PREDICT_API_URL=https://your-backend-url.com
VITE_NODE_ENV=production
```

### Step 4: Custom Domain (Optional)
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS settings

## 🐍 Backend Deployment Options

### Option 1: Heroku (Recommended for CatBoost model)
1. Create `Procfile`:
   ```
   web: uvicorn api.main:app --host=0.0.0.0 --port=${PORT:-5000}
   ```

2. Create `runtime.txt`:
   ```
   python-3.9.20
   ```

3. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Option 2: Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Option 3: Google Cloud Run
1. Create `Dockerfile`:
   ```dockerfile
   FROM python:3.9
   WORKDIR /app
   COPY api/requirements.txt .
   RUN pip install -r requirements.txt
   COPY api/ .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
   ```

### Option 4: Vercel Serverless (Limited)
- Uses mock prediction (included in this setup)
- Good for demo purposes
- Limited by serverless constraints

## 🔧 Production Checklist

- [ ] Environment variables configured
- [ ] CORS settings updated for production domain
- [ ] API URL updated in frontend
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Analytics setup (optional)
- [ ] Error monitoring setup (optional)

## 📊 Post-Deployment Testing

1. Test file upload functionality
2. Test manual entry prediction
3. Verify API connectivity
4. Check responsive design
5. Test error handling

## 🚨 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version compatibility
2. **API connection fails**: Verify CORS and URL configuration
3. **Large bundle size**: Consider code splitting
4. **Serverless timeout**: Use external backend for complex models

### Debug Commands:
```bash
# Local build test
npm run build
npm run preview

# Check bundle size
npx vite-bundle-analyzer

# Test API endpoints
curl https://your-app.vercel.app/api/health
```
