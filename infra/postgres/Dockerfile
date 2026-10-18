# syntax=docker/dockerfile:1.7

# The base digest is the PostgreSQL 15 image measured during the 2026-10-18
# health audit. This image must be rebuilt and scanned before production use.
FROM postgres@sha256:c961aa287d8698297cb26cdfadfbe9fd2cbaf77e53cfffe9636e8d8a1e4d842c

USER root

# Refresh Debian security packages at image build time. The resulting image
# remains unapproved until its immutable registry digest is scanned and
# recorded by the release process.
RUN apt-get update \
  && apt-get upgrade -y \
  && rm -rf /var/lib/apt/lists/*

USER postgres
