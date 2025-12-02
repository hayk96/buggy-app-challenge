FROM python:3.12-alpine
WORKDIR /app
COPY src/requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 3000
ENTRYPOINT ["python", "src/main.py"]
