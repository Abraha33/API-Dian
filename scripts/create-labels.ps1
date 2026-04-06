# create-labels.ps1
# Crea o actualiza todos los labels del proyecto API-DIAN
# Uso: .\scripts\create-labels.ps1
# Requiere: gh CLI autenticado

$repo = "Abraha33/API-Dian"

$labels = @(
  # role-*
  @{ name = "role-backend";   color = "0075ca"; description = "Trabajo de backend / API" },
  @{ name = "role-database";  color = "e4e669"; description = "Base de datos, SQL, migraciones" },
  @{ name = "role-frontend";  color = "d93f0b"; description = "Frontend / UI" },
  @{ name = "role-devops";    color = "0e8a16"; description = "CI/CD, infra, despliegue" },
  @{ name = "role-docs";      color = "cfd3d7"; description = "Documentacion" },
  @{ name = "role-qa";        color = "f9d0c4"; description = "Pruebas y calidad" },

  # type-*
  @{ name = "type-feature";   color = "a2eeef"; description = "Nueva capacidad" },
  @{ name = "type-bug";       color = "d73a4a"; description = "Defecto" },
  @{ name = "type-chore";     color = "fef2c0"; description = "Mantenimiento / tareas auxiliares" },
  @{ name = "type-docs";      color = "cfd3d7"; description = "Cambios solo de documentacion" },
  @{ name = "type-migration"; color = "e4e669"; description = "Migracion de esquema (BD)" },
  @{ name = "type-refactor";  color = "d4c5f9"; description = "Refactor sin cambiar comportamiento" },
  @{ name = "type-test";      color = "0075ca"; description = "Tests / cobertura" },

  # size-*
  @{ name = "size-XS"; color = "c5def5"; description = "Talla XS: menos de 30 min" },
  @{ name = "size-S";  color = "0075ca"; description = "Talla S: 1 a 2 horas" },
  @{ name = "size-M";  color = "e4e669"; description = "Talla M: medio dia aproximado" },
  @{ name = "size-L";  color = "f9a825"; description = "Talla L: un dia aproximado" },
  @{ name = "size-XL"; color = "d73a4a"; description = "Talla XL: mas de un dia, dividir en issues menores" },

  # module-*
  @{ name = "module-plataforma-tenants";       color = "bfd4f2"; description = "Multi-tenant, plataforma base" },
  @{ name = "module-integrador-api";           color = "ffd700"; description = "Integracion con integrador / canal salida" },
  @{ name = "module-documentos-fiscales";      color = "ff9500"; description = "Modelo y ciclo de documentos fiscales" },
  @{ name = "module-emision-dian";             color = "e11d48"; description = "Emision y envio ante DIAN" },
  @{ name = "module-procesamiento-interno";    color = "7c3aed"; description = "Colas, workers, procesamiento interno" },
  @{ name = "module-notificacion-adquiriente"; color = "059669"; description = "Notificacion al adquiriente" },
  @{ name = "module-observabilidad-gobierno";  color = "0891b2"; description = "Logs, metricas, operacion" },
  @{ name = "module-cumplimiento-dian";        color = "dc2626"; description = "Cumplimiento y normativa DIAN" },

  # track-* (paquetes de F0)
  @{ name = "track-workflow-ia";      color = "f0fdf4"; description = "F0: workflow e IA (Perplexity, Cursor)" },
  @{ name = "track-plantillas";       color = "fef9c3"; description = "F0: plantillas issues y sesiones" },
  @{ name = "track-contexto-docs";    color = "eff6ff"; description = "F0: contexto minimo y docs persistentes" },
  @{ name = "track-cli-supabase";     color = "fdf4ff"; description = "F0: CLI Supabase e introspeccion" },
  @{ name = "track-criterios-cierre"; color = "fff7ed"; description = "F0: DoD y estimacion" },

  # priority-*
  @{ name = "priority-high";   color = "b60205"; description = "Prioridad alta" },
  @{ name = "priority-medium"; color = "fbca04"; description = "Prioridad media" },
  @{ name = "priority-low";    color = "0e8a16"; description = "Prioridad baja" },

  # estado
  @{ name = "blocked";          color = "e4e669"; description = "Bloqueado (dependencia o decision)" },
  @{ name = "needs-discussion"; color = "cc317c"; description = "Requiere discusion antes de implementar" }
)

foreach ($label in $labels) {
  Write-Host "Creando label: $($label.name)"
  gh label create $label.name `
    --repo $repo `
    --color $label.color `
    --description $label.description `
    --force
}

Write-Host ""
Write-Host "Labels creados. Verificando..."
gh label list --repo $repo --limit 100
