# Use official Python base image
FROM python:3.13-slim

# Create a non-root user (Hugging Face requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY --chown=user . /app

# Hugging Face expects apps to run on port 7860
EXPOSE 7860

# Command to run Flask app
CMD ["python", "app.py"]
