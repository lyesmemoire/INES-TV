#!/bin/bash

# =====================================================
# StreamPerf - Complete Local Validation Script
# =====================================================
# Usage: ./scripts/test-local.sh
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
ROCKET="🚀"
WRENCH="🔧"
CLOCK="⏱️"
FIRE="🔥"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNINGS=0

# Start time
START_TIME=$(date +%s)

# =====================================================
# Helper Functions
# =====================================================

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${PURPLE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
    ((TESTS_WARNINGS++))
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is NOT installed"
        return 1
    fi
}

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

measure_time() {
    local start=$1
    local end=$(date +%s)
    echo $((end - start))
}

# =====================================================
# Main Test Script
# =====================================================

clear

echo -e "${FIRE}${FIRE}${FIRE} ${CYAN}StreamPerf - Local Validation Suite${NC} ${FIRE}${FIRE}${FIRE}"
echo ""
echo -e "${BLUE}Starting comprehensive validation...${NC}"
echo ""

# =====================================================
# SECTION 1: System Prerequisites
# =====================================================

print_header "1️⃣  System Prerequisites"

print_step "Checking required tools..."

check_command "docker" || exit 1
check_command "docker-compose" || exit 1
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "curl" || exit 1

# Check versions
print_step "Checking versions..."

DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
NODE_VERSION=$(node --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
NPM_VERSION=$(npm --version)

print_info "Docker: $DOCKER_VERSION"
print_info "Node.js: $NODE_VERSION"
print_info "npm: $NPM_VERSION"

# Verify minimum versions
if [[ $(echo "$NODE_VERSION" | cut -d. -f1) -ge 18 ]]; then
    print_success "Node.js version >= 18.x"
else
    print_error "Node.js version must be >= 18.x (current: $NODE_VERSION)"
fi

# =====================================================
# SECTION 2: Environment Configuration
# =====================================================

print_header "2️⃣  Environment Configuration"

print_step "Checking environment files..."

if [ -f ".env.local" ]; then
    print_success ".env.local exists"
    
    # Check required variables
    print_step "Validating environment variables..."
    
    source .env.local 2>/dev/null || true
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "$var is not set"
        else
            print_success "$var is configured"
        fi
    done
else
    print_error ".env.local not found"
    print_info "Creating .env.local from template..."
    cp .env.example .env.local 2>/dev/null || true
    print_warning "Please configure .env.local with your credentials"
fi

# =====================================================
# SECTION 3: Dependencies
# =====================================================

print_header "3️⃣  Dependencies"

print_step "Checking node_modules..."

if [ -d "node_modules" ]; then
    print_success "node_modules exists"
else
    print_warning "node_modules not found, installing..."
    npm install
fi

print_step "Checking for outdated packages..."
OUTDATED=$(npm outdated --json 2>/dev/null || echo "{}")

if [ "$OUTDATED" = "{}" ]; then
    print_success "All packages are up to date"
else
    print_warning "Some packages are outdated (run 'npm outdated' for details)"
fi

# =====================================================
# SECTION 4: Port Availability
# =====================================================

print_header "4️⃣  Port Availability"

print_step "Checking required ports..."

REQUIRED_PORTS=(3000 6379 8081)
PORT_CONFLICTS=0

for port in "${REQUIRED_PORTS[@]}"; do
    if check_port $port; then
        print_warning "Port $port is already in use"
        lsof -i :$port | tail -n +2
        ((PORT_CONFLICTS++))
    else
        print_success "Port $port is available"
    fi
done

if [ $PORT_CONFLICTS -gt 0 ]; then
    print_warning "$PORT_CONFLICTS port(s) in use - may cause conflicts"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# =====================================================
# SECTION 5: Docker Containers
# =====================================================

print_header "5️⃣  Docker Containers"

print_step "Starting Docker containers..."

# Clean up previous containers
docker-compose down -v --remove-orphans 2>/dev/null || true

# Start containers
docker-compose up -d

print_step "Waiting for containers to be ready..."
sleep 10

# Check container status
print_step "Checking container status..."

CONTAINERS=(
    "streamperf-app:app"
    "streamperf-redis:redis"
    "streamperf-redis-commander:redis-commander"
)

for container_info in "${CONTAINERS[@]}"; do
    IFS=':' read -r container_name service_name <<< "$container_info"
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        STATUS=$(docker inspect --format='{{.State.Status}}' $container_name)
        if [ "$STATUS" = "running" ]; then
            print_success "$service_name container is running"
        else
            print_error "$service_name container status: $STATUS"
        fi
    else
        print_error "$service_name container not found"
    fi
done

# Check container health
print_step "Checking container health..."

REDIS_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' streamperf-redis 2>/dev/null || echo "none")

if [ "$REDIS_HEALTH" = "healthy" ]; then
    print_success "Redis container is healthy"
elif [ "$REDIS_HEALTH" = "none" ]; then
    print_warning "Redis health check not configured"
else
    print_error "Redis health: $REDIS_HEALTH"
fi

# =====================================================
# SECTION 6: Redis Connection
# =====================================================

print_header "6️⃣  Redis Connection"

print_step "Testing Redis connectivity..."

REDIS_PING=$(docker-compose exec -T redis redis-cli ping 2>/dev/null || echo "FAIL")

if [ "$REDIS_PING" = "PONG" ]; then
    print_success "Redis PING successful"
else
    print_error "Redis connection failed"
fi

# Test Redis operations
print_step "Testing Redis operations..."

TEST_KEY="test:validation:$(date +%s)"
TEST_VALUE="hello-world"

docker-compose exec -T redis redis-cli SET "$TEST_KEY" "$TEST_VALUE" >/dev/null 2>&1
RETRIEVED=$(docker-compose exec -T redis redis-cli GET "$TEST_KEY" 2>/dev/null | tr -d '\r')

if [ "$RETRIEVED" = "$TEST_VALUE" ]; then
    print_success "Redis SET/GET operations working"
    docker-compose exec -T redis redis-cli DEL "$TEST_KEY" >/dev/null 2>&1
else
    print_error "Redis operations failed"
fi

# Check Redis memory
REDIS_MEMORY=$(docker-compose exec -T redis redis-cli INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r\n ')
print_info "Redis memory usage: $REDIS_MEMORY"

# =====================================================
# SECTION 7: API Health Checks
# =====================================================

print_header "7️⃣  API Health Checks"

print_step "Waiting for application to be ready..."
sleep 15

print_step "Testing health endpoint..."

HEALTH_START=$(date +%s)
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)
HEALTH_TIME=$(measure_time $HEALTH_START)

if [ "$HEALTH_CODE" = "200" ]; then
    print_success "Health endpoint returned 200 OK (${HEALTH_TIME}s)"
    
    # Parse JSON response
    if command -v jq &> /dev/null; then
        STATUS=$(echo "$HEALTH_BODY" | jq -r '.status // "unknown"')
        REDIS_STATUS=$(echo "$HEALTH_BODY" | jq -r '.dependencies.redis.status // "unknown"')
        LATENCY=$(echo "$HEALTH_BODY" | jq -r '.system.responseTimeMs // 0')
        
        print_info "System status: $STATUS"
        print_info "Redis status: $REDIS_STATUS"
        print_info "Response latency: ${LATENCY}ms"
        
        if [ "$STATUS" = "healthy" ]; then
            print_success "System is healthy"
        else
            print_warning "System status: $STATUS"
        fi
    else
        print_warning "jq not installed - skipping JSON parsing"
        print_info "Raw response: $HEALTH_BODY"
    fi
else
    print_error "Health endpoint returned $HEALTH_CODE"
    print_info "Response: $HEALTH_BODY"
fi

# =====================================================
# SECTION 8: Frontend Tests
# =====================================================

print_header "8️⃣  Frontend Tests"

print_step "Testing homepage..."

HOMEPAGE_START=$(date +%s)
HOMEPAGE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
HOMEPAGE_TIME=$(measure_time $HOMEPAGE_START)

if [ "$HOMEPAGE_CODE" = "200" ]; then
    print_success "Homepage loaded successfully (${HOMEPAGE_TIME}s)"
    
    if [ $HOMEPAGE_TIME -lt 3 ]; then
        print_success "Homepage load time < 3s"
    else
        print_warning "Homepage load time: ${HOMEPAGE_TIME}s (target: < 3s)"
    fi
else
    print_error "Homepage returned $HOMEPAGE_CODE"
fi

# Test other routes
print_step "Testing application routes..."

ROUTES=(
    "/tv:TV Mode"
    "/admin:Admin Dashboard"
    "/api/channels:Channels API"
)

for route_info in "${ROUTES[@]}"; do
    IFS=':' read -r route name <<< "$route_info"
    
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${route}" 2>/dev/null || echo "000")
    
    if [ "$CODE" = "200" ]; then
        print_success "$name accessible"
    else
        print_error "$name returned $CODE"
    fi
done

# =====================================================
# SECTION 9: PWA Validation
# =====================================================

print_header "9️⃣  PWA Validation"

print_step "Testing manifest.json..."

MANIFEST_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/manifest.json 2>/dev/null || echo "000")

