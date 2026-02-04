# Деплой в Dokploy

База данных (PostgreSQL) уже запущена отдельно. Креды и настройки задаются переменными окружения в Dokploy.

## 1. Создать проект в Dokploy

- Создайте новый проект.
- Добавьте сервис типа **Docker Compose**.
- Укажите репозиторий или загрузите код; в качестве файла Compose выберите **docker-compose.dokploy.yml** (или скопируйте его содержимое в редактор Dokploy).

## 2. Переменные окружения

Задайте в настройках проекта/сервиса (Environment Variables в Dokploy):

### Обязательные

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DJANGO_SECRET_KEY` | Секретный ключ Django (длина ≥ 50 символов) | случайная строка |
| `DB_NAME` | Имя БД PostgreSQL | `pumakarate` |
| `DB_USER` | Пользователь БД | `puma` |
| `DB_PASSWORD` | Пароль БД | ваш пароль |
| `DB_HOST` | Хост БД (внешний или имя сервиса в Dokploy) | `postgres` или IP/домен |
| `MINIO_ACCESS_KEY` | Access key для S3/MinIO | ваш ключ |
| `MINIO_SECRET_KEY` | Secret key для S3/MinIO | ваш секрет |

### Опциональные

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DJANGO_DEBUG` | `False` | `True` только для отладки |
| `DJANGO_ALLOWED_HOSTS` | `*` | Через запятую: `yourdomain.com,www.yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | — | Через запятую, без пробелов: `https://app.example.com` |
| `CSRF_TRUSTED_ORIGINS` | — | Те же домены, что и фронт: `https://app.example.com` |
| `USE_S3` | `True` | Хранить медиа в S3/MinIO |
| `MINIO_ENDPOINT_URL` | `https://s3-ef-minio.jkproduction.pro` | Endpoint MinIO |
| `MINIO_BUCKET_NAME` | `puma` | Название bucket |
| `MINIO_REGION` | `us-east-1` | Регион bucket |
| `MINIO_ADDRESSING_STYLE` | `path` | Стиль адресации (path/virtual) |
| `MINIO_QUERYSTRING_AUTH` | `True` | Подписывать URL query-параметрами (нужно для приватного bucket) |
| `MINIO_QUERYSTRING_EXPIRE` | `3600` | Время жизни подписанного URL в секундах |
| `MINIO_VERIFY_SSL` | `True` | Проверять SSL сертификат MinIO |
| `VITE_API_URL` | пусто | Для сборки фронта: если API и фронт на одном домене — оставить пустым |

Если фронт и бэк доступны по одному домену (через reverse proxy Dokploy), оставьте `VITE_API_URL` пустым — запросы идут на тот же origin, nginx во фронт-контейнере проксирует `/api` на backend.

## 3. Сборка и запуск

- **Build:** Dokploy соберёт образы из `backend/Dockerfile` и `frontend/Dockerfile`.
- При первом запуске backend выполнит `migrate`, затем запустится gunicorn.
- Frontend отдаёт статику и проксирует `/api`, `/admin`, `/swagger` на сервис `backend:8000`.
- Загружаемые файлы (аватары/изображения) сохраняются в MinIO bucket `puma` при `USE_S3=True`.

## 4. Порты и сеть

- В `docker-compose.dokploy.yml` frontend наружу на `23561:80`, backend наружу на `23562:8000`.
- Если Dokploy/DSM настраивает reverse proxy, направляйте фронт на порт `23561`, backend на `23562`.

## 5. Проверка

- Откройте в браузере URL фронта (домен или `IP:3000`).
- Войдите или зарегистрируйтесь; при корректных CORS/CSRF и куках сессия должна работать.

## Локальная проверка Compose (без Dokploy)

```bash
# Экспорт переменных (подставьте свои значения)
export DJANGO_SECRET_KEY=your-secret-key
export DB_NAME=pumakarate
export DB_USER=puma
export DB_PASSWORD=your-db-password
export DB_HOST=host.docker.internal  # или IP хоста с PostgreSQL
export DB_PORT=5432
export USE_S3=True
export MINIO_ENDPOINT_URL=https://s3-ef-minio.jkproduction.pro
export MINIO_ACCESS_KEY=your-minio-access-key
export MINIO_SECRET_KEY=your-minio-secret-key
export MINIO_BUCKET_NAME=puma
export MINIO_REGION=us-east-1
export MINIO_QUERYSTRING_AUTH=True
export MINIO_QUERYSTRING_EXPIRE=3600

docker compose -f docker-compose.dokploy.yml up --build
```

Фронт будет на http://localhost:23561; backend — на http://localhost:23562.
