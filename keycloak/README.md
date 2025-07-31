# Keycloak Docker Setup

This folder contains the Docker Compose configuration and initial realm export for Keycloak.

## Usage

1. Start Keycloak:

   ```powershell
   docker-compose up
   ```

   Keycloak will be available at http://localhost:8080/auth

2. Login to the admin console:

   - Username: `admin`
   - Password: `admin`

3. The realm `sso-poc` will be preloaded with sample users, roles, and clients for the POC.

## Files

- `docker-compose.yml`: Keycloak Docker configuration
- `realm-export.json`: Preconfigured realm, users, roles, and clients

---

For more details, see the main project README.
