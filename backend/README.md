# Backend Setup Guide
We use [`uv`](https://docs.astral.sh/uv/) to manage the Python environment and dependencies. No `pip`  or no `requirements.txt` is necessary as everything is handled through `pyproject.toml` and `uv.lock`.

## Quick Reference
| Task | Command |
|---|---|
| First setup | `uv sync` |
| Start dev server | `uv run uvicorn main:app --reload` |
| Add a package | `uv add <package>` |
| Sync after a pull | `uv sync` |
| Run a specific script | `uv run python <script.py>` |
| Run tests | `make test` |
| Run linter| `make lint` |
---

## Prerequisites — Install `uv`:

**macOS / Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
> You only need to do this once. Restart your terminal after installing.

Check that `uv` is installed correctly:
```bash
uv --version
```
If so navigate to the backend folder and run `uv sync` to install dependencies.
Starting from the root of the project:
```bash
cd backend
uv sync
```

---

## Minimal starting flow:
You **do not** need to activate the virtual environment manually. Just use `uv run` to prefix your commands:
```bash
# Start the dev server
uv run uvicorn main:app --reload

# Run a specific script
uv run python my_script.py
```
> `uv run` automatically uses the local `.venv` without you needing to activate it.
---

## Minimal commit flow:
Run tests:
```bash
make test
```
Run linter:
```bash
make lint
```
Commit your changes:
```bash
git add .
git commit -m "Your commit message"
git push
```
---

## Adding a New Dependency
If you need to add a new package:
```bash
uv add <package-name>
```
This updates both `pyproject.toml` and `uv.lock`. **Commit both files** so everyone gets the new dependency automatically on their next `uv sync`.
---

## After Pulling Changes from the Repo
If someone else added or updated a dependency, run:
```bash
uv sync
```
This keeps your local environment in sync with `uv.lock`.
---

## Automatic Documentation
FastAPI automatically generates interactive API docs. Once your dev server is running, you can access them at:
- Swagger UI: `http://localhost:8000/docs`

