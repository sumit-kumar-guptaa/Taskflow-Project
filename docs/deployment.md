# TaskFlow — Deployment Guide

## Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+
- Supabase account (free tier works)

---

## 1. Supabase Database Setup

1. Go to [app.supabase.com](https://app.supabase.com) → New Project
2. Choose region closest to you, set a strong DB password
3. Once created: **Settings → Database → Connection string → URI**
   - Looks like: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
4. Open **SQL Editor** → paste contents of `docs/schema.sql` → Run

---

## 2. Backend Setup

### Local Development
```bash
cd backend

# Export environment variables (or create .env)
export DB_URL="jdbc:postgresql://db.YOUR_REF.supabase.co:5432/postgres"
export DB_USERNAME="postgres"
export DB_PASSWORD="your-db-password"
export JWT_SECRET="minimum-256-bit-secret-key-change-this-value-now"

mvn spring-boot:run
```

### Production Build
```bash
mvn clean package -DskipTests
java -jar target/taskflow-backend-1.0.0.jar
```

### Environment Variables Reference
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_URL` | ✅ | — | Supabase JDBC URL |
| `DB_USERNAME` | ✅ | — | postgres |
| `DB_PASSWORD` | ✅ | — | Your DB password |
| `JWT_SECRET` | ✅ | — | 256-bit secret key |
| `JWT_EXPIRATION` | ❌ | 86400000 | Token TTL in ms (24h) |
| `CORS_ORIGINS` | ❌ | localhost:3000 | Allowed frontend origins |
| `UPLOAD_DIR` | ❌ | ./uploads | File upload directory |

---

## 3. Frontend Setup

### Local Development
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### Production Build
```bash
npm run build      # Output in dist/
npm run preview    # Preview production build
```

### Environment Configuration
The frontend uses Vite proxy (see `vite.config.js`) to forward `/api` calls to `localhost:8080` during development. For production, set the correct backend URL in nginx.conf or your hosting platform.

---

## 4. Docker Deployment

### Full Stack with Docker Compose
```bash
# Copy and fill in your values
cp .env.example .env
nano .env

# Build and start
docker-compose -f docker/docker-compose.yml up --build -d

# Check logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop
docker-compose -f docker/docker-compose.yml down
```

---

## 5. Cloud Deployment

### Backend — Railway
1. Connect GitHub repo to Railway
2. Set root directory to `/backend`
3. Add environment variables in Railway dashboard
4. Deploy — Railway auto-detects Maven

### Backend — Render
1. New Web Service → GitHub repo
2. Build: `mvn clean package -DskipTests`
3. Start: `java -jar target/taskflow-backend-1.0.0.jar`
4. Add env vars

### Frontend — Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder
vercel --prod
```

### Frontend — Netlify
```bash
cd frontend
npm run build
# Drag and drop dist/ to Netlify dashboard
# Or: netlify deploy --prod --dir=dist
```

### Important: Update API URL for production
In `frontend/vite.config.js`, the proxy works only in dev. For production, update `nginx.conf` with:
```nginx
location /api {
    proxy_pass http://your-backend-url:8080;
}
```

---

## 6. Security Checklist for Production

- [ ] Change `JWT_SECRET` to a random 256-bit value
- [ ] Set `DB_PASSWORD` to a strong password
- [ ] Restrict `CORS_ORIGINS` to your exact frontend domain
- [ ] Use HTTPS (SSL certificate via Let's Encrypt)
- [ ] Set `spring.jpa.show-sql=false`
- [ ] Disable Swagger in production (or protect it)
- [ ] Enable Supabase Row Level Security (RLS)

---

## 7. Default Admin Credentials
On first startup, an admin account is created automatically:
- **Email:** `admin@taskflow.io`
- **Password:** `admin123`
- **⚠️ Change this immediately in production!**
