# Carolija API

## Local setup

Ovaj projekat vise ne drzi osjetljive podatke u repozitoriju. Za lokalno pokretanje treba postaviti vrijednosti kroz `.NET user-secrets`.

Primjer:

```powershell
dotnet user-secrets set "JWT:Secret" "YOUR_LONG_RANDOM_SECRET"
dotnet user-secrets set "ImgBB:ApiKey" "YOUR_IMGBB_KEY"
dotnet user-secrets set "Turnstile:SiteKey" "YOUR_TURNSTILE_SITE_KEY"
dotnet user-secrets set "Turnstile:SecretKey" "YOUR_TURNSTILE_SECRET_KEY"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=YOUR_HOST;Database=Carolija;Username=YOUR_USERNAME;Password=YOUR_PASSWORD;SSL Mode=Require;"
```

## Pokretanje

1. U `carolijaAPI` folderu postaviti user-secrets.
2. Pokrenuti migracije:

```powershell
dotnet ef database update
```

3. Pokrenuti API:

```powershell
dotnet run
```

Siguran template konfiguracije nalazi se u [appsettings.Example.json](C:\Users\DT User\Desktop\Carolija\carolijaAPI\appsettings.Example.json).

API koristi PostgreSQL preko Npgsql. Nakon postavljanja PostgreSQL connection stringa, kreiraj i primijeni migracije:

```powershell
dotnet ef migrations add InitialPostgres
dotnet ef database update
```

Postojeće SQL Server migracije su zamijenjene PostgreSQL početnom migracijom. Ova migracija kreira novu PostgreSQL bazu, ali ne prenosi podatke iz stare SQL Server baze. Podatke treba izvesti i migrirati zasebno ako su potrebni.
