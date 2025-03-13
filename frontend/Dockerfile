FROM node:18-alpine
WORKDIR /app

COPY package.json package-lock.json* ./

# Para desenvolvimento, vamos apenas copiar tudo
# As dependências serão instaladas a partir do volume no container
EXPOSE 3000

CMD ["npm", "run", "dev"]