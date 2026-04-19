FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /src

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen

RUN addgroup --system app && adduser --system --ingroup app app
RUN mkdir -p /home/app/.cache/uv \
	&& chown -R app:app /src /home/app

ENV HOME=/home/app
ENV XDG_CACHE_HOME=/home/app/.cache
ENV UV_CACHE_DIR=/home/app/.cache/uv

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/hello')" || exit 1

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
