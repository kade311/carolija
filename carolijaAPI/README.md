# Carolija API

## Local setup

Ovaj projekat vise ne drzi osjetljive podatke u repozitoriju. Za lokalno pokretanje treba postaviti vrijednosti kroz `.NET user-secrets`.

Primjer:

```powershell
dotnet user-secrets set "JWT:Secret" "YOUR_LONG_RANDOM_SECRET"
dotnet user-secrets set "ImgBB:ApiKey" "YOUR_IMGBB_KEY"
dotnet user-secrets set "Turnstile:SiteKey" "YOUR_TURNSTILE_SITE_KEY"
dotnet user-secrets set "Turnstile:SecretKey" "YOUR_TURNSTILE_SECRET_KEY"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=YOUR_SERVER;Database=Carolija;Trusted_Connection=True;TrustServerCertificate=True;"
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
