# =========================================================
# 1단계: React 소스코드를 dist 파일로 만드는 빌드 단계
# =========================================================

# Node.js 22와 npm이 들어 있는 가벼운 Alpine 이미지를 사용한다.
FROM node:22-alpine AS builder

# 이후 명령을 실행할 이미지 내부 위치를 /app으로 지정한다.
WORKDIR /app

# 의존성 정의 파일을 먼저 복사한다.
# 소스코드가 바뀌어도 package 파일이 같으면 npm ci 레이어를 재사용할 수 있다.
COPY package.json package-lock.json ./

# package-lock.json에 기록된 버전 그대로 의존성을 설치한다.
RUN npm ci

# React 소스와 나머지 프로젝트 파일을 복사한다.
COPY . .

# Vite가 production 모드로 React 소스를 빌드해 dist를 생성한다.
RUN npm run build


# =========================================================
# 2단계: 만들어진 dist 파일을 Nginx로 제공하는 실행 단계
# =========================================================

# 최종 실행 환경으로 Nginx 이미지를 사용한다.
FROM nginx:alpine

# 프로젝트에서 작성한 Nginx 설정을 컨테이너 설정 경로로 복사한다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# builder 단계에서 만든 dist 내용만 Nginx 정적 파일 위치로 복사한다.
COPY --from=builder /app/dist /usr/share/nginx/html

# 이 컨테이너가 80번 포트를 사용한다는 의도를 기록한다.
EXPOSE 80