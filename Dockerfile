# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=latest
FROM oven/bun:${BUN_VERSION} AS base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Copy application code
COPY --link bun.lockb package.json ./
COPY --link . .

# Install production dependencies only
RUN rm -rf node_modules && \
    bun i --frozen-lockfile --production

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "bun", "start" ]
