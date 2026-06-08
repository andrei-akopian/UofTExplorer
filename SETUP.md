# Setup Guide

## 1. Clone the repository

```bash
git clone https://github.com/andrei-akopian/UofTExplorer.git
cd UofTExplorer
```

## 2. Install dependencies

Install Node dependencies in both the project root and frontend:

```bash
npm install
cd frontend
npm install
cd ..
```

Install Python dependencies:

```bash
python -m pip install -r requirements.txt
```

## 3. Install VS Code extensions

Install the recommended extensions from `.vscode/extensions.json` for automatic code formatting.

## 4. Run locally

Start backend (Flask):

```bash
python -m server.server
```

Start frontend (Vite):

```bash
cd frontend
npm run dev
```
