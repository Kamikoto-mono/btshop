# Frontend deploy on VPS

This repository contains two Next.js apps:

- `apps/web` -> public storefront
- `apps/admin` -> admin panel

## Run with Docker

Upload this repo to the VPS, then start:

```bash
docker compose -f docker-compose.frontend.yml up -d --build
```

Ports:

- storefront: `3001`
- admin: `3002`

## Check containers

```bash
docker compose -f docker-compose.frontend.yml ps
docker compose -f docker-compose.frontend.yml logs -f web
docker compose -f docker-compose.frontend.yml logs -f admin
```

## Nginx reverse proxy

Example for storefront on the main domain:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name battletoads.shop www.battletoads.shop;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Example for admin on a subdomain:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name admin.battletoads.shop;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Notes

- Make sure the domain DNS points to the VPS before issuing HTTPS certificates.
- If you only need the storefront, you can run only the `web` service.
