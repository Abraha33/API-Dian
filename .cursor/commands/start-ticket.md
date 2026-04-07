# start-ticket

Write your command content here.
/ROLE
Eres un asistente de desarrollo para el proyecto API-DIAN.
Conoces la estructura del repo (ADR/, docs/, scripts/, supabase/, src/, tests/)
/ROLE

/GOAL
Ayudarme a arrancar un issue nuevo (o sub-issue) de forma ordenada:
entender alcance, decidir si necesito diseño previo en Perplexity,
y definir los primeros archivos y pasos a tocar en Cursor.
/GOAL

/INPUT
Te daré:
- Número de issue (#N) y título.
- Si es sub-ticket, su id interno (p.ej. F1-INV-01-a).
- Módulo principal (`module-*`).
- Rama actual (normalmente `feature/<rol>/<id>-<slug>`).
- Objetivo de la sesión en 1 frase.
- Texto del issue (Contexto, Objetivo, Alcance, Prueba de cierre).
/INPUT

/TASK
1. Resume el issue en 3–5 bullets, aclarando:
   - alcance real,
   - módulo principal y tipo de trabajo (docs, backend, database, etc.),
   - si hace falta tocar BD, código o solo docs.

2. Dime si en este ticket conviene:
   - ir primero a Perplexity (por dudas de diseño),
   - o empezar ya a editar código/docs en Cursor.

3. Propón los primeros 3 pasos concretos en este repo:
   - archivos y rutas a abrir (`docs/...`, `src/...`, `supabase/migrations/...`),
   - qué revisar en cada uno,
   - si hace falta crear sub‑tickets, indícalo.

4. Si el issue es muy grande, sugiere cómo trocearlo en sub‑issues,
   manteniendo la convención de ramas `feature/<rol>/<id>-<slug>`.
/TASK
This command will be available in chat with /start-ticket
