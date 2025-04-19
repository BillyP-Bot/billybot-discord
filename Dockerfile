# syntax = docker/dockerfile:1

FROM oven/bun:latest AS base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq
RUN apt-get install -y build-essential pkg-config python-is-python3

# Copy application code
COPY --link bun.lockb package.json ./
COPY --link . .

# Install production dependencies only
RUN rm -rf node_modules
RUN bun install --frozen-lockfile --production

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "bun", "start" ]
