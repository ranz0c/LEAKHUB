# 🚀 LeakHub Deployment Guide

## 🌟 Deployment Options

LeakHub can be deployed in multiple ways, from simple static hosting to full backend integration.

## 📦 Option 1: GitHub Pages (Recommended)

### Quick Setup
1. **Push to GitHub**: Push your code to the `main` branch
2. **Enable GitHub Pages**: 
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy on push

### Manual Setup
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder is ready for deployment
```

### GitHub Actions Workflow
The `.github/workflows/deploy.yml` file automatically:
- Builds the project with Vite
- Deploys to GitHub Pages
- Handles CORS and routing

## 🔧 Option 2: Vercel (Full Stack)

### Deploy with Backend
1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables** (optional):
   ```bash
   vercel env add DATABASE_URL
   vercel env add API_KEY
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Features
- ✅ Serverless API endpoints
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains
- ✅ Environment variables

## 🌐 Option 3: Netlify

### Deploy with Functions
1. **Connect to Netlify**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Features
- ✅ Serverless functions
- ✅ Form handling
- ✅ A/B testing
- ✅ Custom domains

## 🗄️ Option 4: Full Backend Integration

### Database Options

#### MongoDB Atlas
```javascript
// In api/database.js
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('leakhub');
```

#### Supabase (PostgreSQL)
```javascript
// In api/database.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

#### Firebase
```javascript
// In api/database.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

## 🔐 Environment Variables

### Required for Backend
```bash
# Database
DATABASE_URL=mongodb://localhost:27017/leakhub
# or
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# API Keys
API_KEY=your-secret-api-key
JWT_SECRET=your-jwt-secret

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Optional
```bash
# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
MIXPANEL_TOKEN=your-mixpanel-token

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Production Checklist

### Frontend
- [ ] Minify CSS and JavaScript
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Set up CDN
- [ ] Configure caching headers
- [ ] Add security headers

### Backend
- [ ] Set up database
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Set up logging
- [ ] Configure monitoring
- [ ] Set up backups

### Security
- [ ] HTTPS enabled
- [ ] Security headers
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection

## 📊 Monitoring & Analytics

### Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking
```javascript
// Add to script.js
window.addEventListener('error', function(e) {
  // Send to your error tracking service
  console.error('LeakHub Error:', e.error);
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Full Pipeline)
```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build-files
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🎯 Custom Domains

### GitHub Pages
1. Go to Settings → Pages
2. Add custom domain
3. Update DNS records
4. Enable HTTPS

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

## 🔧 Development vs Production

### Development
```bash
npm run dev          # Start development server
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run format       # Format code
```

### Production
```bash
npm run build        # Build for production
npm run serve        # Serve production build locally
```

## 📈 Performance Optimization

### Frontend
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Critical CSS

### Backend
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching strategy
- [ ] Load balancing
- [ ] CDN integration

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 16+ for Vite
```

#### CORS Issues
```javascript
// Ensure CORS headers are set
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
```

#### Database Connection
```javascript
// Add retry logic
async function connectWithRetry() {
  for (let i = 0; i < 5; i++) {
    try {
      await connect();
      break;
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

## 🎉 Deployment Complete!

Once deployed, your LeakHub instance will be available at:
- **GitHub Pages**: `https://elder-plinius.github.io/LEAKHUB`
- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`

### Next Steps
1. Test all functionality
2. Set up monitoring
3. Configure backups
4. Add custom domain
5. Set up SSL certificate
6. Configure analytics

---

**Happy deploying! 🚀**
