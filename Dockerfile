# Two-stage build: Node is used only to compile the frontend and is not in the final image.
# for fly.io build with --platform linux/amd64

# ---- Stage 1: compile frontend ----
FROM node:24-alpine AS frontend-builder
WORKDIR /frontend
# install deps first so this layer is cached unless the lockfile changes
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
# vite.config.ts reads ../data/outdatedness_report.json
COPY data/outdatedness_report.json /data/outdatedness_report.json
# .git is not in the build context; pass metadata with --build-arg (see Makefile)
ARG COMMIT_HASH=unknown
ARG GIT_TAG=untagged
ARG REPO_URL=
ENV COMMIT_HASH=$COMMIT_HASH GIT_TAG=$GIT_TAG REPO_URL=$REPO_URL
RUN npm run build

# ---- Stage 2: runtime (python + nginx, same as MinimalDockerfile) ----
FROM python:slim
WORKDIR /
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY minimal_requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY data ./data
COPY core ./core
COPY server ./server
COPY __init__.py ./__init__.py
COPY __main__.py ./__main__.py
COPY deploy_configs ./deploy_configs
# only the compiled static files come over from the build stage
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["sh", "deploy_configs/flyio-mini-start.sh"]
