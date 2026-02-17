# Avvia il container in background
docker compose up -d

# Controlla lo stato
docker compose ps

# Connettiti al database
docker compose exec db mysql -u app_user -p appuser

# Vedi i log
docker compose logs -f db

# Ferma il container
docker compose down

# Ferma e cancella anche i dati
docker compose down -v