\set ON_ERROR_STOP on

\if :{?api_password}
\else
  \echo 'Missing required psql variable: api_password'
  \quit 3
\endif
\if :{?worker_password}
\else
  \echo 'Missing required psql variable: worker_password'
  \quit 3
\endif
\if :{?ops_password}
\else
  \echo 'Missing required psql variable: ops_password'
  \quit 3
\endif

SELECT format(
  'CREATE ROLE api_dian_dev LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'api_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'api_dian_dev')
\gexec

SELECT format(
  'ALTER ROLE api_dian_dev PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'api_password'
)
\gexec
REVOKE app_worker, app_ops, app_ops_control, app_migrator FROM api_dian_dev;
GRANT app_api TO api_dian_dev;

SELECT format(
  'CREATE ROLE api_dian_worker_dev LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'worker_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'api_dian_worker_dev')
\gexec

SELECT format(
  'ALTER ROLE api_dian_worker_dev PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'worker_password'
)
\gexec
REVOKE app_api, app_ops, app_ops_control, app_migrator FROM api_dian_worker_dev;
GRANT app_worker TO api_dian_worker_dev;

SELECT format(
  'CREATE ROLE api_dian_ops_dev LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'ops_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'api_dian_ops_dev')
\gexec

SELECT format(
  'ALTER ROLE api_dian_ops_dev PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'ops_password'
)
\gexec
REVOKE app_api, app_worker, app_migrator FROM api_dian_ops_dev;
GRANT app_ops, app_ops_control TO api_dian_ops_dev;

SELECT
  r.rolname,
  r.rolsuper,
  r.rolcreatedb,
  r.rolcreaterole,
  r.rolbypassrls
FROM pg_roles AS r
WHERE r.rolname IN ('api_dian_dev', 'api_dian_worker_dev', 'api_dian_ops_dev')
ORDER BY r.rolname;
