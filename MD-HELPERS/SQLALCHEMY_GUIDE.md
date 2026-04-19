# 📚 Guida SQLAlchemy + FastAPI - Sintassi Spiegata

## 1️⃣ MODELLI SQLALCHEMY - Le Basi

### Cos'è un Modello?

Un modello è una **classe Python che rappresenta una tabella nel database**. SQLAlchemy lo converte automaticamente in SQL.

### Struttura Base (user.py)

```python
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class User(Base):
    __tablename__ = "users"  # ← Nome tabella nel DB

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),      # ← Tipo colonna: UUID PostgreSQL
        primary_key=True,         # ← Chiave primaria
        default=uuid.uuid4        # ← Genera UUID automaticamente
    )
```

### Type Hints: `Mapped[tipo]`

```python
id: Mapped[uuid.UUID]       # ← "Questa colonna contiene un UUID"
username: Mapped[str]       # ← "Questa colonna contiene una stringa"
last_day_playtime: Mapped[int]  # ← "Questa colonna contiene un numero intero"
```

**Perché usare `Mapped`?** È il nuovo standard SQLAlchemy 2.0 che fornisce:

- ✅ Type checking corretto in IDE
- ✅ Autocompletamento migliore
- ✅ Validazione statica

---

## 2️⃣ COLONNE - `mapped_column()`

### Sintassi Base

```python
field_name: Mapped[tipo] = mapped_column(
    SQLAlchemy_type(),  # ← Tipo SQL (String, Integer, UUID, ecc.)
    **opzioni            # ← Vincoli e configurazioni
)
```

### Opzioni Comuni

#### `primary_key=True` - Chiave Primaria

```python
id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
# SQL: id UUID PRIMARY KEY
```

#### `unique=True` - Valore Unico

```python
username: Mapped[str] = mapped_column(String(100), unique=True)
# SQL: username VARCHAR(100) UNIQUE
# Garantisce che non ci siano due utenti con lo stesso username
```

#### `index=True` - Indice (velocizza le ricerche)

```python
steam_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
# SQL: CREATE INDEX ix_users_steam_id ON users(steam_id)
# Usa quando cerchi spesso per questo campo (WHERE steam_id = ...)
```

#### `nullable=False` (default) / `nullable=True`

```python
username: Mapped[str] = mapped_column(String(100))  # NOT NULL (obbligatorio)
banner_url: Mapped[str] = mapped_column(String(500), nullable=True)  # NULL (opzionale)
```

#### `default=valore` - Valore Predefinito

```python
id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4  # ← Genera UUID nuovo per ogni riga
)
created_at: Mapped[date] = mapped_column(Date, default=date.today)
```

---

## 3️⃣ TIPI DI COLONNE

### String (Testo)

```python
username: Mapped[str] = mapped_column(String(100))  # Max 100 caratteri
# SQL: VARCHAR(100)
```

### Integer (Numeri Interi)

```python
last_day_playtime: Mapped[int] = mapped_column(Integer, default=0)
# SQL: INTEGER
```

### UUID (Identificatori Univoci)

```python
from sqlalchemy.dialects.postgresql import UUID
import uuid

id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),  # ← Tipo PostgreSQL nativo
    primary_key=True,
    default=uuid.uuid4   # ← Genera UUID randomico
)
```

**Perché UUID invece di int?**

- ✅ Non hai problemi di collisione tra server
- ✅ Non esponi quanti record hai nel DB
- ✅ Perfetto per sistemi distribuiti

### Date (Date)

```python
from sqlalchemy import Date
from datetime import date

created_at: Mapped[date] = mapped_column(Date, default=date.today)
```

### Enum (Scelta tra Valori Fissi)

```python
from enum import Enum
from sqlalchemy import Enum as SQLEnum

class GameStatus(str, Enum):
    SHELVED = "shelved"
    TO_BE_PLAYED = "to_be_played"
    PLAYING = "playing"
    PLAYED = "played"
    PLATINATO = "platinato"

status: Mapped[GameStatus] = mapped_column(
    SQLEnum(GameStatus),  # ← Tipo SQLAlchemy
    default=GameStatus.SHELVED
)
```

---

## 4️⃣ RELAZIONI - `relationship()`

### Cos'è una Relazione?

Permette a SQLAlchemy di **legare automaticamente** due modelli. Ti permette di scrivere `user.shelving` invece di fare JOIN manuale.

### 1-to-Many (Un utente ha molti giochi)

```python
class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = ...

    # Un utente ha MOLTI shelving (i suoi giochi)
    shelving = relationship(
        "Shelving",              # ← Classe collegata
        back_populates="owner",  # ← Nome relazione inversa
        cascade="all, delete-orphan"  # ← Se elimini User, elimina anche i Shelving
    )

# Uso in Python:
user = session.query(User).first()
print(user.shelving)  # ← Tutti i giochi dell'utente
```

### Many-to-Many (Attraverso Junction Table)

```python
# Struttura nel DB:
# users ─┐
#        ├─ shelving (tabella di collegamento)
#        ┘─ games

class Shelving(Base):
    __tablename__ = "shelving"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),  # ← Collegato a users
        primary_key=True
    )
    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("games.id"),  # ← Collegato a games
        primary_key=True
    )
    status: Mapped[GameStatus] = mapped_column(SQLEnum(GameStatus))

    # Relazioni
    owner = relationship("User", back_populates="shelving")
    game = relationship("Game", back_populates="shelving")

# Uso:
user = session.query(User).first()
for shelving in user.shelving:
    print(f"Gioco: {shelving.game.steam_app_id}, Status: {shelving.status}")
```

### back_populates vs backref

