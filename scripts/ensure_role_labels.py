#!/usr/bin/env python3
"""Crea o actualiza los labels estándar API-DIAN con GitHub CLI (`gh`).

Ejecutar desde la raíz del repo: python scripts/ensure_role_labels.py
Requiere: gh instalado y autenticado (`gh auth login`).
"""

from __future__ import annotations

import subprocess
import sys

# (name, color sin #, description) — misma lista que scripts/create-labels.ps1
LABELS: list[tuple[str, str, str]] = [
    # role-*
    ("role-backend", "0075ca", "Trabajo de backend / API"),
    ("role-database", "e4e669", "Base de datos, SQL, migraciones"),
    ("role-frontend", "d93f0b", "Frontend / UI"),
    ("role-devops", "0e8a16", "CI/CD, infra, despliegue"),
    ("role-docs", "cfd3d7", "Documentación"),
    ("role-qa", "f9d0c4", "Pruebas y calidad"),
    # type-*
    ("type-feature", "a2eeef", "Nueva capacidad"),
    ("type-bug", "d73a4a", "Defecto"),
    ("type-chore", "fef2c0", "Mantenimiento / tareas auxiliares"),
    ("type-docs", "cfd3d7", "Cambios solo de documentación"),
    ("type-migration", "e4e669", "Migración de esquema (BD)"),
    ("type-refactor", "d4c5f9", "Refactor sin cambiar comportamiento"),
    ("type-test", "0075ca", "Tests / cobertura"),
    # module-*
    ("module-plataforma-tenants", "bfd4f2", "Multi-tenant, plataforma base"),
    ("module-integrador-api", "ffd700", "Integración con integrador / canal salida"),
    ("module-documentos-fiscales", "ff9500", "Modelo y ciclo de documentos fiscales"),
    ("module-emision-dian", "e11d48", "Emisión y envío ante DIAN"),
    ("module-procesamiento-interno", "7c3aed", "Colas, workers, procesamiento interno"),
    ("module-notificacion-adquiriente", "059669", "Notificación al adquiriente"),
    ("module-observabilidad-gobierno", "0891b2", "Logs, métricas, operación"),
    ("module-cumplimiento-dian", "dc2626", "Cumplimiento y normativa DIAN"),
    # track-* (F0)
    ("track-workflow-ia", "f0fdf4", "F0: workflow e IA (Perplexity, Cursor)"),
    ("track-plantillas", "fef9c3", "F0: plantillas issues y sesiones"),
    ("track-contexto-docs", "eff6ff", "F0: contexto mínimo y docs persistentes"),
    ("track-cli-supabase", "fdf4ff", "F0: CLI Supabase e introspección"),
    ("track-criterios-cierre", "fff7ed", "F0: DoD y estimación"),
    # prioridad
    ("priority-high", "b60205", "Prioridad alta"),
    ("priority-medium", "fbca04", "Prioridad media"),
    ("priority-low", "0e8a16", "Prioridad baja"),
    # estado
    ("blocked", "e4e669", "Bloqueado (dependencia o decisión)"),
    ("needs-discussion", "cc317c", "Requiere discusión antes de implementar"),
]


def main() -> int:
    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Instala e inicia sesión: https://cli.github.com/  (`gh auth login`)", file=sys.stderr)
        return 1

    for name, color, desc in LABELS:
        subprocess.run(
            [
                "gh",
                "label",
                "create",
                name,
                "--color",
                color,
                "--description",
                desc,
                "--force",
            ],
            check=False,
        )
    print("Listo. Revisa en Repo Settings → Labels.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
