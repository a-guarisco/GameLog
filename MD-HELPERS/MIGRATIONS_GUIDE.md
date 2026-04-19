# 🚀 Quick Start - Database & Development

## Primo Setup (Prima Volta)

```bash
# 1. Entrare nella cartella backend
cd backend/gamelog

# 2. Sincronizzare le dipendenze Python
uv sync

# 3. Applicare le migrazioni al DB (crea le tabelle)
make migrate

# 4. Avviare il server
make run
```

✅ **Pronto!** API disponibile su [http://localhost:8000](http://localhost:8000)

---

## Comandi Quotidiani

### 🚀 Avviare il Backend

```bash
make run                    # Porta 8000 (default)
make run PORT=3000         # Porta customizzata
```

### ✏️ Scrivere Codice

```bash
# Quando crei un nuovo modello in src/models/:
# 1. Scrivi il file (es. src/models/achievement.py)
# 2. Aggiungilo a src/models/__init__.py
# 3. Crea migration
```

### 🗄️ Database - Workflow Migrazioni

#### Scenario 1: Creare le Tabelle Iniziali

```bash
# Una sola volta per creare tutto
make migrate
```

#### Scenario 2: Aggiungere un Nuovo Campo

```bash
# 1. Modifichi il modello (es. src/models/user.py)
# 2. Crei una migration
make revision m="Add email field to users"

# 3. Rivedi il file generato in alembic/versions/
# 4. Applica al DB
make migrate
```

#### Scenario 3: Correggere un Errore nella Migration Precedente

```bash
# 1. Torna indietro di 1 migration
make downgrade

# 2. Modifica il file in alembic/versions/ oppure crea nuova
make revision m="Fix: email field length"

# 3. Applica di nuovo
make migrate
```

#### Scenario 4: Reset Completo (⚠️ Pericolo - Elimina TUTTO)

```bash
make downgrade-all  # Torna a zero
make migrate        # Ricrea da zero
```

#### Scenario 5: Riordinare le revisioni senza toccare il database

Questo è il caso in cui vuoi tenere il DB e i dati, ma vuoi cancellare le vecchie revisioni e lasciare una sola migration nuova.

```bash
# 1. Applichi i modelli e generi la migration unica
make revision m="Initial schema"

# 2. Cancelli le vecchie revisioni in alembic/versions/

# 3. Segni il DB come già allineato a quella revisione
make stamp r=0001_initial_schema

# 4. Da qui in poi, le nuove modifiche si gestiscono normalmente
make revision m="Add new field"
make migrate
```

Note:

- `stamp` non modifica le tabelle, aggiorna solo `alembic_version`.
- Usalo solo se sei sicuro che lo schema del DB corrisponda alla revisione scelta.
- Se lo schema non corrisponde, devi fare una migration vera oppure resettare il DB.

---

## Spiegazione Alembic

### Come Funziona?

````text
┌─────────────────┐
│ Modifichi Model │  (es. aggiungi una colonna)
│   (es. user.py) │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│ make revision       │  SQLAlchemy confronta il modello con il DB
│ m="Descrizione"     │  e genera il SQL
└────────┬────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ Controlla il file in                │  Verifica che il SQL sia corretto
│ alembic/versions/000X_*.py          │  Prima di applicare
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────┐
│ make migrate        │  Esegue il SQL nel DB PostgreSQL
│                     │  Aggiorna lo schema
└────────┬────────────┘
         │
         ↓
┌─────────────────┐
│ DB Aggiornato! │
└─────────────────┘
```text

### Struttura Migration File

```python
# File: alembic/versions/0002_add_email_field.py

revision = "0002_add_email_field"     # ← ID univoco
down_revision = "0001_initial_schema"  # ← Dipende dalla precedente

def upgrade():
    # ← SQL per APPLICARE la modifica
    op.add_column('users', sa.Column('email', sa.String(255)))

def downgrade():
    # ← SQL per TORNARE INDIETRO
    op.drop_column('users', 'email')
````

Quando fai `make migrate`:

1. Alembic legge tutte le migrations (0001, 0002, 0003...)
2. Esegue le `upgrade()` non ancora applicate
3. Registra la versione nel DB

Quando fai `make downgrade`:

1. Alembic trova l'ultima migration applicata
2. Esegue la sua `downgrade()`

---

## ✅ Checklist Modello Nuovo

Se vuoi aggiungere una nuova tabella, segui questo:

```text
☐ 1. Crea il file: src/models/NOME.py

   class NuovoModello(Base):
       __tablename__ = "tabella_nome"
       id: Mapped[uuid.UUID] = ...
       ...

☐ 2. Importalo in src/models/__init__.py
   from .nome import NuovoModello
   __all__ = [..., "NuovoModello"]

☐ 3. Crea la migration
   make revision m="Create NuovoModello table"

☐ 4. Applica
   make migrate

☐ 5. Testa
   make run
```

---

## 🔍 Utility Comandi

### Controllare lo Stato delle Migrazioni

```bash
# Quali migrations sono state applicate?
# Guarda in alembic/versions/ - solo quei file sono stati applicati

# Quale è l'ultima?
# Quella con il numero più alto
```

### Leggere la Guida SQLAlchemy

```bash
# Leggi il file per capire la sintassi
cat SQLALCHEMY_GUIDE.md

# Oppure apri in VS Code
code SQLALCHEMY_GUIDE.md
```

---

## 📊 Stato Attuale Database

```text
MIGRATION FILE: alembic/versions/0001_initial_schema.py

Tabelle Create:
├── users (Utenti con Steam ID)
├── games (Giochi Steam)
├── shelving (Relazione users ↔ games)
└── steam_rolling_time (Storico playtime)

Status: ❌ Non ancora applicato al DB
        Devi fare: make migrate
```

---

## 🆘 Problemi Comuni

### ❌ "alembic: command not found"

```bash
# Assicurati di essere in backend/gamelog:
cd backend/gamelog

# E che uv sia configurato:
uv sync
```

### ❌ "DATABASE_URL not set"

```bash
# Verifica il file .env nel backend:
cat ../.env

# Deve contenere qualcosa come:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=gamelog_dev
```

### ❌ "Relation 'users' already exists"

```bash
# La tabella esiste già. Se vuoi ricominciare:
make downgrade-all
make migrate
```

### ❌ "Can't find migration 0001_initial_schema"

```bash
# Assicurati di essere in: backend/gamelog/
ls alembic/versions/  # Deve mostrare 0001_initial_schema.py
```

---

## 📖 Riferimenti Rapidi

| Comando                         | Cosa Fa                  |
| ------------------------------- | ------------------------ |
| `make help`                     | Mostra tutti i comandi   |
| `make lint`                     | Formatta il codice       |
| `make test`                     | Esegue i test            |
| `make run`                      | Avvia il server          |
| `make migrate`                  | Applica migrations al DB |
| `make revision m="Descrizione"` | Crea nuova migration     |
| `make downgrade`                | Torna di 1 migration     |
| `make downgrade-all`            | Torna all'inizio (⚠️)    |

---

## 🎯 Flusso di Lavoro Giornaliero

```text
1. Modifichi un modello
   ↓
2. make revision m="Descrizione"
   ↓
3. Guardi il file generato (ok? Perfetto!)
   ↓
4. make migrate
   ↓
5. make run (testa che funziona)
   ↓
6. ✅ Pronto per commit
```
