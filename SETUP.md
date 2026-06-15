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

---

## Docker Build

Install [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/) or (macos only) [Orbstack](https://orbstack.dev/). These have docker backends (also UIs), but we will mostly use CLI.

Make sure your scrapes are up to date. The server won't automatically update them.

### Unix
Start the docker deamon. (start the docker app in the background.) Then.

```sh
make docker-full
```

or 

```sh
make docker-minimal
```

should build everything automatically. The resulting image should appear under Images in the Docker app.

### Windows

TODO add windows build instructions. Same thing as unix probably.

## Zip Build

You can create a minimal ~3MB package with compiled react frontend and just the python files necessary to run the server + minimal python dependencies. This is useful for running small servers.

### Unix

`make zip_build` will create a `.zip` file

then copy the zip over to a unix machine, and run

```bash
unzip zip_build.zip
cd zip_build
sh start.sh
```

this should install the minimal flask and z3-solver dependencies, and start the server.