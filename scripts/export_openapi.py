#!/usr/bin/env python3
"""
Exports OpenAPI JSON specification for contract testing and client generation.
"""

import json
import os
from pathlib import Path
import sys

# Ensure working environment variables for static export
os.environ.setdefault("USE_FIREBASE_EMULATOR", "true")
os.environ.setdefault("DATABASE_URL", "sqlite:///./dummy.db")

REPO_ROOT = Path(__file__).resolve().parent.parent
backend_gamelog_dir = REPO_ROOT / "backend" / "gamelog"

if str(backend_gamelog_dir) not in sys.path:
    sys.path.insert(0, str(backend_gamelog_dir))

try:
    from src.main import app  # noqa: E402
except ImportError:
    # If dependencies are missing from current python environment, invoke via uv
    import shutil
    import subprocess
    uv_path = shutil.which("uv")
    if uv_path:
        cmd = [uv_path, "run", "--project", str(backend_gamelog_dir), "python", __file__] + sys.argv[1:]
        result = subprocess.run(cmd)
        sys.exit(result.returncode)
    else:
        raise


def export_openapi(output_paths: list[Path]) -> None:
    openapi_schema = app.openapi()
    content = json.dumps(openapi_schema, indent=2, sort_keys=True) + "\n"

    for path in output_paths:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(f"✅ Exported OpenAPI schema to: {path.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    mobile_contracts_openapi = REPO_ROOT / "mobile-app" / "contracts" / "openapi.json"
    export_openapi([mobile_contracts_openapi])
