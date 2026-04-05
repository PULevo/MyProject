# backend/alembic/versions/d1a2b3c4e5f6_add_task_fields_and_comments.py
"""Add task fields and comments

Revision ID: d1a2b3c4e5f6
Revises: c9f3e2d1b0a7
Create Date: 2026-04-05 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d1a2b3c4e5f6"
down_revision: Union[str, Sequence[str], None] = "c9f3e2d1b0a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("due_date", sa.Date(), nullable=True))
    op.add_column(
        "tasks",
        sa.Column("priority", sa.String(length=10), nullable=False, server_default="medium"),
    )
    op.create_table(
        "task_comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_task_comments_id"), "task_comments", ["id"], unique=False)
    op.create_index(op.f("ix_task_comments_task_id"), "task_comments", ["task_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_task_comments_task_id"), table_name="task_comments")
    op.drop_index(op.f("ix_task_comments_id"), table_name="task_comments")
    op.drop_table("task_comments")
    op.drop_column("tasks", "priority")
    op.drop_column("tasks", "due_date")
