"""Initial database schema: users, games, shelving, steam_rolling_time

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-04-19 00:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("firebase_uid", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("steam_id", sa.String(length=32), nullable=False),
        sa.Column("steam_api_key", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("firebase_uid"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("steam_id"),
    )
    op.create_index(op.f("ix_users_firebase_uid"), "users", ["firebase_uid"], unique=False)
    op.create_index(op.f("ix_users_steam_id"), "users", ["steam_id"], unique=False)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=False)

    op.create_table(
        "games",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("steam_app_id", sa.String(length=32), nullable=False),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("banner_url", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("steam_app_id"),
    )
    op.create_index(op.f("ix_games_steam_app_id"), "games", ["steam_app_id"], unique=False)

    # Note: game_status ENUM will be created automatically by SQLAlchemy
    try:
        op.create_table(
            "shelving",
            sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("game_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("status", postgresql.ENUM("shelved", "to_be_played", "playing", "played", "platinato", name="game_status"), nullable=False),
            sa.ForeignKeyConstraint(["game_id"], ["games.id"]),
            sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("owner_id", "game_id"),
        )
    except Exception as e:
        if "already exists" not in str(e):
            raise

    op.create_table(
        "steam_rolling_time",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("steam_app_id", sa.String(length=32), nullable=False),
        sa.Column("last_day_playtime", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_steam_rolling_time_created_at"),
        "steam_rolling_time",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        op.f("ix_steam_rolling_time_user_id"), "steam_rolling_time", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_steam_rolling_time_steam_app_id"),
        "steam_rolling_time",
        ["steam_app_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop tables in reverse order of dependencies
    op.drop_index(
        op.f("ix_steam_rolling_time_steam_app_id"), table_name="steam_rolling_time"
    )
    op.drop_index(op.f("ix_steam_rolling_time_user_id"), table_name="steam_rolling_time")
    op.drop_index(
        op.f("ix_steam_rolling_time_created_at"), table_name="steam_rolling_time"
    )
    op.drop_table("steam_rolling_time")

    op.drop_table("shelving")

    op.drop_index(op.f("ix_games_steam_app_id"), table_name="games")
    op.drop_table("games")

    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_steam_id"), table_name="users")
    op.drop_index(op.f("ix_users_firebase_uid"), table_name="users")
    op.drop_table("users")

    # Drop enum type
    game_status_enum = postgresql.ENUM("shelved", "to_be_played", "playing", "played", "platinato", name="game_status")
    game_status_enum.drop(op.get_bind())
