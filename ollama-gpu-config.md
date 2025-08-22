# Ollama GPU Konfiguraatio

Tämä opas auttaa konfiguroimaan Ollaman käyttämään GPU:ta suorituskyvyn parantamiseksi.

## 1. NVIDIA GPU (CUDA)

### Asennus Windows:lla

1. **Lataa CUDA Toolkit:**
   - Mene: [NVIDIA CUDA Downloads](https://developer.nvidia.com/cuda-downloads)
   - Valitse Windows ja CUDA versio
   - Asenna CUDA Toolkit

2. **Tarkista asennus:**

   ```bash
   nvidia-smi
   ```

3. **Ollama käyttää GPU:ta automaattisesti**

### Asennus Linux:lla

```bash
# Ubuntu/Debian
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get install cuda

# Tarkista asennus
nvidia-smi
```

## 2. AMD GPU (ROCm)

### Ubuntu/Debian

```bash
# Lisää ROCm repository
sudo mkdir --parents --mode=0755 /etc/apt/keyrings
curl -fsSL https://repo.radeon.com/rocm/rocm.gpg.key | sudo gpg --dearmor | \
  sudo tee /etc/apt/keyrings/rocm.gpg > /dev/null

echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/rocm.gpg] \
  https://repo.radeon.com/rocm/apt/debian jammy main' | \
  sudo tee /etc/apt/sources.list.d/rocm.list

# Asenna ROCm
sudo apt update
sudo apt install rocm-hip-sdk

# Käynnistä Ollama ROCm:llä
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

## 3. Apple Silicon (M1/M2/M3)

Ei erillistä konfiguraatiota tarvita - Metal Performance Shaders toimii automaattisesti.

## 4. Ollama Konfiguraatio

### Perus Konfiguraatio

Luo `~/.ollama/config.json`:

```json
{
  "host": "127.0.0.1:11434",
  "gpu_layers": 50,
  "models": {
    "llama3.2": {
      "temperature": 0.7,
      "top_p": 0.9,
      "gpu_layers": 50
    }
  }
}
```

### GPU Layer Konfiguraatio

`gpu_layers` määrittää kuinka monta mallin kerrosta ajetaan GPU:lla:

- **0**: CPU only
- **1-50**: GPU + CPU hybrid
- **Kaikki kerrokset**: Täysi GPU käyttö

```bash
# Käynnistä malli GPU:lla
ollama run llama3.2 --gpu-layers 50

# Tai konfiguraatiossa
echo '{"gpu_layers": 50}' > ~/.ollama/config.json
```

## 5. Suorituskyvyn Optimointi

### Mallin Koko vs GPU Muisti

| Malli        | GPU Muisti | Suorituskyky        |
| ------------ | ---------- | ------------------- |
| llama3.2:3b  | 2-4GB      | Hyvä                |
| llama3.2     | 6-8GB      | Hyvä                |
| llama3.2:70b | 40GB+      | Vaatii suuren GPU:n |

### Optimointi Vinkkejä

1. **GPU Muisti:**

   ```bash
   # Tarkista GPU muisti
   nvidia-smi

   # Jos GPU muisti ei riitä, vähennä gpu_layers
   ollama run llama3.2 --gpu-layers 20
   ```

2. **Batch Size:**

   ```bash
   # Suurempi batch size GPU:lla
   ollama run llama3.2 --batch-size 512
   ```

3. **Context Length:**

   ```bash
   # Lyhyempi context säästää muistia
   ollama run llama3.2 --context-length 2048
   ```

## 6. Ongelmatilanteet

### GPU Muisti Loppuu

```bash
# Vähennä GPU kerroksia
ollama run llama3.2 --gpu-layers 10

# Tai käytä CPU:ta
ollama run llama3.2 --gpu-layers 0
```

### CUDA Virhe

```bash
# Tarkista CUDA asennus
nvcc --version

# Päivitä CUDA drivers
# Lataa uusimmat drivers NVIDIA sivustolta
```

### ROCm Virhe

```bash
# Tarkista ROCm asennus
rocm-smi

# Käynnistä uudelleen
sudo systemctl restart rocm
```

## 7. Suorituskyvyn Testaus

```bash
# Testaa GPU käyttöä
ollama run llama3.2 "Kirjoita pitkä tarina" --gpu-layers 50

# Tarkista GPU käyttö
nvidia-smi  # NVIDIA
rocm-smi    # AMD
```

## 8. Ympäristömuuttujat

```bash
# GPU layer määrä
export OLLAMA_GPU_LAYERS=50

# GPU muisti raja
export OLLAMA_GPU_MEMORY=8192

# Käynnistä Ollama
ollama serve
```

## 9. Docker GPU Tuki

Jos käytät Dockeria:

```bash
# NVIDIA Docker
docker run --gpus all -p 11434:11434 ollama/ollama

# AMD Docker
docker run --device=/dev/kfd --device=/dev/dri -p 11434:11434 ollama/ollama
```

## 10. Suositukset

### NVIDIA GPU:lle

- **RTX 3060+**: Hyvä suorituskyky
- **RTX 4070+**: Erinomainen suorituskyky
- **RTX 4090**: Paras suorituskyky

### AMD GPU:lle

- **RX 6700 XT+**: Hyvä suorituskyky
- **RX 7900 XT+**: Erinomainen suorituskyky

### Apple Silicon

- **M1 Pro/Max**: Hyvä suorituskyky
- **M2/M3 Ultra**: Erinomainen suorituskyky
