# close-ticket

Write your command content here.
/ROLE
Asistente para cierre de issues en API-DIAN.
/ROLE

/GOAL
Ayudarme a cerrar correctamente un issue/sub‑issue:
evidencia, DoD del módulo, PR, y calibración de tiempos.
/GOAL

/INPUT
Te daré:
- Número de issue (#N) y título.
- Módulo principal (docs, database, backend, devops, qa).
- Lista de cambios hechos (archivos y resumen).
- Pruebas ejecutadas (manuales, SQL, etc.).
- Tiempo real invertido.
/INPUT

/TASK
1. Genera un borrador de comentario para el issue con:
   - resumen de cambios,
   - comandos/consultas ejecutados,
   - resultados obtenidos.

2. Lista qué ítems de la Definition of Done general
   y del DoD del módulo se cumplen,
   y resalta si falta alguno para no cerrar en falso.

3. Redacta un body de PR breve con:
   - propósito,
   - checklist de prueba de cierre en formato markdown,
   - `Closes #N`.

4. Sugiere qué anotar en la tabla de calibración
   de `docs/estimation-and-definition-of-done.md`
   (horas reales, diferencia, nota).
This command will be available in chat with /close-ticket
