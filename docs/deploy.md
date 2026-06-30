⬅️ [Back to Documentation Homepage](README.md)

---

# Deployment Guide

## Docker Build

Install [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/) or (macOS only) [Orbstack](https://orbstack.dev/). These have Docker backends (also UIs), but we will mostly use CLI.

Make sure your scrapes are up to date. The server won't automatically update them.

### Unix

Start the Docker daemon (start the docker app in the background). Then:

```sh
make docker-full
```

or

```sh
make docker-minimal
```

should build everything automatically. The resulting image should appear under Images in the Docker app.

### Windows

TODO: add Windows build instructions. Same thing as Unix probably.

## Zip Build

You can create a minimal ~3MB package with a compiled React frontend and just the Python files necessary to run the server + minimal Python dependencies. This is useful for running small servers.

### Unix

`make zip` will create a `.zip` file.

Then copy the zip over to a Unix machine, and run:

```bash
unzip zip_build.zip
cd zip_build
sh start.sh
```

This should install the minimal `flask` and `z3-solver` dependencies, and start the server.

## Production

```bash
pip3 install gunicorn
```

```bash
gunicorn -w 4 server.server:app
```

### Fly.io

Note: requires setting up certificates, logging in, etc.

```bash
fly deploy -c deploy_configs/fly.toml
```
