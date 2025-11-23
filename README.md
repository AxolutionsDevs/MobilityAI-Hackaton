<div align="center">

# 🚇 Railway Monitor

**Plataforma AI-Powered para Análisis de Sistemas de Transporte Público**

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-api-documentation) • [About](#-about-the-project)

</div>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [About The Project](#-about-the-project)
  - [Problem Statement](#-problem-statement)
  - [Built With](#-built-with)
- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#-prerequisites)
  - [Installation with Docker](#-installation-with-docker-recommended)
  - [Manual Installation](#-manual-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd MobilityAI-Hackaton/railway-monitor

# 2. Build and run with Docker Compose
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Installation

```bash
# Backend
cd railway-monitor/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (new terminal)
cd railway-monitor/frontend
npm install
npm run dev
```

**That's it!** The application will be running at http://localhost:3000

---

## 📖 About The Project

Railway Monitor is an AI-powered platform that transforms any rail or metro map image into an interactive, dynamic network of stations and lines. The system enriches each station with passenger reports from both official (private) sources and public social feedback, unifying and standardizing these inputs to produce actionable insights through the Passenger Happiness Index (PHI).

### 🎯 Problem Statement

Axolutions' project for Challenge 2 delivers an AI-powered platform that turns any rail or metro map image into an interactive, dynamic network of stations and lines, then enriches each station with passenger reports from both official (private) sources and public social feedback. We unify and standardize these inputs, group them by issue and importance, and visualize them through heat maps and key comment summaries, producing a Passenger Happiness Index (PHI) per station and per line aligned with ÖBB's KPIs. The result is a clear, real-time view of where passengers struggle most and what to improve first—while being hyper-scalable to any railway system worldwide and creating business value by prioritizing investments, reducing recurring complaints, and boosting rider satisfaction and retention.

### 🛠️ Built With

#### Backend
- ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) **Python 3.10+**
- ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) **FastAPI** - Modern web framework
- ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) **PyTorch** - Machine learning framework
- ![EasyOCR](https://img.shields.io/badge/EasyOCR-FF6B6B?style=flat-square) **EasyOCR** - OCR for text detection
- ![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white) **OpenCV** - Image processing
- ![Uvicorn](https://img.shields.io/badge/Uvicorn-05998B?style=flat-square) **Uvicorn** - ASGI server

#### Frontend
- ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) **Next.js 14** - React framework with App Router
- ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) **React 18** - UI library
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) **TypeScript** - Type safety
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) **Tailwind CSS** - Utility-first CSS
- ![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat-square) **Recharts** - Chart library

#### DevOps
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) **Docker** - Containerization
- ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white) **Docker Compose** - Multi-container orchestration

---

## ✨ Features

### 🔍 Automatic Station Detection
- **OCR-Powered**: Upload a metro map image and automatically detect stations using EasyOCR
- **Intelligent Matching**: Fuzzy matching with known station databases
- **Multi-City Support**: Currently supports CDMX and Vienna (easily extensible)

### 📊 Passenger Happiness Index (PHI)
- **Real-time Calculation**: PHI computed per station and per line
- **7 Category Analysis**:
  - 🔒 Security (30%)
  - ⏰ Punctuality (25%)
  - ✨ Cleanliness (15%)
  - 👥 Comfort (10%)
  - 💬 Communication (10%)
  - 🔧 Technical Failures (5%)
  - 🚇 Saturation (5%)
- **Weighted Scoring**: Non-linear penalty system for accurate impact assessment

### 🗺️ Interactive Dashboard
- **Heatmap Visualization**: See problem intensity across stations
- **SVG Importer**: Import metro maps and automatically detect stations
- **City Comparison**: Compare metrics between different cities
- **Trends Analysis**: Temporal trend graphs and analytics
- **Global PHI View**: System-wide overview of passenger satisfaction

### 🌍 Multi-Language & Multi-City
- **Bilingual Support**: CDMX (Spanish/English) and Vienna (German/English)
- **Extensible Architecture**: Easy to add new cities and languages
- **City-Specific Data**: Tailored datasets and configurations per city

