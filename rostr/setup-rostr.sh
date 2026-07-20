#!/bin/bash
# ROSTR Agent Installer
# Download, setup, and configure ROSTR locally or in the cloud
# Supports: macOS, Linux, Termux (Android)
# Requires: Python 3.11+

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ROSTR Agent v1.0.0 Installer             ║${NC}"
echo -e "${BLUE}║  Self-Improving Multi-Agent Framework      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Detect environment
if [[ "$OSTYPE" == "linux-android" ]]; then
  IS_TERMUX=true
  BIN_PATH="${PREFIX}/bin"
  PKG_MANAGER="pkg"
  echo -e "${GREEN}✓${NC} Detected: Termux (Android)"
else
  IS_TERMUX=false
  BIN_PATH="$HOME/.local/bin"
  echo -e "${GREEN}✓${NC} Detected: $(uname -s)"
fi

# Ensure bin path exists
mkdir -p "$BIN_PATH"
export PATH="$BIN_PATH:$PATH"

echo ""
echo -e "${BLUE}Step 1: Install UV (Python package manager)${NC}"

if command -v uv &> /dev/null; then
  echo -e "${GREEN}✓${NC} UV already installed: $(uv --version)"
else
  if [[ "$IS_TERMUX" == true ]]; then
    echo "Installing UV via pkg..."
    pkg install -y python-pip
    pip install uv
  else
    echo "Installing UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source "$HOME/.cargo/env" 2>/dev/null || true
  fi
  echo -e "${GREEN}✓${NC} UV installed: $(uv --version)"
fi

echo ""
echo -e "${BLUE}Step 2: Provision Python 3.11+${NC}"

if [[ "$IS_TERMUX" == true ]]; then
  echo "Using system Python in Termux..."
  PYTHON_CMD="python"
  if ! command -v python &> /dev/null; then
    pkg install -y python
  fi
else
  if uv python list 2>/dev/null | grep -q "3.1[1-3]"; then
    echo -e "${GREEN}✓${NC} Python 3.11+ already available"
  else
    echo "Installing Python 3.11..."
    uv python install 3.11
  fi
  PYTHON_CMD="$(uv python find 3.11 2>/dev/null || which python3.11 || which python3)"
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓${NC} Using Python $PYTHON_VERSION"

echo ""
echo -e "${BLUE}Step 3: Clone and setup ROSTR Agent${NC}"

if [ ! -d "rostr-agent" ]; then
  echo "Cloning repository..."
  git clone https://github.com/diamitani/rostr-agent.git
  cd rostr-agent
else
  cd rostr-agent
  git pull
  echo -e "${GREEN}✓${NC} Repository updated"
fi

echo -e "${GREEN}✓${NC} In: $(pwd)"

echo ""
echo -e "${BLUE}Step 4: Create virtual environment${NC}"

if [[ "$IS_TERMUX" == true ]]; then
  echo "Creating venv in Termux..."
  $PYTHON_CMD -m venv .venv
else
  echo "Creating venv with UV..."
  uv venv
fi

source .venv/bin/activate
echo -e "${GREEN}✓${NC} Virtual environment activated"

echo ""
echo -e "${BLUE}Step 5: Install dependencies${NC}"

if [[ "$IS_TERMUX" == true ]]; then
  pip install --upgrade pip
  pip install -e .
else
  uv pip install -e .
fi

echo -e "${GREEN}✓${NC} Dependencies installed"

echo ""
echo -e "${BLUE}Step 6: Configure environment${NC}"

if [ ! -f ".env" ]; then
  echo "Creating .env from template..."
  cat > .env << 'EOF'
# ROSTR Agent Configuration
# Get API keys from your provider

# Anthropic
ANTHROPIC_API_KEY=

# OpenAI (optional)
OPENAI_API_KEY=

# OpenRouter (optional)
OPENROUTER_API_KEY=

# Google Gemini (optional)
GOOGLE_API_KEY=

# Groq (optional)
GROQ_API_KEY=

# Ollama (for local models)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_API_KEY=

# Speech/Audio
ELEVENLABS_API_KEY=

# Web/Search APIs
EXA_API_KEY=
FIRECRAWL_API_KEY=

# Deployment
ROSTR_MODE=local
ROSTR_LOG_LEVEL=info
EOF
  echo -e "${YELLOW}⚠${NC} Created .env — add your API keys"
  echo -e "${YELLOW}⚠${NC} Never commit .env to git — it's in .gitignore"
else
  echo -e "${GREEN}✓${NC} .env already exists"
fi

echo ""
echo -e "${BLUE}Step 7: Create CLI symlinks${NC}"

# Create wrapper script
mkdir -p "$BIN_PATH"
cat > "$BIN_PATH/rostr-agent" << 'EOF'
#!/bin/bash
cd "$(python -c 'import rostr_agent; print(rostr_agent.__file__.rsplit("/", 1)[0])')"/../..
source .venv/bin/activate
python -m rostr_agent.cli "$@"
EOF

chmod +x "$BIN_PATH/rostr-agent"

# Create hermes alias
cat > "$BIN_PATH/hermes" << 'EOF'
#!/bin/bash
rostr-agent "$@"
EOF

chmod +x "$BIN_PATH/hermes"

echo -e "${GREEN}✓${NC} CLI commands available:"
echo "    rostr-agent"
echo "    hermes"

echo ""
echo -e "${BLUE}Step 8: Verify installation${NC}"

if rostr-agent --version &> /dev/null; then
  echo -e "${GREEN}✓${NC} Installation verified"
else
  echo -e "${YELLOW}⚠${NC} Manual test: source .venv/bin/activate && python -m rostr_agent.cli --version"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Installation complete!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Add API keys to .env:"
echo "     nano .env"
echo ""
echo "  2. Test the CLI:"
echo "     rostr-agent"
echo ""
echo "  3. Run PAL compiler:"
echo "     hermes pal compile 'build a REST API'"
echo ""
echo "  4. Classify with NPAO:"
echo "     hermes npao classify 'the login page is broken'"
echo ""
echo "  5. Search with RAG DAL:"
echo "     hermes ragdal search 'best practices for rate limiting'"
echo ""
echo "  6. Run full pipeline:"
echo "     hermes pipeline execute 'research TypeScript vs Rust for CLI tools'"
echo ""
echo "  7. Check workspace:"
echo "     hermes hub list"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  https://github.com/diamitani/rostr-agent"
echo "  https://zenodo.org/records/19550414"
echo ""
echo -e "${GREEN}✨ Welcome to ROSTR Agent!${NC}"
echo ""
