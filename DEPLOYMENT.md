# Deployment Guide

This guide covers different deployment options for the Doctor Management Healthcare Platform.

## Prerequisites

- Docker and Docker Compose
- Git
- Domain name (for production)
- SSL certificates (for production HTTPS)

## Environment Configuration

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-hospital-management-system
```

### 2. Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/hospital_db

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
APP_NAME=Doctor Management Healthcare Platform
VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production

# CORS Configuration
ALLOWED_ORIGINS=["https://yourdomain.com"]

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI Model Configuration
MODEL_PATH=./backend/app/ml/models
TRAINING_DATA_PATH=./backend/app/ml/data

# Production Database Variables
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_DATABASE=hospital_db
MYSQL_USER=hospital_user
MYSQL_PASSWORD=your-mysql-user-password
```

## Deployment Options

### Option 1: Development Environment

#### Using Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Initialize database
docker-compose -f docker-compose.dev.yml exec backend python scripts/init_db.py
docker-compose -f docker-compose.dev.yml exec backend python scripts/seed_data.py

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### Manual Setup

1. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm start
```

3. **Database Setup**:
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE hospital_db;
CREATE USER 'hospital_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON hospital_db.* TO 'hospital_user'@'localhost';
FLUSH PRIVILEGES;
```

### Option 2: Production Deployment

#### Using Docker Compose (Recommended)

1. **Prepare Environment**:
```bash
# Create production environment file
cp .env.example .env
# Edit .env with your production values
```

2. **Deploy Services**:
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Initialize database
docker-compose -f docker-compose.prod.yml exec backend python scripts/init_db.py
docker-compose -f docker-compose.prod.yml exec backend python scripts/seed_data.py
```

3. **Configure SSL** (Optional but recommended):
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Add your SSL certificates
# nginx/ssl/cert.pem
# nginx/ssl/key.pem
```

4. **Update Nginx Configuration**:
Edit `nginx/nginx.conf` to add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # ... rest of your configuration
}
```

### Option 3: Cloud Deployment

#### Railway (Recommended for Easy Deployment)

1. **Backend Deployment**:
   - Connect your GitHub repository to Railway
   - Add `RAILWAY_ENVIRONMENT` variables
   - Set `DATABASE_URL` to Railway's MySQL
   - Deploy the `backend` directory

2. **Frontend Deployment**:
   - Connect your GitHub repository to Vercel/Netlify
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/build`
   - Set environment variable: `REACT_APP_API_URL`

#### AWS ECS

1. **Create ECR Repository**:
```bash
aws ecr create-repository --repository-name hospital-management --region us-west-2
```

2. **Build and Push Images**:
```bash
# Backend
docker build -t hospital-management-backend ./backend
docker tag hospital-management-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/hospital-management-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/hospital-management-backend:latest

# Frontend
docker build -t hospital-management-frontend ./frontend
docker tag hospital-management-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/hospital-management-frontend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/hospital-management-frontend:latest
```

3. **Deploy to ECS**:
- Create ECS cluster
- Define task definitions
- Create services
- Set up Application Load Balancer

#### DigitalOcean App Platform

1. **Create Components**:
   - Database: MySQL
   - Backend: Docker service
   - Frontend: Static site

2. **Configure Environment Variables**
3. **Deploy** using the control panel

## Post-Deployment Checklist

### 1. Database Setup
- [ ] Database is initialized
- [ ] Seed data is loaded
- [ ] Database backups are configured
- [ ] Connection strings are updated

### 2. Backend Configuration
- [ ] All environment variables are set
- [ ] Secret keys are secure
- [ ] CORS is properly configured
- [ ] Health checks are passing

### 3. Frontend Configuration
- [ ] API URL is correctly set
- [ ] Build is successful
- [ ] Routing is working
- [ ] Authentication is functional

### 4. SSL/HTTPS
- [ ] SSL certificates are installed
- [ ] HTTP redirects to HTTPS
- [ ] Security headers are configured

### 5. Testing
- [ ] Test authentication flow
- [ ] Test user registration
- [ ] Test appointment booking
- [ ] Test AI recommendations
- [ ] Test admin dashboard

### 6. Monitoring
- [ ] Application health checks
- [ ] Database connection monitoring
- [ ] Error logging
- [ ] Performance monitoring

## Environment-Specific Configurations

### Development
- Debug mode enabled
- Detailed error messages
- Hot reload enabled
- Local database
- Mock data for testing

### Production
- Debug mode disabled
- Error messages minimized
- Optimized builds
- Production database
- SSL/HTTPS enforced
- Security headers configured
- Rate limiting enabled

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify database is running
   - Check connection string
   - Ensure user permissions

2. **CORS Issues**:
   - Verify `ALLOWED_ORIGINS` configuration
   - Check API URL in frontend
   - Ensure backend is accessible

3. **Authentication Issues**:
   - Verify JWT secret keys
   - Check token expiration
   - Verify user roles and permissions

4. **Build Errors**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript configuration

### Log Locations

- **Docker**: `docker-compose logs -f <service-name>`
- **Nginx**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
- **Application**: Check service logs in your cloud provider

## Scaling Considerations

### Database Scaling
- Use managed database services (AWS RDS, Google Cloud SQL)
- Implement read replicas
- Optimize queries
- Use connection pooling

### Application Scaling
- Use load balancers
- Implement horizontal scaling
- Use container orchestration (Kubernetes)
- Implement caching (Redis)

### CDN and Static Assets
- Use CDN for static assets
- Implement caching strategies
- Optimize image and file sizes
- Use HTTP/2

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor security vulnerabilities
- Database backups
- Log rotation
- SSL certificate renewal

### Updates
- Plan for zero-downtime deployments
- Use blue-green or canary deployments
- Test in staging environment
- Rollback plan ready

## Support

For deployment issues:

1. Check the logs for error messages
2. Verify all configuration files
3. Ensure all required services are running
4. Check network connectivity
5. Review documentation for specific services

For additional support, create an issue in the repository with:
- Environment details
- Error messages
- Configuration files
- Steps taken