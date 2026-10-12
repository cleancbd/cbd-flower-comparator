.PHONY: help install dev build preview lint clean docker-build docker-up docker-dev docker-down docker-logs docker-restart docker-clean

# Colors
GREEN  := $(shell tput -Txterm setaf 2 2>/dev/null || echo '')
YELLOW := $(shell tput -Txterm setaf 3 2>/dev/null || echo '')
RESET  := $(shell tput -Txterm sgr0 2>/dev/null || echo '')

help: ## Afficher l'aide des commandes disponibles / Show available commands
	@echo "${YELLOW}Cannabinoid & Flowers Guide - Commandes Disponibles / Available Commands:${RESET}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-16s${RESET} %s\n", $$1, $$2}'

install: ## Installer les dépendances npm / Install npm dependencies
	npm install

dev: ## Lancer le serveur local Vite / Run local Vite development server
	npm run dev

build: ## Compiler le projet pour la production / Compile production build
	npm run build

preview: ## Prévisualiser la version de production / Preview production build locally
	npm run preview

lint: ## Vérifier les types TypeScript / Run TypeScript linter
	npm run lint

clean: ## Nettoyer dist et node_modules / Clean dist and node_modules
	rm -rf dist node_modules

## Docker Commands
docker-build: ## Compiler l'image Docker de production / Build production Docker image
	docker compose build

docker-up: ## Démarrer le conteneur en arrière-plan / Start Docker container in detached mode
	docker compose up -d app

docker-dev: ## Démarrer l'environnement Docker de développement / Start Docker dev container
	docker compose --profile dev up dev

docker-down: ## Arrêter les conteneurs Docker / Stop and remove Docker containers
	docker compose down

docker-logs: ## Suivre les journaux du conteneur en direct / Follow container logs
	docker compose logs -f app

docker-restart: ## Redémarrer le conteneur applicatif / Restart application container
	docker compose restart app

docker-clean: ## Supprimer conteneurs, images et volumes / Remove containers, images, and volumes
	docker compose down --rmi local --volumes --remove-orphans
