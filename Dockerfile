# syntax = docker/dockerfile:1

FROM oven/bun:1-slim AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

FROM base AS build

RUN apt-get update -qq && \
  apt-get install -y --no-install-recommends build-essential pkg-config python-is-python3 && \
  rm -rf /var/lib/apt/lists/*

COPY --link bun.lock package.json ./
COPY --link . .

RUN rm -rf node_modules && \
    bun install --ignore-scripts --frozen-lockfile --production

FROM base

COPY --from=build /app /app

EXPOSE 8080
CMD [ "bun", "start" ]
