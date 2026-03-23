# Fly.io — Comandos Importantes

## Deploy

```bash
fly deploy --remote-only
```

## Logs

```bash
fly logs                    # Logs em tempo real
fly logs --app odontotec    # Especificando o app
```

## Secrets (variáveis de ambiente)

```bash
fly secrets list            # Listar secrets configurados
fly secrets set KEY="value" # Adicionar/atualizar secret
fly secrets unset KEY       # Remover secret
```

## Status e Monitoramento

```bash
fly status                  # Status do app
fly apps list               # Listar apps
fly machine list            # Listar máquinas
```

## Domínio e SSL

```bash
fly certs list                          # Listar certificados
fly certs check api.odontoehtec.com     # Verificar status do certificado
fly certs create api.odontoehtec.com    # Criar certificado para domínio
```

## Rollback

```bash
fly releases                            # Listar releases
fly deploy --image <image-da-release>   # Voltar para release anterior
```

## SSH e Debug

```bash
fly ssh console             # Acessar o container via SSH
fly ssh console -C "node -e 'console.log(process.env.NODE_ENV)'"  # Rodar comando remoto
```

## Escala

```bash
fly scale show              # Ver configuração atual
fly scale count 1           # Definir número de máquinas
fly scale vm shared-cpu-1x  # Definir tipo de máquina
```
