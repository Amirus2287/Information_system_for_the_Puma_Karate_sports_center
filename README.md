# Информационная система спортивного центра «Пума Карате»

Веб-приложение для учёта тренировок, соревнований, достижений и журнала учеников спортивного центра.

## Стек

- **Backend:** Django 4.2, DRF, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Bun

## Локальный запуск

### Требования

- Python 3.11+, [uv](https://github.com/astral-sh/uv) (или pip)
- Node 20+ или Bun
- PostgreSQL (или SQLite для разработки)

### Backend

```bash
cd backend
cp .env.example .env   # заполнить креды БД
uv sync               # или: pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
bun install
bun run dev
```

Фронт по умолчанию на http://localhost:5173, проксирует `/api` на бэкенд (порт 8000).

## Деплой (Dokploy)

Инструкция по развёртыванию через [Dokploy](https://dokploy.com): см. [DEPLOY.md](DEPLOY.md).

Кратко: база данных уже развёрнута отдельно, креды задаются переменными окружения. Используется `docker-compose.dokploy.yml` (backend + frontend без БД).

## Лицензия

См. [LICENSE](LICENSE).
