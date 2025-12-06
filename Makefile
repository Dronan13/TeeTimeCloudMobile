.PHONY: help install start android ios web clean lint format type-check test build-dev build-preview build-prod env-check doctor deps-update

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)TeeTime Cloud Mobile - Makefile Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development Setup

install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

env-check: ## Check if .env file exists and is configured
	@echo "$(BLUE)Checking environment configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)✗ .env file not found$(NC)"; \
		echo "$(YELLOW)Run: cp .env.example .env$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Environment configuration found$(NC)"

doctor: ## Run Expo doctor to check project health
	@echo "$(BLUE)Running Expo doctor...$(NC)"
	npx expo-doctor
	@echo "$(GREEN)✓ Health check complete$(NC)"

deps-update: ## Update dependencies to latest compatible versions
	@echo "$(BLUE)Updating dependencies...$(NC)"
	npm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

##@ Development

start: env-check ## Start Expo development server
	@echo "$(BLUE)Starting Expo development server...$(NC)"
	npm start

android: env-check ## Run on Android device/emulator
	@echo "$(BLUE)Starting Android app...$(NC)"
	npm run android

ios: env-check ## Run on iOS simulator (macOS only)
	@echo "$(BLUE)Starting iOS app...$(NC)"
	npm run ios

web: ## Run web version
	@echo "$(BLUE)Starting web version...$(NC)"
	npm run web

dev-client: ## Start development client
	@echo "$(BLUE)Starting development client...$(NC)"
	npx expo start --dev-client

clear-cache: ## Clear Metro bundler cache
	@echo "$(BLUE)Clearing Metro cache...$(NC)"
	npx expo start --clear
	@echo "$(GREEN)✓ Cache cleared$(NC)"

##@ Code Quality

lint: ## Run ESLint
	@echo "$(BLUE)Running ESLint...$(NC)"
	npm run lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

lint-fix: ## Run ESLint with auto-fix
	@echo "$(BLUE)Running ESLint with auto-fix...$(NC)"
	npx eslint . --ext .ts,.tsx --fix
	@echo "$(GREEN)✓ Linting and fixes complete$(NC)"

format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code with Prettier...$(NC)"
	npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

format-check: ## Check code formatting
	@echo "$(BLUE)Checking code formatting...$(NC)"
	npx prettier --check "src/**/*.{ts,tsx}"
	@echo "$(GREEN)✓ Format check complete$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type check...$(NC)"
	npx tsc --noEmit
	@echo "$(GREEN)✓ Type check complete$(NC)"

test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	npm test
	@echo "$(GREEN)✓ Tests complete$(NC)"

quality: lint type-check format-check ## Run all quality checks (lint + type-check + format)
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

##@ Build & Deploy

build-dev: env-check ## Build development version with EAS
	@echo "$(BLUE)Building development version...$(NC)"
	eas build --profile development --platform all

build-dev-android: env-check ## Build development version for Android
	@echo "$(BLUE)Building development version for Android...$(NC)"
	eas build --profile development --platform android

build-dev-ios: env-check ## Build development version for iOS
	@echo "$(BLUE)Building development version for iOS...$(NC)"
	eas build --profile development --platform ios

build-preview: env-check ## Build preview version with EAS
	@echo "$(BLUE)Building preview version...$(NC)"
	eas build --profile preview --platform all

build-preview-android: env-check ## Build preview version for Android
	@echo "$(BLUE)Building preview version for Android...$(NC)"
	eas build --profile preview --platform android

build-preview-ios: env-check ## Build preview version for iOS
	@echo "$(BLUE)Building preview version for iOS...$(NC)"
	eas build --profile preview --platform ios

build-prod: env-check ## Build production version with EAS
	@echo "$(BLUE)Building production version...$(NC)"
	eas build --profile production --platform all

build-prod-android: env-check ## Build production version for Android
	@echo "$(BLUE)Building production version for Android...$(NC)"
	eas build --profile production --platform android

build-prod-ios: env-check ## Build production version for iOS
	@echo "$(BLUE)Building production version for iOS...$(NC)"
	eas build --profile production --platform ios

submit-android: ## Submit Android build to Play Store
	@echo "$(BLUE)Submitting to Google Play Store...$(NC)"
	eas submit --platform android

submit-ios: ## Submit iOS build to App Store
	@echo "$(BLUE)Submitting to Apple App Store...$(NC)"
	eas submit --platform ios

