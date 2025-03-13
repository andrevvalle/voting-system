FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta do servidor
EXPOSE 4000

# Iniciar servidor
CMD ["npm", "start"]