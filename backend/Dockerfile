# =============================================================================
# Backend Multi-Stage Dockerfile (Python 3.11-slim + PyTorch CPU)
# =============================================================================

# Stage 1: Build & Dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build essentials for C extensions if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies in virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download NLTK stopwords and punkt to eliminate runtime delay
RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('punkt_tab', quiet=True)"

# Stage 2: Final Production Runner
FROM python:3.11-slim AS runner

WORKDIR /app

# Install runtime dependencies (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtualenv and NLTK data from builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /root/nltk_data /usr/share/nltk_data
ENV PATH="/opt/venv/bin:$PATH"
ENV NLTK_DATA="/usr/share/nltk_data"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create non-root system user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/bash -m appuser

# Copy application source
COPY . /app

# Ensure correct permissions for data and model directories
RUN mkdir -p /app/database /app/output /app/models && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Health check verifies Flask is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]
