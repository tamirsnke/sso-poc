# SSO POC with Keycloak, Angular, and Node.js

## Overview

This project demonstrates a scalable Single Sign-On (SSO) architecture using Keycloak for authentication, two Angular applications as frontends, and two Node.js APIs as backends. It covers:

- SSO login/logout across multiple apps
- User roles and protected routes
- Token validation and security best practices
- Dockerized Keycloak setup

## Structure

- `keycloak/` — Keycloak Docker setup and configuration
- `apps/angular-app-1/` — First Angular frontend
- `apps/angular-app-2/` — Second Angular frontend
- `apis/node-api-1/` — First Node.js backend API
- `apis/node-api-2/` — Second Node.js backend API

## Getting Started

1. Set up and run Keycloak using Docker
2. Configure realms, clients, and users in Keycloak
3. Start Angular apps and Node.js APIs
4. Test SSO login/logout and API protection

## Next Steps

- Implement Keycloak Docker setup
- Scaffold Angular and Node.js projects
- Add documentation for each step

---

For detailed instructions, see the README sections in each subfolder.
