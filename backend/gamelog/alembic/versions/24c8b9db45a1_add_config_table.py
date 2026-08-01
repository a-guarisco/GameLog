"""add config table

Revision ID: 24c8b9db45a1
Revises: 7bbb083d5319
Create Date: 2026-08-01 10:13:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '24c8b9db45a1'
down_revision: str | Sequence[str] | None = '7bbb083d5319'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'config',
        sa.Column('key', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('value', sqlmodel.sql.sqltypes.AutoString(length=1024), nullable=False),
        sa.PrimaryKeyConstraint('key')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('config')
