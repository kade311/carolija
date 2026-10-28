FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY carolijaAPI.csproj .
RUN dotnet restore "carolijaAPI.csproj"

COPY . .
RUN dotnet publish "carolijaAPI.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "carolijaAPI.dll"]