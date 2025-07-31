# Node API 2

This is a simple Express API protected by Keycloak JWT tokens.

## Usage

1. Set `KEYCLOAK_PUBLIC_KEY` in `.env` to your Keycloak realm public key (without PEM headers).
2. Run:
   ```powershell
   npm install
   npm start
   ```
3. Access `http://localhost:3002/protected` with a valid Bearer token.

---

Contains AI-generated edits.