```python
# Con back_populates (esplicito - PREFERITO):
class User(Base):
    shelving = relationship("Shelving", back_populates="owner")

class Shelving(Base):
    owner = relationship("User", back_populates="shelving")

# Puoi accedere da entrambi i lati:
user.shelving  # Lista di Shelving
shelving.owner  # Oggetto User

# Con backref (implicito - meno chiaro):
class User(Base):
    shelving = relationship("Shelving", backref="owner")
# ← SQLAlchemy crea automaticamente owner su Shelving
```

### cascade="all, delete-orphan"

```python
cascade="all, delete-orphan"
# Significa: Se elimini un User, elimina AUTOMATICAMENTE tutti i suoi Shelving
```

---

## 5️⃣ FOREIGN KEY - Collegarsi ad Altre Tabelle

```python
from sqlalchemy import ForeignKey

class Shelving(Base):
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),  # ← Deve corrispondere a user.id
        primary_key=True
    )
```

**In SQL:**

```sql
ALTER TABLE shelving
ADD FOREIGN KEY (owner_id) REFERENCES users(id)
```

**Cosa fa?**

- ❌ Impedisce di inserire un owner_id che non esiste in users
- ✅ Mantiene l'integrità referenziale del DB

---

## 6️⃣ CREAZIONE ISTANZE (Come Usare i Modelli)

```python
from src.models import User, Game, Shelving

# 1. Creare un nuovo utente
new_user = User(
    firebase_uid="firebase_123",
    username="mario_rossi",
    steam_id="76561198012345678",
    steam_api_key="ABCDEF123456"  # In produzione: encriptato
)

# 2. Aggiungerlo alla sessione
db.add(new_user)
db.commit()

# 3. Recuperarlo
user = db.query(User).filter(User.username == "mario_rossi").first()

# 4. Accedere alle relazioni
for item in user.shelving:
    print(item.game.steam_app_id, item.status)

# 5. Eliminarlo (con cascade)
db.delete(user)  # ← Elimina anche tutti i shelving
db.commit()
```

---

## 7️⃣ MIGRAZIONE - Alembic

### Come Funziona?

1. **Definisci il modello** in Python (user.py, game.py, ecc.)
2. **Crea una migration** che traduce il modello in SQL
3. **Applica al DB**

### Comandi Make (Makefile)

```bash
# Creare una nuova migration (autogenerate dai modelli)
make revision m="Descrizione della migration"

# Applicare la migration al database
make migrate

# Esempio:
make revision m="Add user and game tables"
make migrate
```

### Come Funziona Autogenerate?

```bash
make revision m="Add user table"
```

SQLAlchemy fa:

1. Legge tutti i modelli (user.py, game.py, ecc.)
2. Confronta con il DB esistente
3. Genera SQL in `alembic/versions/00XX_*.py`

Il file generato contiene:

```python
def upgrade():
    # ← SQL per creare le tabelle
    op.create_table('users', ...)

def downgrade():
    # ← SQL per tornare indietro
    op.drop_table('users')
```

### Rollback (Tornare Indietro)

```bash
# Tornare alla migration precedente
alembic downgrade -1

# Tornare all'inizio
alembic downgrade base
```

---

## 8️⃣ DIFFERENZA MIGRATION vs REVISION

| Termine       | Significato                                           |
| ------------- | ----------------------------------------------------- |
| **Migration** | File SQL generato da Alembic (0001_initial.py)        |
| **Revision**  | Versione dello schema (ogni migration è una revision) |
| **upgrade**   | Applicare una migration al DB (forward)               |
| **downgrade** | Annullare una migration (backward)                    |

---

## 9️⃣ SCHEMA DATABASE FINALE

```
users (tabella)
├── id (UUID, PK)
├── firebase_uid (VARCHAR, UNIQUE)
├── username (VARCHAR, UNIQUE)
├── steam_id (VARCHAR, UNIQUE)
└── steam_api_key (VARCHAR)

games (tabella)
├── id (UUID, PK)
├── steam_app_id (VARCHAR, UNIQUE)
├── logo_url (VARCHAR, nullable)
└── banner_url (VARCHAR, nullable)

shelving (junction table: users ↔ games)
├── owner_id (UUID, FK → users.id, PK)
├── game_id (UUID, FK → games.id, PK)
└── status (ENUM: shelved|to_be_played|playing|played|platinato)

steam_rolling_time (historico playtime)
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── steam_app_id (VARCHAR)
├── last_day_playtime (INTEGER)
└── created_at (DATE)
```

---

## 🔟 FLOWCHART - Da Modello a DB

```
Python Modello (user.py)
    ↓
SQLAlchemy converte in SQL
    ↓
make revision m="descrizione" (genera .py in alembic/versions/)
    ↓
make migrate (esegue il .py e modifica il DB)
    ↓
DB risultante
```

---

## Domande Comuni?

**Q: Perché `Mapped[str]` e non solo `str`?**
A: `Mapped` dice a SQLAlchemy "questo è un attributo del DB" (type checking migliore)

**Q: Cosa succeede se faccio `default=uuid.uuid4` vs `default=uuid.uuid4()`?**
A:

- `uuid.uuid4` = funzione (chiamata ogni volta, diverso per ogni riga) ✅
- `uuid.uuid4()` = valore (lo stesso per tutte le righe) ❌

**Q: Quando usare `index=True`?**
A: Quando cerchi spesso per quel campo:

- ✅ `steam_id` (cercherai "dammi l'utente con questo steam_id")
- ✅ `username` (login)
- ❌ `banner_url` (rari le ricerche)

**Q: Cos'è `cascade="all, delete-orphan"`?**
A: Se cancelli un User, cancella anche tutti i Shelving collegati (orfani).
