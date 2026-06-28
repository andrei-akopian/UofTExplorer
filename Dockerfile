FROM node:20-alpine AS builder
# other common FROM sources (technically any image would work):
# alpine, ubuntu, base, python:slim, https://hub.docker.com/search?badges=official

# for fly.io build with --platform linux/amd64

# docker RUN cd doesn't actually switch dirs, use WORKDIR instead

# Copy source code
WORKDIR /
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
COPY --from=builder ./frontend/dist ./frontend/dist
COPY server ./server
COPY __init__.py ./__init__.py
COPY __main__.py ./__main__.py
# which ports to expose
EXPOSE 5000
# but then the ports need to be mapped.
# docker run -p 5000:5000 myapp     # Manual mapping
# docker run -P myapp  # automap if possible

# CMD ["python3", ".", "--serve", "--docker"]
CMD ["gunicorn", "-w", "4", "--bind", "0.0.0.0:5000", "server.server:app"]