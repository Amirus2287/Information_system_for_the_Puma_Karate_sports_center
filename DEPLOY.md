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

### Опциональные

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DJANGO_DEBUG` | `False` | `True` только для отладки |
| `DJANGO_ALLOWED_HOSTS` | `*` | Через запятую: `yourdomain.com,www.yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | — | Через запятую, без пробелов: `https://app.example.com` |
| `CSRF_TRUSTED_ORIGINS` | — | Те же домены, что и фронт: `https://app.example.com` |
| `VITE_API_URL` | пусто | Для сборки фронта: если API и фронт на одном домене — оставить пустым |

Если фронт и бэк доступны по одному домену (через reverse proxy Dokploy), оставьте `VITE_API_URL` пустым — запросы идут на тот же origin, nginx во фронт-контейнере проксирует `/api` на backend.

## 3. Сборка и запуск

- **Build:** Dokploy соберёт образы из `backend/Dockerfile` и `frontend/Dockerfile`.
- При первом запуске backend выполнит `migrate`, затем запустится gunicorn.
- Frontend отдаёт статику и проксирует `/api` на сервис `backend:8000`.

## 4. Порты и сеть

- В `docker-compose.dokploy.yml` наружу открыт только **frontend** (порт 80). Backend доступен внутри сети по имени `backend`.
- Если Dokploy сам настраивает reverse proxy (Traefik и т.п.), привяжите домен к сервису **frontend** (порт 80).

## 5. Проверка

- Откройте в браузере URL фронта (домен или IP:80).
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

docker compose -f docker-compose.dokploy.yml up --build
```

Фронт будет на http://localhost:80; backend — только внутри сети.