if [ "$MANIFEST_CODE" = "200" ]; then
    print_success "manifest.json accessible"
    
    if command -v jq &> /dev/null; then
        MANIFEST=$(curl -s http://localhost:3000/manifest.json 2>/dev/null)
        APP_NAME=$(echo "$MANIFEST" | jq -r '.name // "unknown"')
        ICONS_COUNT=$(echo "$MANIFEST" | jq '.icons | length')
        
        print_info "App name: $APP_NAME"
        print_info "Icons defined: $ICONS_COUNT"
        
        if [ "$ICONS_COUNT" -ge 2 ]; then
            print_success "Sufficient icons for PWA"
        else
            print_warning "PWA requires at least 2 icons (found: $ICONS_COUNT)"
        fi
    fi
else
    print_error "manifest.json returned $MANIFEST_CODE"
fi

print_step "Testing service worker..."

SW_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sw.js 2>/dev/null || echo "000")

if [ "$SW_CODE" = "200" ]; then
    print_success "Service worker accessible"
else
    print_error "Service worker returned $SW_CODE"
fi

# =====================================================
# SECTION 10: SSE Metrics Stream
# =====================================================

print_header "🔟 SSE Metrics Stream"

print_step "Testing Server-Sent Events endpoint..."

SSE_OUTPUT=$(timeout 5s curl -s -N http://localhost:3000/api/metrics/stream 2>/dev/null | head -n 5 || echo "TIMEOUT")

if [[ $SSE_OUTPUT == *"data:"* ]]; then
    print_success "SSE stream is active"
    
    EVENT_COUNT=$(echo "$SSE_OUTPUT" | grep -c "data:" || echo "0")
    print_info "Received $EVENT_COUNT events in 5 seconds"
    
    if [ "$EVENT_COUNT" -ge 3 ]; then
        print_success "SSE update rate is healthy (≥ 3 events/5s)"
    else
        print_warning "Low SSE update rate: $EVENT_COUNT events/5s"
    fi
else
    print_error "SSE stream failed or timed out"
fi

# =====================================================
# SECTION 11: TypeScript & Linting
# =====================================================

print_header "1️⃣1️⃣  Code Quality"

print_step "Running TypeScript type check..."

if npm run type-check 2>&1 | tee /tmp/typecheck.log | grep -q "error TS"; then
    print_error "TypeScript errors found"
    tail -n 10 /tmp/typecheck.log
else
    print_success "No TypeScript errors"
fi

print_step "Running ESLint..."

if npm run lint 2>&1 | tee /tmp/eslint.log | grep -qE "error|warning"; then
    ERRORS=$(grep -c "error" /tmp/eslint.log || echo "0")
    WARNINGS=$(grep -c "warning" /tmp/eslint.log || echo "0")
    
    if [ "$ERRORS" -gt 0 ]; then
        print_error "ESLint found $ERRORS error(s)"
    fi
    
    if [ "$WARNINGS" -gt 0 ]; then
        print_warning "ESLint found $WARNINGS warning(s)"
    fi
else
    print_success "No linting issues"
fi

# =====================================================
# SECTION 12: Unit Tests
# =====================================================

print_header "1️⃣2️⃣  Unit Tests"

if [ -f "package.json" ] && grep -q '"test"' package.json; then
    print_step "Running unit tests..."
    
    if npm run test 2>&1 | tee /tmp/tests.log | grep -qE "PASS|FAIL"; then
        PASSED=$(grep -c "PASS" /tmp/tests.log || echo "0")
        FAILED=$(grep -c "FAIL" /tmp/tests.log || echo "0")
        
        if [ "$FAILED" -eq 0 ]; then
            print_success "All unit tests passed ($PASSED tests)"
        else
            print_error "$FAILED test(s) failed, $PASSED passed"
        fi
    else
        print_warning "No test results found"
    fi
else
    print_info "No unit tests configured"
fi

# =====================================================
# SECTION 13: E2E Tests (Optional)
# =====================================================

print_header "1️⃣3️⃣  E2E Tests (Playwright)"

if [ -f "playwright.config.ts" ]; then
    print_step "Checking Playwright installation..."
    
    if npx playwright --version &> /dev/null; then
        print_success "Playwright is installed"
        
        read -p "Run E2E tests? (may take 1-2 minutes) [y/N] " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_step "Running E2E tests..."
            
            if npm run test:e2e 2>&1 | tee /tmp/e2e.log; then
                print_success "E2E tests completed"
            else
                print_error "E2E tests failed - check /tmp/e2e.log"
            fi
        else
            print_info "Skipping E2E tests"
        fi
    else
        print_warning "Playwright not installed (run: npx playwright install)"
    fi
else
    print_info "No E2E tests configured"
fi

# =====================================================
# SECTION 14: Performance Check
# =====================================================

print_header "1️⃣4️⃣  Performance Metrics"

print_step "Checking Docker resource usage..."

CONTAINER_STATS=$(docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep streamperf)

echo "$CONTAINER_STATS"

APP_CPU=$(echo "$CONTAINER_STATS" | grep streamperf-app | awk '{print $2}' | sed 's/%//')
APP_MEM=$(echo "$CONTAINER_STATS" | grep streamperf-app | awk '{print $3}')

print_info "App CPU: ${APP_CPU}%"
print_info "App Memory: $APP_MEM"

if (( $(echo "$APP_CPU < 80" | bc -l) )); then
    print_success "CPU usage is healthy (< 80%)"
else
    print_warning "High CPU usage: ${APP_CPU}%"
fi

# =====================================================
# SECTION 15: Security Checks
# =====================================================

print_header "1️⃣5️⃣  Security Validation"

print_step "Checking exposed secrets..."

if grep -r "sk_live_" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
    print_error "Potential API keys found in code!"
else
    print_success "No exposed secrets detected"
fi

print_step "Checking security headers..."

HEADERS=$(curl -s -I http://localhost:3000/ 2>/dev/null || echo "")

SECURITY_HEADERS=(
    "X-Frame-Options"
    "X-Content-Type-Options"
    "Strict-Transport-Security"
)

for header in "${SECURITY_HEADERS[@]}"; do
    if echo "$HEADERS" | grep -qi "$header"; then
        print_success "$header header present"
    else
        print_warning "$header header missing"
    fi
done

# =====================================================
# SECTION 16: Build Test
# =====================================================

print_header "1️⃣6️⃣  Production Build"

read -p "Test production build? (may take 2-3 minutes) [y/N] " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Building for production..."
    
    BUILD_START=$(date +%s)
    
    if npm run build 2>&1 | tee /tmp/build.log; then
        BUILD_TIME=$(measure_time $BUILD_START)
        print_success "Production build successful (${BUILD_TIME}s)"
        
        # Check build size
        if [ -d ".next" ]; then
            BUILD_SIZE=$(du -sh .next 2>/dev/null | awk '{print $1}')
            print_info "Build size: $BUILD_SIZE"
        fi
    else
        print_error "Production build failed - check /tmp/build.log"
    fi
else
    print_info "Skipping production build"
fi

# =====================================================
# SECTION 17: Lighthouse Audit (Optional)
# =====================================================

print_header "1️⃣7️⃣  Lighthouse Audit"

if command -v lighthouse &> /dev/null; then
    read -p "Run Lighthouse audit? (may take 1 minute) [y/N] " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Running Lighthouse..."
        
        lighthouse http://localhost:3000 \
            --output=json \
            --output-path=/tmp/lighthouse.json \
            --chrome-flags="--headless" \
            --quiet 2>/dev/null
        
        if [ -f "/tmp/lighthouse.json" ]; then
            PERF_SCORE=$(jq '.categories.performance.score * 100' /tmp/lighthouse.json)
            A11Y_SCORE=$(jq '.categories.accessibility.score * 100' /tmp/lighthouse.json)
            BEST_SCORE=$(jq '.categories["best-practices"].score * 100' /tmp/lighthouse.json)
            SEO_SCORE=$(jq '.categories.seo.score * 100' /tmp/lighthouse.json)
            PWA_SCORE=$(jq '.categories.pwa.score * 100' /tmp/lighthouse.json)
            
            print_info "Performance: $PERF_SCORE/100"
            print_info "Accessibility: $A11Y_SCORE/100"
            print_info "Best Practices: $BEST_SCORE/100"
            print_info "SEO: $SEO_SCORE/100"
            print_info "PWA: $PWA_SCORE/100"
            
            if (( $(echo "$PERF_SCORE >= 85" | bc -l) )); then
                print_success "Performance score is excellent"
            else
                print_warning "Performance score below target (85)"
            fi
        fi
    fi
else
    print_info "Lighthouse not installed (npm install -g lighthouse)"
fi

# =====================================================
# SECTION 18: Cleanup & Summary
# =====================================================

print_header "1️⃣8️⃣  Cleanup"

read -p "Stop Docker containers? [y/N] " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Stopping containers..."
    docker-compose down
    print_success "Containers stopped"
else
    print_info "Containers left running"
fi

# =====================================================
# FINAL SUMMARY
# =====================================================

END_TIME=$(date +%s)
TOTAL_TIME=$(measure_time $START_TIME)

echo ""
print_header "${ROCKET} VALIDATION SUMMARY ${ROCKET}"
echo ""

echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│${NC}  Test Results                           ${CYAN}│${NC}"
echo -e "${CYAN}├─────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC}  ${GREEN}✅ Passed:${NC}    $(printf '%3d' $TESTS_PASSED)                      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  ${RED}❌ Failed:${NC}    $(printf '%3d' $TESTS_FAILED)                      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  ${YELLOW}⚠️  Warnings:${NC}  $(printf '%3d' $TESTS_WARNINGS)                      ${CYAN}│${NC}"
echo -e "${CYAN}├─────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC}  ${CLOCK} Total Time: $(printf '%4d' $TOTAL_TIME)s                   ${CYAN}│${NC}"
echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
echo ""

# Final verdict
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ${FIRE}${FIRE} ${GREEN}READY FOR PRODUCTION${NC} ${FIRE}${FIRE}          ${GREEN}║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
    echo ""
    print_success "All critical tests passed!"
    print_info "Next steps:"
    echo "  1. Review warnings (if any)"
    echo "  2. Commit changes: git commit -am 'Ready for production'"
    echo "  3. Tag release: git tag v1.0.0"
    echo "  4. Deploy: make deploy"
    echo ""
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}     ${CROSS} ${RED}NOT READY FOR PRODUCTION${NC}      ${RED}║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════╝${NC}"
    echo ""
    print_error "$TESTS_FAILED test(s) failed"
    print_info "Please fix the errors before deploying"
    echo ""
    
    # Show logs location
    echo -e "${YELLOW}Debug logs available at:${NC}"
    echo "  - /tmp/typecheck.log"
    echo "  - /tmp/eslint.log"
    echo "  - /tmp/tests.log"
    echo "  - /tmp/build.log"
    echo ""
    echo "Run with Docker logs:"
    echo "  docker-compose logs app"
    echo ""
    exit 1
fi
