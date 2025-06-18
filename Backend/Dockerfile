# Use an official Python image
FROM python:3.12

WORKDIR /app

COPY Backend/ ./

RUN pip install --upgrade pip
RUN pip install -r Pipfile

EXPOSE 5000

CMD ["python", "app.py"]