### 💬 Sentiment Analysis
- **Automatic Classification**: Positive/Neutral/Negative sentiment detection
- **Live Comment Feed**: Real-time passenger feedback stream
- **Keyword Extraction**: Category-specific keyword analysis

### 📈 Data Visualization
- **Interactive Maps**: Click stations to see detailed information
- **Gauge Charts**: Visual PHI representation
- **Category Breakdowns**: Detailed analysis by issue type
- **Export Capabilities**: JSON export for further analysis

---

## 🏁 Getting Started

### Prerequisites

#### For Docker (Recommended)
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) Docker >= 20.10
- ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white) Docker Compose >= 2.0

#### For Manual Installation
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) Node.js >= 20.x
- ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) Python >= 3.10
- npm or yarn
- pip

### Installation with Docker (Recommended)

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd MobilityAI-Hackaton/railway-monitor
```

#### Step 2: Verify Docker Installation

```bash
docker --version
docker-compose --version
```

#### Step 3: Build and Run

```bash
# Build images and start services
docker-compose up --build
```

**Note**: First build may take several minutes due to PyTorch and other large dependencies.

#### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### Step 5: Verify Everything Works

```bash
# Check container status
docker-compose ps

# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Test backend health
curl http://localhost:8000/health
```

#### Useful Docker Commands

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Run in background
docker-compose up -d

# View real-time logs
docker-compose logs -f
```

### Manual Installation

#### Backend Setup

```bash
# Navigate to backend directory
cd railway-monitor/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install system dependencies (Linux/Mac only)
sudo apt-get update
sudo apt-get install -y libgl1 libglib2.0-0

# Install PyTorch (CPU version)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install Python dependencies
pip install -r requirements.txt

# Run the backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd railway-monitor/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (optional)
npm run build
npm start
```

---

## 💻 Usage

### 1. Access the Dashboard

Open your browser at http://localhost:3000

### 2. Navigate the Dashboard

The dashboard has 5 main tabs:

- **🗺️ Heatmap**: Visualize metro map with problem intensity heatmap
- **📤 Import SVG**: Import SVG maps and detect stations
- **🌍 Comparison**: Compare metrics between cities
- **📈 Trends**: Temporal trend graphs
- **📊 PHI Global**: Global PHI index overview

### 3. Detect Stations from Image

1. Go to **"Import SVG"** tab or use the backend endpoint directly
2. Prepare a PNG image of the metro map
3. File name must contain:
   - `cdmx` or `mexico` for Mexico City
   - `vienna` or `wien` for Vienna
4. Upload the image using the import component or `/detect-stations` endpoint
5. System will process the image and automatically detect stations

### 4. Visualize Data

- **Select a station** on the map to see details
- **Adjust heatmap intensity** with the slider
- **Switch between cities** using the header selector
- **Explore metrics** in the right panel

### 5. Compare Cities

1. Go to **"Comparison"** tab
2. Select cities to compare
3. View differences in PHI, complaints, and categories

---

## 📁 Project Structure

```
MobilityAI-Hackaton/
├── railway-monitor/
│   ├── backend/                    # FastAPI Backend
│   │   ├── main.py                 # API entry point
│   │   ├── Dockerfile              # Backend Docker config
│   │   ├── requirements.txt        # Python dependencies
│   │   ├── models/                 # Pydantic models
│   │   │   ├── station_detection.py
│   │   │   └── railway_incident.py
│   │   └── services/               # Business logic
│   │       ├── metro_matcher.py    # Station matching
│   │       ├── station_coords.py   # Station coordinates
│   │       ├── estacionescdmx.json # CDMX database
│   │       └── estacionesvienna.json # Vienna database
│   │
│   ├── frontend/                   # Next.js Frontend
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── page.tsx            # Main page
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── globals.css         # Global styles
│   │   ├── components/             # React components
│   │   │   ├── MetroMap.tsx        # Interactive map
│   │   │   ├── SVGImporter.tsx     # SVG importer
│   │   │   ├── sections/           # Section components
│   │   │   ├── comparison/         # Comparison components
│   │   │   ├── trends/             # Trend components
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── lib/                    # Utilities and logic
│   │   │   ├── constants.ts        # Constants
│   │   │   ├── utils.ts            # Utility functions
│   │   │   ├── CityContext.tsx     # City/language context
│   │   │   ├── translations.ts     # Translations
│   │   │   └── data/               # Data processing
│   │   │       ├── calculatePHI.ts # PHI calculation
│   │   │       └── processComplaints.ts
│   │   ├── types/                  # TypeScript types
│   │   ├── Dockerfile              # Frontend Docker config
│   │   ├── package.json            # Node.js dependencies
│   │   └── next.config.js          # Next.js config
│   │
│   ├── data-scripts/               # Data processing scripts
│   │   ├── datasets/               # Excel datasets
│   │   ├── process_emails.py      # Email processing
│   │   └── merge_datasets.py      # Dataset merging
│   │
│   └── docker-compose.yml          # Docker orchestration
│
├── convert_data.py                 # Data conversion script
└── README.md                       # This file
```

