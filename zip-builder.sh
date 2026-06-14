cd frontend
npm install
npm run build
cd ..
# replica of the minimal docker script, except zip
mkdir -p zip_build
touch zip_build/dummy.txt
# to make the clean rm work
rm -r zip_build
mkdir -p zip_build
# now with a clean directory
cp minimal_requirements.txt zip_build/minimal_requirements.txt 
cp start.sh zip_build/start.sh
cp -r data zip_build/data
cp -r core zip_build/core
mkdir zip_build/frontend
cp -r frontend/dist zip_build/frontend/dist
cp __main__.py zip_build/__main__.py
cp __init__.py zip_build/__init__.py
zip -r zip_build.zip zip_build/

echo "Run start.sh wherever you are deploying."