"""Update recycler schema + transaction sale fields

Revision ID: update_recycler_001
Revises: add_waste_type_001
Create Date: 2026-06-04 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'update_recycler_001'
down_revision = 'add_waste_type_001'
branch_labels = None
depends_on = None


def _col_exists(inspector, table: str, col: str) -> bool:
    return col in [c['name'] for c in inspector.get_columns(table)]


def _index_exists(inspector, table: str, idx: str) -> bool:
    return idx in [i['name'] for i in inspector.get_indexes(table)]


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # ─────────────────────────────────────────────
    # 1. recyclers table — add V3 columns
    # ─────────────────────────────────────────────
    if not _col_exists(inspector, 'recyclers', 'panchayat_id'):
        op.add_column('recyclers',
            sa.Column('panchayat_id', sa.Integer(),
                      sa.ForeignKey('panchayats.id'), nullable=True))

    if not _col_exists(inspector, 'recyclers', 'waste_types_accepted'):
        op.add_column('recyclers',
            sa.Column('waste_types_accepted', sa.JSON(), nullable=True))

    # price_per_kg already exists as Float — add new JSON version under new name
    # We keep the old Float column and add the JSON variant
    if not _col_exists(inspector, 'recyclers', 'waste_price_per_kg'):
        op.add_column('recyclers',
            sa.Column('waste_price_per_kg', sa.JSON(), nullable=True))

    # Relax NOT NULL on existing V1 columns (safe even if already nullable)
    for col_name, col_type in [
        ('contact_person', sa.String()),
        ('phone', sa.String()),
        ('address', sa.String()),
        ('latitude', sa.Float()),
        ('longitude', sa.Float()),
    ]:
        if _col_exists(inspector, 'recyclers', col_name):
            op.alter_column('recyclers', col_name,
                            existing_type=col_type,
                            nullable=True)

    # Make zone_id nullable (V3 uses panchayat_id instead)
    if _col_exists(inspector, 'recyclers', 'zone_id'):
        op.alter_column('recyclers', 'zone_id',
                        existing_type=sa.Integer(),
                        nullable=True)

    # ─────────────────────────────────────────────
    # 2. transactions table — add sale tracking columns
    # ─────────────────────────────────────────────
    if not _col_exists(inspector, 'transactions', 'is_sale'):
        op.add_column('transactions',
            sa.Column('is_sale', sa.Boolean(),
                      nullable=False, server_default='false'))

    if not _col_exists(inspector, 'transactions', 'sale_price_inr'):
        op.add_column('transactions',
            sa.Column('sale_price_inr', sa.Float(), nullable=True))

    if not _col_exists(inspector, 'transactions', 'recycler_id'):
        op.add_column('transactions',
            sa.Column('recycler_id', sa.Integer(),
                      sa.ForeignKey('recyclers.id'), nullable=True))

    # Relax NOT NULL on house_id / collector_id / ward_no so sale records work
    if _col_exists(inspector, 'transactions', 'house_id'):
        op.alter_column('transactions', 'house_id',
                        existing_type=sa.String(20), nullable=True)
    if _col_exists(inspector, 'transactions', 'collector_id'):
        op.alter_column('transactions', 'collector_id',
                        existing_type=sa.Integer(), nullable=True)
    if _col_exists(inspector, 'transactions', 'ward_no'):
        op.alter_column('transactions', 'ward_no',
                        existing_type=sa.Integer(), nullable=True)
    if _col_exists(inspector, 'transactions', 'collected_at'):
        op.alter_column('transactions', 'collected_at',
                        existing_type=sa.DateTime(timezone=True), nullable=True)


def downgrade():
    # Remove sale columns from transactions
    op.drop_column('transactions', 'recycler_id')
    op.drop_column('transactions', 'sale_price_inr')
    op.drop_column('transactions', 'is_sale')

    # Remove V3 recycler columns
    op.drop_column('recyclers', 'waste_price_per_kg')
    op.drop_column('recyclers', 'waste_types_accepted')
    op.drop_column('recyclers', 'panchayat_id')