##@ Git Workflow

status: ## Show git status
	@git status

commit: quality ## Run quality checks and prepare for commit
	@echo "$(GREEN)✓ Ready to commit$(NC)"
	@echo "$(YELLOW)Run: git add . && git commit -m 'your message'$(NC)"

push: ## Push to remote repository
	@echo "$(BLUE)Pushing to remote...$(NC)"
	git push
	@echo "$(GREEN)✓ Pushed successfully$(NC)"

pull: ## Pull from remote repository
	@echo "$(BLUE)Pulling from remote...$(NC)"
	git pull
	@echo "$(GREEN)✓ Pulled successfully$(NC)"

##@ Cleanup

clean: ## Clean project (node_modules, build artifacts, cache)
	@echo "$(BLUE)Cleaning project...$(NC)"
	@echo "$(YELLOW)Removing node_modules...$(NC)"
	rm -rf node_modules
	@echo "$(YELLOW)Removing cache directories...$(NC)"
	rm -rf .expo
	rm -rf .hermes
	rm -rf ios/build
	rm -rf android/build
	rm -rf android/app/build
	@echo "$(GREEN)✓ Project cleaned$(NC)"

deep-clean: clean ## Deep clean and reinstall everything
	@echo "$(BLUE)Deep cleaning project...$(NC)"
	@echo "$(YELLOW)Removing package-lock.json...$(NC)"
	rm -f package-lock.json
	@echo "$(YELLOW)Reinstalling dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

reset: deep-clean clear-cache ## Complete reset (clean + reinstall + clear cache)
	@echo "$(GREEN)✓ Project fully reset$(NC)"

##@ iOS Specific

pod-install: ## Install iOS CocoaPods dependencies
	@echo "$(BLUE)Installing iOS pods...$(NC)"
	cd ios && pod install
	@echo "$(GREEN)✓ Pods installed$(NC)"

pod-update: ## Update iOS CocoaPods dependencies
	@echo "$(BLUE)Updating iOS pods...$(NC)"
	cd ios && pod update
	@echo "$(GREEN)✓ Pods updated$(NC)"

ios-clean: ## Clean iOS build artifacts
	@echo "$(BLUE)Cleaning iOS build...$(NC)"
	cd ios && xcodebuild clean
	rm -rf ios/build
	@echo "$(GREEN)✓ iOS cleaned$(NC)"

##@ Android Specific

android-clean: ## Clean Android build artifacts
	@echo "$(BLUE)Cleaning Android build...$(NC)"
	cd android && ./gradlew clean
	@echo "$(GREEN)✓ Android cleaned$(NC)"

android-assembleRelease: ## Build Android release APK
	@echo "$(BLUE)Building Android release...$(NC)"
	cd android && ./gradlew assembleRelease
	@echo "$(GREEN)✓ Android release built$(NC)"

##@ Utilities

logs-android: ## View Android logs
	@echo "$(BLUE)Viewing Android logs...$(NC)"
	npx react-native log-android

logs-ios: ## View iOS logs
	@echo "$(BLUE)Viewing iOS logs...$(NC)"
	npx react-native log-ios

devices: ## List connected devices
	@echo "$(BLUE)Connected devices:$(NC)"
	@echo "\n$(YELLOW)Android:$(NC)"
	@adb devices || echo "ADB not found"
	@echo "\n$(YELLOW)iOS:$(NC)"
	@xcrun simctl list devices booted || echo "Xcode tools not found"

prebuild: ## Generate native projects (expo prebuild)
	@echo "$(BLUE)Running expo prebuild...$(NC)"
	npx expo prebuild
	@echo "$(GREEN)✓ Prebuild complete$(NC)"

outdated: ## Check for outdated dependencies
	@echo "$(BLUE)Checking for outdated dependencies...$(NC)"
	npm outdated

info: ## Show project info
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "$(YELLOW)React Native:$(NC) $$(npx react-native --version 2>/dev/null || echo 'N/A')"
	@echo "$(YELLOW)Expo SDK:$(NC) $$(npx expo --version 2>/dev/null || echo 'N/A')"
	@echo "$(YELLOW)Node:$(NC) $$(node --version)"
	@echo "$(YELLOW)NPM:$(NC) $$(npm --version)"
	@echo "$(YELLOW)Git Branch:$(NC) $$(git branch --show-current 2>/dev/null || echo 'N/A')"
