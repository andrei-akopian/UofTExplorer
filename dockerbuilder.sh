cd frontend
npm install
npm run build
cd ..
docker build -f MinimalDockerfile -t uoftexplorer .
echo "docker run -p 5000:5000 uoftexplroer"