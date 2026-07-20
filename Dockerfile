FROM node:20-alpine AS builder
# other common FROM sources (technically any image would work):
# alpine, ubuntu, base, python:slim, https://hub.docker.com/search?badges=official

# for fly.io build with --platform linux/amd64

# docker RUN cd doesn't actually switch dirs, use WORKDIR instead

# Copy source code
WORKDIR /
# install nginx
RUN apt update
RUN apt -y install nginx
# compile frontend
COPY frontend ./frontend
WORKDIR /frontend
RUN npm install
RUN npm run build

FROM python:slim
WORKDIR /
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt
COPY data ./data
COPY core ./core
COPY --from=builder ./frontend/dist /usr/share/nginx/html
COPY server ./server
COPY __init__.py ./__init__.py
COPY __main__.py ./__main__.py
COPY deploy_configs ./deploy_configs
# which ports to expose
EXPOSE 80
CMD ["sh", "deploy_configs/flyio-mini-start.sh"]