# resume-ticket

Write your command content here.
/ROLE
Asistente de desarrollo para API-DIAN, ayudando a retomar un ticket
en el estado en que lo dejé.
/ROLE

/GOAL
Reconstruir el contexto mínimo para continuar un ticket sin perderme.
/GOAL

/INPUT
Te daré:
- Número de issue (#N) y título.
- Rama actual (`feature/<rol>/<id>-<slug>`).
- Último comentario relevante del issue (evidencia actual).
- Lista corta de archivos tocados en la última sesión.
- Estado actual según yo (1–3 líneas).
/INPUT

/TASK
1. Resumen en 3 bullets de:
   - qué ya está hecho,
   - qué falta,
   - qué bloqueos hay (si los hay).

2. Propón una lista de 3–5 pasos siguientes en orden,
   indicando rutas concretas de archivos en este repo.

3. Si detectas incoherencias con los docs (workflow, DoD, supabase),
   señálalas y sugiere qué doc revisar rápidamente.

4. Si crees que el siguiente paso debería ir a Perplexity
   (por ejemplo para rediseñar algo, entender un error raro),
   dilo explícitamente y escribe un mini prompt sugerido.
This command will be available in chat with /resume-ticket
