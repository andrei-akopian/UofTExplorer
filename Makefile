.PHONY: clear_zip frontend

default:
	echo "Please enter subcommand on what to make."

docker-full:
	docker build --platform linux/amd64 -f Dockerfile -t uoftexplorer
	echo "run using: docker run -p 5000:5000 uoftexplorer:full"
	echo "publish using"
	echo "docker tag uoftexplorer ghcr.io/andrei-akopian/uoftexplorer:full"
	echo "docker push ghcr.io/andrei-akopian/uoftexplorer:full"

docker-minimal: frontend
	docker build --platform linux/amd64 -f MinimalDockerfile -t uoftexplorer
	echo "run using: docker run -p 5000:5000 uoftexplorer:minimal"
	echo "publish using"
	echo "docker tag uoftexplorer ghcr.io/andrei-akopian/uoftexplorer:minimal"
	echo "docker push ghcr.io/andrei-akopian/uoftexplorer:minimal"

zip_build: clear_zip frontend
	cp minimal_requirements.txt zip_build/minimal_requirements.txt 
	cp start.sh zip_build/start.sh
	cp -r data zip_build/data
	cp -r core zip_build/core
	cp -r server zip_build/server
	mkdir zip_build/frontend
	cp -r frontend/dist zip_build/frontend/dist
	cp __main__.py zip_build/__main__.py
	cp __init__.py zip_build/__init__.py
	zip -r zip_build.zip zip_build/
	echo "Run start.sh wherever you are deploying."

clear_zip:
	mkdir -p zip_build
	touch zip_build/dummy.txt
	rm -r zip_build
	mkdir -p zip_build
	rm -f zip_build.zip

frontend: frontend/src
	cd frontend && npm install
	cd frontend && npm run build