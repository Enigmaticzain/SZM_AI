#!/bin/bash

echo "🚀 SZM AI Assistant - Unsloth Setup Script"
echo "=========================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found"

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    exit 1
fi

echo "✅ pip3 found"

# Check CUDA availability
if command -v nvidia-smi &> /dev/null; then
    echo "✅ NVIDIA GPU detected"
    CUDA_AVAILABLE=true
else
    echo "⚠️  No NVIDIA GPU detected. CPU-only training will be slower."
    CUDA_AVAILABLE=false
fi

echo ""
echo "📦 Installing required packages..."

# Install basic requirements
pip3 install fastapi uvicorn pydantic

echo "✅ FastAPI and dependencies installed"

# Install PyTorch (CUDA or CPU version)
if [ "$CUDA_AVAILABLE" = true ]; then
    echo "🔥 Installing PyTorch with CUDA support..."
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
else
    echo "💻 Installing PyTorch CPU version..."
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
fi

echo "✅ PyTorch installed"

# Install Unsloth and dependencies
echo "⚡ Installing Unsloth..."
pip3 install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"

echo "📚 Installing additional ML libraries..."
pip3 install --no-deps trl peft accelerate bitsandbytes transformers datasets

echo "✅ Unsloth and ML libraries installed"

# Install additional utilities
pip3 install requests numpy pandas

echo ""
echo "🧪 Testing installation..."

# Test imports
python3 -c "
try:
    import torch
    print('✅ PyTorch imported successfully')
    print(f'   CUDA available: {torch.cuda.is_available()}')
    if torch.cuda.is_available():
        print(f'   GPU count: {torch.cuda.device_count()}')
        print(f'   Current device: {torch.cuda.get_device_name()}')
except ImportError as e:
    print(f'❌ PyTorch import failed: {e}')

try:
    from unsloth import FastLanguageModel
    print('✅ Unsloth imported successfully')
except ImportError as e:
    print(f'❌ Unsloth import failed: {e}')

try:
    import fastapi
    print('✅ FastAPI imported successfully')
except ImportError as e:
    print(f'❌ FastAPI import failed: {e}')
"

echo ""
echo "🎯 Setup Summary:"
echo "=================="
echo "✅ FastAPI server for training API"
echo "✅ PyTorch for deep learning"
echo "✅ Unsloth for efficient fine-tuning"
echo "✅ Supporting ML libraries"

if [ "$CUDA_AVAILABLE" = true ]; then
    echo "🔥 GPU acceleration enabled"
else
    echo "💻 CPU-only mode (slower training)"
fi

echo ""
echo "🚀 Ready to start training!"
echo ""
echo "To start the Unsloth server:"
echo "  cd LegendaryAI_Assistant"
echo "  python3 unsloth_server.py"
echo ""
echo "Then use the SZM AI Assistant web interface to:"
echo "  1. Go to Train tab → Unsloth Training"
echo "  2. Configure your training parameters"
echo "  3. Start fine-tuning your models!"
echo ""
echo "📖 For more information, see:"
echo "  - Unsloth docs: https://github.com/unslothai/unsloth"
echo "  - SZM AI Assistant: FEATURES_IMPLEMENTED.md"

chmod +x "$0"