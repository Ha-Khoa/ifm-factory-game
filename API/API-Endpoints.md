# GameController API Endpoints

Diese Tabelle zeigt alle verfügbaren API-Endpoints des GameControllers mit ihren HTTP-Methoden, Parametern und Status Codes.

## Endpoint-Übersicht

| **HTTP-Methode** | **Endpoint** | **Parameter** | **Success** | **Error** |
|------------------|--------------|---------------|-------------|-----------|
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Players` | Keine | 200 OK | - |
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Player/{identifier}` | `identifier` (string) | 200 OK | 404 Not Found |
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Score/{identifier}` | `identifier` (string) | 200 OK | 404 Not Found |
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Money/{identifier}` | `identifier` (string) | 200 OK | 404 Not Found |
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Machine/{factoryId}/{machineId}` | `factoryId` (int), `machineId` (int) | 200 OK | 404 Not Found |
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Factory/{factoryId}` | `factoryId` (int) | 200 OK | 404 Not Found |
| <span style="color: #3B82F6; font-weight: bold;">POST</span> | `/api/Game/Player/{username}` | `username` (string) | 200 OK | 400 Bad Request |
| <span style="color: #3B82F6; font-weight: bold;">POST</span> | `/api/Game/Machine/{factoryId}/{machineId}` | `factoryId` (int), `machineId` (string) | 200 OK | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Score/{identifier}/{score}` | `identifier` (string), `score` (int) | 200 OK | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Money/{identifier}/{value}` | `identifier` (string), `value` (int) | 200 OK | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Money/{identifier}/Add/{value}` | `identifier` (string), `value` (int) | 200 OK | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Money/{identifier}/Remove/{value}` | `identifier` (string), `value` (int) | 200 OK | 404 Not Found, 409 Conflict |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Machine/{factoryId}/{machineId}/{level}` | `factoryId` (int), `machineId` (int), `level` (int) | 200 OK | 404 Not Found, 409 Conflict |
| <span style="color: #EF4444; font-weight: bold;">DELETE</span> | `/api/Game/Player/{identifier}` | `identifier` (string) | 200 OK | 404 Not Found |

---

## Detaillierte Fehlerbehandlung

### Status Code Legende

- **200 OK** - Die Anfrage war erfolgreich
- **400 Bad Request** - Die Anfrage enthält ungültige oder doppelte Daten
- **404 Not Found** - Die gesuchte Ressource existiert nicht
- **409 Conflict** - Die Operation kann aufgrund eines Konflikts nicht ausgeführt werden

---

## Farbcodierung

- <span style="color: #10B981; font-weight: bold;">GET</span> Daten abrufen
- <span style="color: #3B82F6; font-weight: bold;">POST</span> Neue Ressourcen erstellen
- <span style="color: #F59E0B; font-weight: bold;">PATCH</span> Bestehende Ressourcen aktualisieren
- <span style="color: #EF4444; font-weight: bold;">DELETE</span> Ressourcen löschen

---

## Endpoint-Details nach Kategorie

### 🎮 Player Management

| HTTP-Methode | Endpoint | Parameter | Success | Error |
|--------------|----------|-----------|---------|-------|
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Players` | Keine | **200 OK** | - |
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Player/{identifier}` | `identifier` (string) | **200 OK** | 404 Not Found |
| <span style="color: #3B82F6; font-weight: bold;">POST</span> | `/api/Game/Player/{username}` | `username` (string) | **200 OK** | 400 Bad Request (Username existiert) |
| <span style="color: #EF4444; font-weight: bold;">DELETE</span> | `/api/Game/Player/{identifier}` | `identifier` (string) | **200 OK** | 404 Not Found |

### 🏆 Score Management

| HTTP-Methode | Endpoint | Parameter | Success | Error |
|--------------|----------|-----------|---------|-------|
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Score/{identifier}` | `identifier` (string) | **200 OK** | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Score/{identifier}/{score}` | `identifier` (string), `score` (int) | **200 OK** | 404 Not Found |

### 💰 Money Management

| HTTP-Methode | Endpoint | Parameter | Success | Error |
|--------------|----------|-----------|---------|-------|
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Money/{identifier}` | `identifier` (string) | **200 OK** | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Money/{identifier}/{value}` | `identifier` (string), `value` (int) | **200 OK** | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Money/{identifier}/Add/{value}` | `identifier` (string), `value` (int) | **200 OK** | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Money/{identifier}/Remove/{value}` | `identifier` (string), `value` (int) | **200 OK** | 404 Not Found, **409 Conflict** (unzureichend Geld) |

### ⚙️ Machine Management

| HTTP-Methode | Endpoint | Parameter | Success | Error |
|--------------|----------|-----------|---------|-------|
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Machine/{factoryId}/{machineId}` | `factoryId` (int), `machineId` (int) | **200 OK** | 404 Not Found |
| <span style="color: #3B82F6; font-weight: bold;">POST</span> | `/api/Game/Machine/{factoryId}/{machineId}` | `factoryId` (int), `machineId` (string) | **200 OK** | 404 Not Found |
| <span style="color: #F59E0B; font-weight: bold;">PATCH</span> | `/api/Game/Machine/{factoryId}/{machineId}/{level}` | `factoryId` (int), `machineId` (int), `level` (int) | **200 OK** | 404 Not Found, **409 Conflict** (Level nicht höher) |

### 🏭 Factory Management

| HTTP-Methode | Endpoint | Parameter | Success | Error |
|--------------|----------|-----------|---------|-------|
| <span style="color: #10B981; font-weight: bold;">GET</span> | `/api/Game/Factory/{factoryId}` | `factoryId` (int) | **200 OK** | 404 Not Found |
