import json
import os
import sys
from pathlib import Path

# Ensure working environment variables for static export
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("DATABASE_URL", "sqlite:///./dummy.db")

# Add backend/gamelog directory to sys.path
backend_gamelog_dir = Path(__file__).resolve().parent.parent / "gamelog"
if str(backend_gamelog_dir) not in sys.path:
    sys.path.insert(0, str(backend_gamelog_dir))

from src.main import app  # noqa: E402


def export_openapi(output_paths: list[Path]) -> None:
    openapi_schema = app.openapi()
    content = json.dumps(openapi_schema, indent=2, sort_keys=True) + "\n"

    for path in output_paths:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(f"Exported OpenAPI schema to: {path}")


if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent.parent.parent
    docs_openapi = repo_root / "docs" / "openapi.json"
    mobile_contracts_openapi = repo_root / "mobile-app" / "contracts" / "openapi.json"

    export_openapi([docs_openapi, mobile_contracts_openapi])
