# create-labels.ps1
# Crea o actualiza todos los labels deseados del proyecto API-DIAN en GitHub.
# Requiere: gh CLI autenticado (`gh auth login`)
# Uso (desde la raíz del repo): .\scripts\create-labels.ps1
#
# Estado alineado con limpieza de labels (sin default GitHub ni Alta/Baja/Media/MVP/etc.).

$ErrorActionPreference = "Stop"

$labels = @(
  # Sprint-* (se mantienen por ahora)
  @{ name = "Sprint-0.1"; color = "0075ca"; description = "Iteración Sprint-0.1" },
  @{ name = "Sprint-0.2"; color = "0075ca"; description = "Iteración Sprint-0.2" },
  @{ name = "Sprint-1.1"; color = "0052cc"; description = "Iteración Sprint-1.1" },
  @{ name = "Sprint-1.2"; color = "0052cc"; description = "Iteración Sprint-1.2" },
  @{ name = "Sprint-1.3"; color = "0052cc"; description = "Iteración Sprint-1.3" },
  @{ name = "Sprint-1.4"; color = "0052cc"; description = "Iteración Sprint-1.4" },
  @{ name = "Sprint-2.1"; color = "5319e7"; description = "Iteración Sprint-2.1" },
  @{ name = "Sprint-2.2"; color = "5319e7"; description = "Iteración Sprint-2.2" },
  @{ name = "Sprint-3.1"; color = "e4e669"; description = "Iteración Sprint-3.1" },
  @{ name = "Sprint-4.1"; color = "f9d71c"; description = "Iteración Sprint-4.1" },
  @{ name = "Sprint-5.1"; color = "0e8a16"; description = "Iteración Sprint-5.1" },
  @{ name = "Sprint-5.2"; color = "0e8a16"; description = "Iteración Sprint-5.2" },
  # role-*
  @{ name = "role-backend";     color = "0075ca"; description = "Trabajo de backend / API" },
  @{ name = "role-database";    color = "e4e669"; description = "Base de datos, SQL, migraciones" },
  @{ name = "role-frontend";    color = "d93f0b"; description = "Frontend / UI" },
  @{ name = "role-devops";      color = "0e8a16"; description = "CI/CD, infra, despliegue" },
  @{ name = "role-docs";        color = "cfd3d7"; description = "Documentación" },
  @{ name = "role-qa";          color = "f9d0c4"; description = "Pruebas y calidad" },
  # type-*
  @{ name = "type-feature";     color = "a2eeef"; description = "Nueva capacidad" },
  @{ name = "type-bug";         color = "d73a4a"; description = "Defecto" },
  @{ name = "type-chore";       color = "fef2c0"; description = "Mantenimiento / tareas auxiliares" },
  @{ name = "type-docs";        color = "cfd3d7"; description = "Cambios solo de documentación" },
  @{ name = "type-migration";   color = "e4e669"; description = "Migración de esquema (BD)" },
  @{ name = "type-refactor";    color = "d4c5f9"; description = "Refactor sin cambiar comportamiento" },
  @{ name = "type-test";        color = "0075ca"; description = "Tests / cobertura" },
  # module-*
  @{ name = "module-plataforma-tenants";        color = "bfd4f2"; description = "Multi-tenant, plataforma base" },
  @{ name = "module-integrador-api";            color = "ffd700"; description = "Integración con integrador / canal salida" },
  @{ name = "module-documentos-fiscales";       color = "ff9500"; description = "Modelo y ciclo de documentos fiscales" },
  @{ name = "module-emision-dian";              color = "e11d48"; description = "Emisión y envío ante DIAN" },
  @{ name = "module-procesamiento-interno";     color = "7c3aed"; description = "Colas, workers, procesamiento interno" },
  @{ name = "module-notificacion-adquiriente";  color = "059669"; description = "Notificación al adquiriente" },
  @{ name = "module-observabilidad-gobierno";   color = "0891b2"; description = "Logs, métricas, operación" },
  @{ name = "module-cumplimiento-dian";         color = "dc2626"; description = "Cumplimiento y normativa DIAN" },
  # track-* (F0)
  @{ name = "track-workflow-ia";      color = "f0fdf4"; description = "F0: workflow e IA (Perplexity, Cursor)" },
  @{ name = "track-plantillas";       color = "fef9c3"; description = "F0: plantillas issues y sesiones" },
  @{ name = "track-contexto-docs";    color = "eff6ff"; description = "F0: contexto mínimo y docs persistentes" },
  @{ name = "track-cli-supabase";     color = "fdf4ff"; description = "F0: CLI Supabase e introspección" },
  @{ name = "track-criterios-cierre"; color = "fff7ed"; description = "F0: DoD y estimación" },
  # prioridad
  @{ name = "priority-high";   color = "b60205"; description = "Prioridad alta" },
  @{ name = "priority-medium"; color = "fbca04"; description = "Prioridad media" },
  @{ name = "priority-low";    color = "0e8a16"; description = "Prioridad baja" },
  # tallas
  @{ name = "size-XS"; color = "c5def5"; description = "Talla XS: ≤ 30 min" },
  @{ name = "size-S";  color = "0075ca"; description = "Talla S: 1-2 h" },
  @{ name = "size-M";  color = "e4e669"; description = "Talla M: ~0.5 día" },
  @{ name = "size-L";  color = "f9a825"; description = "Talla L: ~1 día" },
  @{ name = "size-XL"; color = "d73a4a"; description = "Talla XL: >1 día, dividir en issues menores" },
  # estado
  @{ name = "blocked";           color = "e4e669"; description = "Bloqueado (dependencia o decisión)" },
  @{ name = "needs-discussion";  color = "cc317c"; description = "Requiere discusión antes de implementar" }
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "Instala GitHub CLI: https://cli.github.com/ y ejecuta gh auth login"
}

foreach ($label in $labels) {
    gh label create $label.name --color $label.color --description $label.description --force
}

Write-Host "Listo. Revisa en Repo Settings > Labels."
