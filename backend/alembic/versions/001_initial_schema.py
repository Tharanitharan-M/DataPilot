"""Initial schema with multi-tenant support

Revision ID: 001
Revises: 
Create Date: 2024-11-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('public_metadata', sa.Text(), nullable=True),
        sa.Column('private_metadata', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('max_members', sa.Integer(), nullable=False, default=10),
        sa.Column('clerk_created_at', sa.String(50), nullable=True),
        sa.Column('clerk_updated_at', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('first_name', sa.String(255), nullable=True),
        sa.Column('last_name', sa.String(255), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('username', sa.String(255), nullable=True, unique=True, index=True),
        sa.Column('organization_id', sa.String(255), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('role', sa.String(50), nullable=False, default='member'),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('email_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('public_metadata', sa.Text(), nullable=True),
        sa.Column('private_metadata', sa.Text(), nullable=True),
        sa.Column('clerk_created_at', sa.String(50), nullable=True),
        sa.Column('clerk_updated_at', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    # Create datasets table (example of tenant-isolated data)
    op.create_table(
        'datasets',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('organization_id', sa.String(255), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(255), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('row_count', sa.Integer(), nullable=False, default=0),
        sa.Column('column_count', sa.Integer(), nullable=False, default=0),
        sa.Column('file_size', sa.Integer(), nullable=False, default=0),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('extra_metadata', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    # Create indexes for better query performance
    op.create_index('ix_users_organization_id_is_active', 'users', ['organization_id', 'is_active'])
    op.create_index('ix_datasets_organization_id_is_active', 'datasets', ['organization_id', 'is_active'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_datasets_organization_id_is_active', 'datasets')
    op.drop_index('ix_users_organization_id_is_active', 'users')
    
    # Drop tables in reverse order
    op.drop_table('datasets')
    op.drop_table('users')
    op.drop_table('organizations')

