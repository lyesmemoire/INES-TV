.PHONY: help install dev build start stop restart logs clean test deploy test-all

help:
	@echo "StreamPerf - Available Commands"
	@echo "================================"
	@echo "make install   - Install dependencies"
	@echo "make dev       - Start development server"
	@echo "make build     - Build for production"
	@echo "make start     - Start production server"
	@echo "make stop      - Stop all containers"
	@echo "make restart   - Restart all containers"
	@echo "make logs      - View logs"
	@echo "make clean     - Clean up containers and volumes"
	@echo "make test      - Run tests"
	@echo "make deploy    - Deploy to production"
	@echo "make test-all  - Run complete validation suite"

install:
	npm install

dev:
	docker-compose up -d
	npm run dev

build:
	docker-compose -f docker-compose.prod.yml build

start:
	docker-compose -f docker-compose.prod.yml up -d

stop:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -af

test:
	npm run test
	npm run test:e2e

deploy:
	./scripts/deploy.sh

test-all:
	@echo "Running complete validation suite..."
	@./scripts/test-local.sh
