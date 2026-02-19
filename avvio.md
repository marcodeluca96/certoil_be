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

# Query per vedere dati nel db

```sql
SELECT
	c.company_name ,
	CONCAT(od.name , ' ', od.value , ' ', od.unit ) as oil_data,
	c2.code ,
	c2.created_at ,
	d.document_path ,
	ic.notarizationId
FROM
	companies c
LEFT JOIN oil_data od
	ON
	od.company_id = c.id
LEFT JOIN certifications c2
	ON
	c2.company_id = c.id
LEFT JOIN documents d
	ON
	d.company_id = c.id
	AND d.certification_id = c2.id
LEFT JOIN iota_certifications ic
	on
	ic.certification_id = c2.id
```
