# Giai đoạn 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy đúng tên thư mục và file (Lưu ý: Connect.API và các tên khác)
COPY ["Connect.Backend/Connect.API/Connect.API.csproj", "Connect.Backend/Connect.API/"]
COPY ["Connect.Backend/Connect.Domain/Connect.Domain.csproj", "Connect.Backend/Connect.Domain/"]
COPY ["Connect.Backend/Connect.Application/Connect.Application.csproj", "Connect.Backend/Connect.Application/"]
COPY ["Connect.Backend/Connect.Infrastructure/Connect.Infrastructure.csproj", "Connect.Backend/Connect.Infrastructure/"]

# Restore đúng project API
RUN dotnet restore "Connect.Backend/Connect.API/Connect.API.csproj"

COPY . .

# Publish đúng project API
RUN dotnet publish "Connect.Backend/Connect.API/Connect.API.csproj" -c Release -o /app/publish

# Giai đoạn 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# Tên file dll thường sẽ là tên project (Connect.API.dll)
ENTRYPOINT ["dotnet", "Connect.API.dll"]