---

## 🔌 API Documentation

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "backend"
}
```

#### Detect Stations from Image
```http
POST /detect-stations
Content-Type: multipart/form-data
```

**Parameters:**
- `file` (File): PNG image of metro map

**File Name Requirements:**
- Must contain `cdmx` or `mexico` for Mexico City
- Must contain `vienna` or `wien` for Vienna

**Response:**
```json
{
  "success": true,
  "total_lines": 3,
  "total_stations": 45,
  "lines": [
    {
      "id": "CDMX-Línea 1-1234567890",
      "name": "Línea 1",
      "color": "#F54EA2",
      "stations": [
        {
          "id": "node-1",
          "name": "Observatorio",
          "x": 100.5,
          "y": 200.3
        }
      ]
    }
  ],
  "message": "Procesado mapa de CDMX. 45 estaciones identificadas en 3 líneas"
}
```

**Example with cURL:**
```bash
curl -X POST "http://localhost:8000/detect-stations" \
  -F "file=@cdmx.png"
```

**Example with Python:**
```python
import requests

url = "http://localhost:8000/detect-stations"
files = {"file": open("cdmx.png", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🐛 Troubleshooting

### Containers Won't Start

**Solution:**
```bash
# Check if ports 3000 and 8000 are in use
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Linux/Mac:
lsof -i :3000
lsof -i :8000

# If in use, stop processes or change ports in docker-compose.yml
```

### PyTorch Installation Error

**Solution:**
```bash
# Install CPU version first
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### OCR Not Detecting Stations

**Solution:**
- Ensure image is clear and high resolution
- Verify file name contains `cdmx` or `vienna`
- Check backend logs for specific errors

### CORS Errors

**Solution:**
- Verify backend is running on port 8000
- Check CORS configuration in `backend/main.py`
- Ensure URLs in `origins` match your frontend

### Frontend Can't Connect to Backend

**Solution:**
```bash
# Verify both services are running
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test health endpoint
curl http://localhost:8000/health
```

### Slow Docker Build

**Solution:**
- First build is normal to take time (PyTorch download)
- Use `docker-compose build --no-cache` only if needed
- Consider using pre-built base image with PyTorch

---

## 🗺️ Roadmap

- [ ] Real-time API integration for comments
- [ ] Advanced NLP analysis with ML models
- [ ] Interactive maps with Mapbox/Leaflet
- [ ] Real-time alert system
- [ ] Admin dashboard
- [ ] User authentication and roles
- [ ] PDF report export
- [ ] Support for more cities
- [ ] GPU optimization for performance
- [ ] Mobile app support

See the [open issues](https://github.com/your_username/repo_name/issues) for a full list of proposed features (and known issues).

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Axolutions Team** - Developed for MobilityAI Hackathon 2025

Project Link: [https://github.com/your_username/repo_name](https://github.com/your_username/repo_name)

---

## 🙏 Acknowledgments

- [Best README Template](https://github.com/othneildrew/Best-README-Template) - Template inspiration
- [EasyOCR](https://github.com/JaidedAI/EasyOCR) - OCR library
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

<div align="center">

**[⬆ Back to Top](#-railway-monitor)**

Made with ❤️ for the MobilityAI Hackathon 2025

</div>
