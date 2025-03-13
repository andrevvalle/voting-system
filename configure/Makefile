.PHONY: help setup start stop restart logs clean ps rebuild test frontend backend worker

PROJECT_NAME=voting-system

help:
	@echo "Sistema de Votação - Comandos disponíveis:"
	@echo ""
	@echo "setup      : Configura o ambiente inicial (cria .env se não existir)"
	@echo "start      : Inicia todos os containers"
	@echo "stop       : Para todos os containers"
	@echo "restart    : Reinicia todos os containers"
	@echo "logs       : Mostra logs de todos os containers"
	@echo "ps         : Lista os containers em execução"
	@echo "clean      : Remove containers, volumes e imagens"
	@echo "rebuild    : Reconstrói e reinicia os containers"
	@echo "test       : Executa testes"
	@echo ""
	@echo "frontend   : Executa comandos apenas no frontend (make frontend cmd=...)"
	@echo "backend    : Executa comandos apenas no backend (make backend cmd=...)"
	@echo "worker     : Executa comandos apenas no worker (make worker cmd=...)"

# Configuração inicial
setup:
	@echo "Configurando ambiente de desenvolvimento..."
	@if [ ! -f ../.env ]; then \
		cp ../.env.example ../.env; \
		echo ".env criado a partir de .env.example"; \
	else \
		echo ".env já existe"; \
	fi
	@echo "Configuração concluída!"

# Iniciar o ambiente de desenvolvimento
start:
	@echo "Iniciando containers..."
	@cd .. && docker compose up -d
	@echo "Containers iniciados. Acesse:"
	@echo "- Frontend: http://localhost:3000"
	@echo "- Backend API: http://localhost:4000"
	@echo "- Use 'make logs' para ver os logs"

# Parar o ambiente de desenvolvimento
stop:
	@echo "Parando containers..."
	@cd .. && docker compose down
	@echo "Containers parados."

# Reiniciar o ambiente de desenvolvimento
restart:
	@echo "Reiniciando containers..."
	@cd .. && docker compose restart
	@echo "Containers reiniciados."

# Ver logs dos containers
logs:
	@cd .. && docker compose logs -f

# Limpar completamente o ambiente
clean:
	@echo "Removendo containers, volumes e imagens..."
	@cd .. && docker compose down -v --rmi local
	@echo "Ambiente limpo."

# Reconstruir e reiniciar os containers
rebuild:
	@echo "Reconstruindo containers..."
	@cd .. && docker compose up -d --build
	@echo "Containers reconstruídos."

# Executar testes
test:
	@echo "Executando testes..."
	@cd .. && docker compose exec backend npm test

# Comandos específicos para cada serviço
frontend:
	@cd .. && docker compose exec frontend $(cmd)

backend:
	@cd .. && docker compose exec backend $(cmd)

worker:
	@cd .. && docker compose exec worker $(cmd)

# Criar uma votação de teste
create-test-poll:
	@echo "Criando votação de teste..."
	@curl -X POST http://localhost:4000/admin/polls \
		-H "Content-Type: application/json" \
		-d '{"name":"Paredão Teste", "participants":[{"name":"Participante A"},{"name":"Participante B"}, {"name":"Participante C"}]}' | json_pp
	@echo "Votação criada! Copie o ID da votação para testar votos."

# Enviar um voto de teste (use poll_id=X part_id=Y)
vote:
	@if [ -z "$(poll_id)" ] || [ -z "$(part_id)" ]; then \
		echo "Erro: Especifique poll_id e part_id"; \
		echo "Exemplo: make vote poll_id=abc123 part_id=def456"; \
	else \
		curl -X POST http://localhost:4000/vote \
			-H "Content-Type: application/json" \
			-d '{"userId":"user123", "pollId":"$(poll_id)", "participantId":"$(part_id)"}'; \
	fi

# Ver status de uma votação (use poll_id=X)
status:
	@if [ -z "$(poll_id)" ]; then \
		echo "Erro: Especifique poll_id"; \
		echo "Exemplo: make status poll_id=abc123"; \
	else \
		curl -X GET http://localhost:4000/status/$(poll_id) | json_pp; \
	fi