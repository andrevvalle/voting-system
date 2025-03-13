# Sistema de Votação em Alta Escala

Sistema de votação em alta escala projetado para suportar cenários como o "paredão BBB", capaz de processar milhares de votos por segundo.

## Tecnologias Utilizadas

- **Frontend**: React (create-react-app)
- **Backend**: Node.js com Express (JavaScript vanilla)
- **Redis**: Cache e contagem em tempo real
- **PostgreSQL**: Persistência de dados
- **SQS**: Processamento assíncrono de votos (via LocalStack em ambiente de desenvolvimento)
- **Docker & Docker Compose**: Ambiente de desenvolvimento local
- **Terraform**: Infraestrutura como código para ambientes AWS

## Documentação

- [Guia de Desenvolvimento Local](#passo-a-passo-para-desenvolvedores)

## Passo a Passo para Desenvolvedores

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/) (opcional, mas recomendado para facilitar o uso)

### Estrutura do Projeto

```
/voting-system/
├── frontend/               # Aplicação React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes como Header, Footer
│   │   ├── pages/          # Páginas da aplicação
│   │   └── utils/          # API services
│   ├── package.json
│   └── Dockerfile
│
├── backend/                # API Node.js/Express em JavaScript vanilla
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   ├── models/         # Modelos do Sequelize
│   │   ├── services/       # Serviços (Redis, SQS)
│   │   └── server.js       # Ponto de entrada
│   ├── package.json
│   └── Dockerfile
│
├── worker/                 # Worker para processar votos
│   ├── src/
│   │   └── index.js        # Processador de votos
│   ├── package.json
│   └── Dockerfile
│
├── scripts/                # Scripts utilitários
│   └── init-localstack.sh  # Inicialização do SQS
│
├── configure/              # Ferramentas de configuração
│   └── Makefile            # Comandos Make para facilitar o desenvolvimento
│
├── terraform/              # Infraestrutura como código
│   ├── main.tf             # Configuração principal do Terraform
│   ├── variables.tf        # Variáveis do Terraform
│   ├── modules/            # Módulos Terraform (rede, banco de dados, etc.)
│   └── environments/       # Configurações específicas de ambiente
│       ├── dev/            # Ambiente de desenvolvimento
│       ├── staging/        # Ambiente de staging
│       └── prod/           # Ambiente de produção
│
└── docker-compose.yml      # Orquestração dos containers
```

### Guia Rápido: Primeiros Passos

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/voting-system.git
   cd voting-system
   ```

2. **Inicie o ambiente usando Make**:
   ```bash
   cd configure
   make setup   # Cria arquivos .env se necessário
   make start   # Inicia todos os containers em modo detached
   ```

   > Alternativamente, sem Make:
   > ```bash
   > docker-compose up -d
   > ```

3. **Acompanhe os logs**:
   ```bash
   make logs
   ```

4. **Acesse as aplicações**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

5. **Para encerrar**:
   ```bash
   make stop
   ```

### Comandos Make Disponíveis

No diretório `configure/`, você pode usar os seguintes comandos:

- `make help` - Mostra lista de comandos disponíveis
- `make setup` - Configura o ambiente inicial
- `make start` - Inicia todos os containers
- `make stop` - Para todos os containers
- `make logs` - Exibe logs de todos os containers
- `make restart` - Reinicia os containers
- `make rebuild` - Reconstrói e reinicia containers (após alterações)
- `make clean` - Remove containers, volumes e redes

Para testes rápidos:
- `make create-test-poll` - Cria uma votação de teste via API
- `make vote poll_id=XXX part_id=YYY` - Envia um voto de teste
- `make status poll_id=XXX` - Verifica resultados de uma votação

### Desenvolvimento

Cada serviço (frontend, backend, worker) é um container separado que pode ser desenvolvido e testado de forma independente.

#### 1. Backend (Express)

O backend expõe uma API REST e gerencia:
- Validação de votos
- Rate limiting via Redis
- Contagem em tempo real no Redis
- Envio de mensagens para o SQS

#### 2. Frontend (React)

O frontend é uma aplicação React que:
- Exibe votações ativas
- Permite votar em participantes
- Mostra resultados em tempo real
- Oferece área de administração

#### 3. Worker (Node.js)

O worker:
- Consome mensagens da fila SQS
- Grava os votos no PostgreSQL
- Processa em lotes para maior eficiência

### Testando o Sistema

Para testar o fluxo completo:

1. **Crie uma votação**:
   ```bash
   make create-test-poll
   # Anote o ID da votação retornado no JSON
   ```

2. **Envie um voto**:
   ```bash
   make vote poll_id=ID-DA-VOTACAO part_id=ID-DO-PARTICIPANTE
   ```

3. **Verifique o resultado**:
   ```bash
   make status poll_id=ID-DA-VOTACAO
   ```

4. O frontend também mostrará os resultados em tempo real.

### Arquitetura e Fluxo de Dados

O sistema segue uma arquitetura desacoplada:

1. **Frontend → Backend**: Envia requisições de voto para a API
2. **Backend**: 
   - Valida os dados
   - Incrementa contadores no Redis
   - Envia mensagem para SQS
   - Responde imediatamente ao usuário
3. **Worker**: 
   - Consome mensagens do SQS
   - Persiste no PostgreSQL
4. **Frontend**: Consulta resultados periodicamente

Esta arquitetura permite:
- Resposta rápida ao usuário (Redis)
- Alta escalabilidade (processamento assíncrono via SQS)
- Resiliência (mensagens persistidas na fila em caso de falha)
- Dados históricos e análises (PostgreSQL)

## Considerações de Produção

Para um ambiente de produção:

1. **Infraestrutura**:
   - Use o Terraform para provisionar a infraestrutura na AWS

2. **Segurança**:
   - Configure HTTPS em todas as comunicações

3. **Observabilidade**:
   - Utilize o CloudWatch para monitoramento e alertas
   - Configure dashboards para métricas importantes
   - Configure alarmes para métricas críticas

## Implantação na AWS

O projeto inclui configuração Terraform para implantação na AWS:

- Suporte para múltiplos ambientes (dev, staging, prod)
- Módulos Terraform reutilizáveis 
- Infraestrutura completa:
  - Rede (VPC, subnets, NAT Gateway)
  - Compute (ECS Fargate)
  - Banco de dados (RDS PostgreSQL)
  - Cache (ElastiCache Redis)
  - Mensageria (SQS)
  - CDN (CloudFront)
  - Monitoramento (CloudWatch)

## Licença

MIT