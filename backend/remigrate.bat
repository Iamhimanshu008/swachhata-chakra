@echo off
del alembic\versions\f0fddc123444_module_5_ai_grading.py
python -m alembic -c alembic.ini revision --autogenerate -m "module_5_ai_grading_fix"
python -m alembic -c alembic.ini upgrade head
