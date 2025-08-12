# Use an official Python image
FROM python:3.12-slim

# Install minimal build/runtime deps for psycopg2-binary (none) and runtime utils
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend source code into the container
COPY Backend/ ./

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Make startup script executable
RUN chmod +x startup.py

# Create a startup shell script
RUN echo '#!/bin/bash\npython startup.py\nexec gunicorn --bind 0.0.0.0:5000 app:app' > start.sh && \
    chmod +x start.sh

# Expose port 5000 for Flask
EXPOSE 5000

# Default to production server; override in dev via compose
ENV PYTHONUNBUFFERED=1
RUN useradd -ms /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Use startup shell script
CMD ["./start.sh"]
