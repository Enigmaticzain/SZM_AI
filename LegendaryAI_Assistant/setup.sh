#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║    LEGENDARY AI - Offline Agentic System Setup            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt
pip install -q psutil

# Check Ollama
echo ""
echo "Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "✓ Ollama found"
    echo ""
    echo "To start Ollama server, run:"
    echo "  ollama serve"
    echo ""
    echo "To pull a model, run:"
    echo "  ollama pull mistral"
else
    echo "⚠ Ollama not found. Install from: https://ollama.ai"
    echo ""
    echo "After installing Ollama:"
    echo "  1. Run: ollama serve"
    echo "  2. In another terminal: ollama pull mistral"
fi

echo ""
echo "✓ Setup complete!"
echo ""
echo "To start Legendary AI:"
echo "  source venv/bin/activate"
echo "  python gui/cli.py"
echo ""
echo "Or run a task directly:"
echo "  python gui/cli.py 'your task here'"
