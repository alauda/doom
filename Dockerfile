FROM build-harbor.alauda.cn/ops/alpine:latest

WORKDIR /app

COPY . dist
