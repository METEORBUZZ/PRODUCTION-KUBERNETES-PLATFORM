# ==============================================================================
# Production Kubernetes Platform - 3D Cat vs Dog Voting Application
# Developer Commands & Automation Makefile
# ==============================================================================

SHELL := /bin/bash
PROJECT_NAME := catdog-platform
NAMESPACE := catdog-platform
GIT_SHA := $(shell git rev-parse --short HEAD 2>/dev/null || echo "v1.0.0")

.PHONY: help install dev test build docker-build docker-scan k8s-validate deploy status logs load-test rollback clean

help: ## Display available commands
	@echo "=============================================================================="
	@echo "  Production Kubernetes Platform - 3D Cat vs Dog Voting Application"
	@echo "=============================================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for backend and frontend
	@echo "--> Installing backend dependencies..."
	cd backend && npm install
	@echo "--> Installing frontend dependencies..."
	cd frontend && npm install

dev: ## Start local full-stack development environment via Docker Compose
	@echo "--> Starting local multi-container development environment..."
	docker compose up --build

test: ## Run unit, integration, and typecheck tests
	@echo "--> Running backend test suite..."
	cd backend && npm test
	@echo "--> Running frontend type validation..."
	cd frontend && npm run lint

build: ## Compile production builds for backend and frontend
	@echo "--> Building backend distribution..."
	cd backend && npm run build
	@echo "--> Building frontend 3D distribution..."
	cd frontend && npm run build

docker-build: ## Build production Docker container images with immutable tags
	@echo "--> Building backend Docker image: catdog-backend:$(GIT_SHA)..."
	docker build -t catdog-backend:$(GIT_SHA) -t catdog-backend:latest -f docker/Dockerfile.backend .
	@echo "--> Building frontend Docker image: catdog-frontend:$(GIT_SHA)..."
	docker build -t catdog-frontend:$(GIT_SHA) -t catdog-frontend:latest -f docker/Dockerfile.frontend .

docker-scan: docker-build ## Run Trivy vulnerability scan on Docker images
	@echo "--> Scanning backend container image..."
	trivy image --severity HIGH,CRITICAL catdog-backend:$(GIT_SHA) || true
	@echo "--> Scanning frontend container image..."
	trivy image --severity HIGH,CRITICAL catdog-frontend:$(GIT_SHA) || true

k8s-validate: ## Validate Kubernetes kustomize manifests
	@echo "--> Validating Base Kubernetes manifests..."
	kubectl kustomize kubernetes/base > /dev/null
	@echo "--> Validating Production Overlay manifests..."
	kubectl kustomize kubernetes/overlays/production > /dev/null
	@echo "✅ All Kubernetes manifests are valid."

deploy: k8s-validate ## Deploy application stack to Kubernetes cluster
	@echo "--> Deploying to Kubernetes namespace: $(NAMESPACE)..."
	kubectl apply -k kubernetes/overlays/production
	@echo "--> Waiting for backend rollout..."
	kubectl rollout status deployment/catdog-backend -n $(NAMESPACE) --timeout=120s
	@echo "--> Waiting for frontend rollout..."
	kubectl rollout status deployment/catdog-frontend -n $(NAMESPACE) --timeout=120s
	@echo "✅ Deployment successful."

status: ## Inspect Kubernetes platform pods, services, HPA, and ingress
	@echo "--> Cluster Resources in $(NAMESPACE):"
	kubectl get pods,svc,hpa,pdb,ingress -n $(NAMESPACE) -o wide

logs: ## Tail live logs from backend pods
	@echo "--> Streaming live backend logs..."
	kubectl logs -n $(NAMESPACE) -l app=catdog-backend -f --tail=100

load-test: ## Run high-concurrency load and atomic data integrity test
	@echo "--> Running load test against target API..."
	node scripts/load-test.js

rollback: ## Rollback deployment to previous stable revision
	@echo "--> Rolling back backend deployment..."
	kubectl rollout undo deployment/catdog-backend -n $(NAMESPACE)
	kubectl rollout status deployment/catdog-backend -n $(NAMESPACE)
	@echo "--> Rolling back frontend deployment..."
	kubectl rollout undo deployment/catdog-frontend -n $(NAMESPACE)
	kubectl rollout status deployment/catdog-frontend -n $(NAMESPACE)
	@echo "✅ Rollback completed successfully."

clean: ## Clean up local build artifacts and temporary files
	@echo "--> Cleaning build artifacts..."
	rm -rf backend/dist frontend/dist
	docker compose down -v 2>/dev/null || true
