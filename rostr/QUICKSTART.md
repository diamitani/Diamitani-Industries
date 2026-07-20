# ROSTR Agent — One-Click Quickstart

**Get Hermes + ROSTR + gstack + context-engine running in 5 minutes.**

Choose your deployment method:

---

## Option 1: Docker Compose (Recommended)

Includes Hermes, ROSTR, Ollama (local LLM), PostgreSQL, Redis, Minio, Prometheus, Grafana.

### Prerequisites
- Docker & Docker Compose
- 8GB RAM minimum
- 20GB disk space

### Start

```bash
# Clone
git clone https://github.com/diamitani/rostr-agent.git
cd rostr-agent/rostr

# Configure
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (or leave empty to use local Ollama only)

# Launch
docker-compose up -d

# Verify
docker-compose ps

# View logs
docker-compose logs -f api

# Pull models into Ollama (runs in background)
docker exec rostr_ollama ollama pull qwen2.5-coder:14b
```

### Access

- **Web UI:** http://localhost:3000
- **API:** http://localhost:3000/api/
- **Ollama:** http://localhost:11434
- **Grafana:** http://localhost:3001 (admin/admin)
- **Minio console:** http://localhost:9001 (minioadmin/minioadmin)
- **PostgreSQL:** localhost:5432 (rostr/rostr-dev-password)
- **Redis:** localhost:6379

### Stop

```bash
docker-compose down
# Keep data: docker-compose down  (volumes persist)
# Clean slate: docker-compose down -v  (wipe volumes)
```

---

## Option 2: Local Installation (Development)

Install on your machine directly. Works on macOS, Linux, Windows (WSL2).

### Prerequisites
- Python 3.11+
- Node 20+
- Git
- 4GB RAM

### Install

```bash
# Clone
git clone https://github.com/diamitani/rostr-agent.git
cd rostr-agent

# Run installer
./setup-rostr.sh

# Start API server (in another terminal)
cd rostr
npm install
npm run dev

# In another terminal: Start Ollama
ollama serve
```

### CLI Usage

```bash
# Test the CLI
rostr-agent

# Or use directly
hermes pal compile "build a landing page"
hermes npao classify "the login page is broken"
hermes ragdal search "best practices for API rate limiting"
hermes pipeline execute "research TypeScript vs Rust for CLI tools"
hermes hub list
```

---

## Option 3: AWS Cloud Deployment

Deploy to AWS with Terraform. Creates Lambda, DynamoDB, S3, RDS, Cognito.

### Prerequisites
- AWS account
- Terraform
- AWS CLI configured

### Deploy

```bash
cd rostr

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Deploy (takes ~10 minutes)
terraform apply

# Get outputs
terraform output
```

### Access

```bash
# Get API endpoint from Terraform output
API_ENDPOINT=$(terraform output -raw api_endpoint)

# Sign up
curl -X POST $API_ENDPOINT/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyPassword123!","name":"User"}'

# Use token in subsequent requests
TOKEN="..."
curl -X POST $API_ENDPOINT/api/pal/compile \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"input":"build a landing page"}'
```

---

## Option 4: Bring Your Own Hermes Instance

Run ROSTR on top of an existing Hermes Agent setup.

### Prerequisites
- Existing Hermes Agent installation
- Python 3.11+

### Setup

```bash
# Clone ROSTR into your Hermes directory
cd /path/to/hermes-agent
git clone https://github.com/diamitani/rostr-agent.git rostr

# Install ROSTR components
pip install -e rostr/

# The ROSTR layer is now available
hermes pal compile "your prompt"
```

---

## Configuration

### Environment Variables

Create `.env`:

```bash
# LLM Provider
ANTHROPIC_API_KEY=sk-ant-...              # For Claude (default)
OPENAI_API_KEY=sk-...                     # For GPT-4
OLLAMA_BASE_URL=http://localhost:11434   # For local models (default)

# Storage
DATABASE_URL=sqlite:///~/.rostr/hub.db    # Local SQLite (default)
# DATABASE_URL=postgresql://...           # PostgreSQL (production)

# Auth
JWT_SECRET=your-secret-key-here

# AWS (if using cloud)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Features
ROSTR_MODE=local                          # local | cloud
ROSTR_LOG_LEVEL=info                      # debug | info | warn | error
ENABLE_TELEMETRY=false                    # Disable sends zero data

# Workspace
ROSTR_WORKSPACE_DIR=~/.rostr              # Where local state lives
MAX_TOKENS_PER_REQUEST=100000
MAX_REQUESTS_PER_DAY=10000
```

---

## First Steps

### 1. Test PAL

```bash
curl -X POST http://localhost:3000/api/pal/compile \
  -H "Content-Type: application/json" \
  -d '{"input":"Build a FastAPI backend for a notes app"}'
```

Expected response:
```json
{
  "domain": "CODE",
  "phase": 2,
  "priority": 6.2,
  "model": "claude-sonnet-4-6",
  "queue": "QUEUED"
}
```

### 2. Test NPAO

```bash
curl -X POST http://localhost:3000/api/npao/classify \
  -H "Content-Type: application/json" \
  -d '{"input":"The payment processing webhook is failing"}'
```

### 3. Test Full Pipeline

```bash
curl -X POST http://localhost:3000/api/pipeline/execute \
  -H "Content-Type: application/json" \
  -d '{"input":"Research the best approach to rate limiting in production APIs"}'
```

### 4. Check Your Workspace

```bash
curl http://localhost:3000/api/workspace/state
```

---

## Troubleshooting

### API not starting

```bash
# Check Docker logs
docker-compose logs api

# Restart
docker-compose restart api

# Full reset
docker-compose down -v && docker-compose up -d
```

### Out of memory

Increase Docker memory:
```bash
# Set in Docker Desktop settings or:
export DOCKER_MEMORY=8g
docker-compose up -d
```

### Ollama models not found

```bash
# List available models
docker exec rostr_ollama ollama list

# Pull a model
docker exec rostr_ollama ollama pull qwen2.5-coder:14b

# Set as default in .env
OLLAMA_MODEL=qwen2.5-coder:14b
```

### Database error

```bash
# Reset PostgreSQL
docker-compose down postgres
docker volume rm rostr_postgres-data
docker-compose up postgres -d
```

---

## Next Steps

1. **Explore the web app:** http://localhost:3000
2. **Read the API docs:** Swagger UI at `/api/docs`
3. **Configure your provider:** Edit `.env` and add your API keys
4. **Try a full pipeline:** `hermes pipeline execute "your complex request"`
5. **Check workspace state:** `hermes hub list`
6. **Export your workspace:** `hermes hub export`

---

## Production Deployment

### Before going live

- [ ] Change all default passwords (`JWT_SECRET`, PostgreSQL, Minio, Grafana)
- [ ] Enable SSL/TLS
- [ ] Set up backups for PostgreSQL and Minio
- [ ] Configure proper logging and monitoring
- [ ] Run security audit (`ROSTR_AUDIT_MODE=true`)
- [ ] Load test the API

### Recommended stack

- **Frontend:** Vercel (Next.js)
- **API:** AWS Lambda + API Gateway
- **Database:** RDS PostgreSQL
- **Cache:** ElastiCache Redis
- **Storage:** S3
- **Monitoring:** CloudWatch + Grafana
- **CI/CD:** GitHub Actions

---

## Support

- **Docs:** https://github.com/diamitani/rostr-agent
- **Issues:** https://github.com/diamitani/rostr-agent/issues
- **Paper:** https://zenodo.org/records/19550414

---

**Happy building! 🚀**
