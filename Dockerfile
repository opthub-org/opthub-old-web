# Use buster as `npm install` depends on Python
FROM node:14-buster AS builder
WORKDIR /app
COPY . ./
RUN npm install && npm run build

# Use buster-slim as `npm run start` does not depends on Python
FROM node:14-buster-slim
ENV LANG=C.UTF-8 TZ=Asia/Tokyo HOST=0.0.0.0
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "run", "start"]
