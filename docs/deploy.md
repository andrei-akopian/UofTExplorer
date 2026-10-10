⬅️ [Back to Documentation Homepage](README.md)

---

# Deployment Guide

## Docker Build

Install [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/) or (macOS only) [Orbstack](https://orbstack.dev/). These have Docker backends (also UIs), but we will mostly use CLI.

Make sure your scrapes are up to date. The server won't automatically update them.

### Unix

Note: in `Makefile` set `BUILDPLATFORM = linux/amd64` appropriately (or just try around). For example fly.io uses amd64.

Start the Docker daemon (start the docker app in the background). Then:

```sh
make docker-full
```

or

```sh
make docker-minimal
```

should build everything automatically. The resulting image should appear under Images in the Docker app.

### Push to Registery

Now we will publish the container to a registery.

Note: [Fly.io](#flyio) or other host will need to be configured to pull from there.

#### Github's GHCR registery

Create personal access token, if you haven't already or if it expired.

On Github, go to `Settings > Credentials > personal access token (PAT)` in your github settings. "classic" is fine. Ensure you give it `repo` (all), `write:packages`, and `delete:packages` permissions. (These look unnecessary, but I already checked it doesn't work otherwise. The token will look like `ghp_...`, copy it.)

Then log into ghcr.io registery from docker cli:

(Unix): Login using this token via `echo "<token>" | docker login ghcr.io -u <username> --password-stdin` with user username and token.

(Windows): idk figure it out. try `docker login ghcr.io -u <username> --password <token>`

Now tag the newly created container.

`docker tag uoftexplorer ghcr.io/andrei-akopian/uoftexplorer:minimal` (the `ghcr.io` part is confusing, because it isn't actually pushed there yet.)

Then push to registery.

`docker push ghcr.io/andrei-akopian/uoftexplorer:minimal`

Finally, see [Production](#production) on how to make host provider deploy from this config.

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

Install [flyctl](https://fly.io/docs/flyctl/install/).

Log in with flyctl. `fly auth` or something like that.

Set up domain certificates on fly.io via the cli. (google how to do this.)

> [!IMPORTANT]  
> Fly.io uses amd64. Make sure to set `BUILDPLATFORM = linux/amd64` in the `Makefile` when building the container for fly.io.

Check `deploy_configs/fly.toml` that the right container URL is specified.

Lastly deploy via:

```bash
fly deploy -c deploy_configs/fly.toml
```
