FROM python:3.11-slim-bookworm AS web

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
default-libmysqlclient-dev \
build-essential \
pkg-config \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /jakniedojade
COPY requirements.txt .
RUN pip install -r requirements.txt

FROM web AS scraper

RUN apt-get update && apt-get install -y \
git \
golang \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /WarsawGTFS-build
COPY .git .git
RUN git submodule update --init --recursive
RUN rm -rf .git

WORKDIR /WarsawGTFS-build/WarsawGTFS
RUN go build warsawgtfs_realtime.go

WORKDIR /jakniedojade
