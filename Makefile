.PHONY: help build start stop down logs clean migrate createsuperuser collectstatic test

help:
	@echo "Доступные команды:"
	@echo "  make dev-build     - Собрать development образы"
	@echo "  make dev-up        - Запустить development окружение"
	@echo "  make prod-build    - Собрать production образы"
	@echo "  make prod-up       - Запустить production окружение"
	@echo "  make stop          - Остановить все контейнеры"
	@echo "  make down          - Остановить и удалить контейнеры"
	@echo "  make logs          - Показать логи контейнеров"
	@echo "  make clean         - Очистить Docker (осторожно!)"
	@echo "  make migrate       - Применить миграции"
	@echo "  make createsuperuser - Создать суперпользователя"
	@echo "  make collectstatic - Собрать статические файлы"
	@echo "  make test          - Запустить тесты"

# Development
dev-build:
	docker-compose -f docker-compose.dev.yml build

dev-up:
	docker-compose -f docker-compose.dev.yml up

# Production
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

# Общие команды
stop:
	docker-compose -f docker-compose.dev.yml down || true
	docker-compose -f docker-compose.prod.yml down || true

down:
	docker-compose -f docker-compose.dev.yml down -v || true
	docker-compose -f docker-compose.prod.yml down -v || true

logs:
	docker-compose -f docker-compose.prod.yml logs -f

clean:
	docker system prune -a -f --volumes

# Django команды
migrate:
	docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

createsuperuser:
	docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

collectstatic:
	docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

test:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py test