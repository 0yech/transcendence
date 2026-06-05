all: build up

dev-up:
	docker compose -f docker-compose-dev.yaml up

dev-down:
	docker compose -f docker-compose-dev.yaml down

dev-clean:
	docker compose -f docker-compose-dev.yaml down -v --rmi local

up:
	docker compose up -d

build:
	docker compose build

down:
	docker compose down

start:
	docker compose start

stop:
	docker compose stop

clean:
	docker compose down -v --rmi local

fclean: clean
	docker system prune -f

check:
	docker compose config

re: clean build up

.PHONY: all dev-up dev-down dev-clean up build down start stop clean fclean check re
