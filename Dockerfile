FROM build-harbor.alauda.cn/ops/alpine:latest

WORKDIR /docs

COPY . dist
