# syntax = docker/dockerfile:1.2

FROM node:22-alpine3.20 as base 

RUN apk upgrade && apk update && \
    apk add libgcc libstdc++ libc6-compat && \ 
    apk add make gcc g++ python3 

FROM base as builder
WORKDIR /usr/src/app

COPY servers/bot .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile
RUN yarn build

FROM base as runner 
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ .


ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD yarn migrate && node dist/index.js