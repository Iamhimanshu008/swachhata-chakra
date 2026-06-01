import os
import sys

# Delete the bad migration
try:
    os.remove("alembic/versions/f0fddc123444_module_5_ai_grading.py")
    print("Deleted bad migration.")
except FileNotFoundError:
    print("Migration not found, skipping delete.")
except Exception as e:
    print(f"Failed to delete: {e}")

# Run Alembic commands using system calls so we don't have to import Alembic directly
# in case of path issues.
res1 = os.system("python -m alembic -c alembic.ini revision --autogenerate -m \"module_5_ai_grading_fix\"")
print("Revision exit code:", res1)
res2 = os.system("python -m alembic -c alembic.ini upgrade head")
print("Upgrade exit code:", res2)
