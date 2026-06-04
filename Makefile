all: build up

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

.PHONY: all up build down start stop clean check re
