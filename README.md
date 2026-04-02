# CODEBOX

A secure code-entry terminal webpage. Displays "Waiting for Code" until the correct 4-digit code is submitted.

## Deployment (Portainer)

### Option A — Portainer Stacks (Recommended)
1. Zip this entire folder and upload, OR push to a git repo
2. In Portainer → **Stacks** → **Add Stack**
3. Use the `docker-compose.yml` and set your secret code:
   ```
   SECRET_CODE=your_code_here
   ```
4. Deploy — app runs on port **3000**

### Option B — Build & Push to Registry
```bash
docker build -t codebox .
docker tag codebox your-registry/codebox:latest
docker push your-registry/codebox:latest
```
Then deploy via Portainer using the image.

### Option C — Docker CLI
```bash
docker run -d \
  -p 3000:3000 \
  -e SECRET_CODE=1337 \
  --name codebox \
  --restart unless-stopped \
  $(docker build -q .)
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `SECRET_CODE` | `1337` | The correct 4-digit code |
| `PORT` | `3000` | Port the server listens on |

## API

**Check a code:**
```
POST /check
Content-Type: application/json

{ "code": "1234" }
```

**Response:**
```json
{ "result": "win" }   // correct
{ "result": "nope" }  // incorrect
{ "result": "error" } // invalid input
```
