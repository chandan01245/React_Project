# Use an official Python image
FROM python:3.12

WORKDIR /app

COPY Backend/ ./

RUN pip install --upgrade pip
RUN pip install -r requirements.txt 

RUN apt-get update && apt-get install -y iputils-ping netcat-openbsd

EXPOSE 5000

CMD ["python", "app.py"]