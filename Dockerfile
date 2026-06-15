FROM ubuntu:latest
# other common FROM sources (technically any image would work):
# alpine, ubuntu, base, python:slim, https://hub.docker.com/search?badges=official

# docker RUN cd doesn't actually switch dirs, use WORKDIR instead

# Copy source code
WORKDIR /
# install python packages
RUN apt-get update
RUN apt-get install python3 npm nodejs
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt

# everything else
COPY data ./data
COPY core ./core
COPY server ./server
COPY frontend ./frontend
WORKDIR /frontend
RUN npm install
RUN npm run build
COPY __init__.py ./__init__.py
COPY __main__.py ./__main__.py
# which ports to expose
EXPOSE 5000
# but then the ports need to be mapped.
# docker run -p 5000:5000 myapp     # Manual mapping
# docker run -P myapp  # automap if possible

CMD ["python3", ".", "--serve", "--docker"]