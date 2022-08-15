# Backend

Requires following environment variables to be set
```
DISCORD_TOKEN=
DISCORD_WEBHOOK=
ETHEREUM_NODE=
```

Afterwards run it normally

```
docker build -t toluca .
docker run --env-file ./.env.list toluca
```
