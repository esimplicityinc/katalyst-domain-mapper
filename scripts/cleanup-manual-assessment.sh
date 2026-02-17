#!/bin/bash

# Cleanup script for premature manual-assessment implementation
# Run this to remove the feature files that were built ahead of planning

echo "🧹 Cleaning up premature manual-assessment implementation..."

# Remove component directory
if [ -d "packages/web-report/src/components/manual-assessment" ]; then
  echo "  Removing components/manual-assessment/"
  rm -rf packages/web-report/src/components/manual-assessment/
fi

# Remove route directory
if [ -d "packages/web-report/src/app/manual-assessment" ]; then
  echo "  Removing app/manual-assessment/"
  rm -rf packages/web-report/src/app/manual-assessment/
fi

echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review the planning document: docs/features/manual-assessment-wizard.md"
echo "  2. Prioritize this feature against other roadmap items"
echo "  3. When ready to implement, follow the plan in the doc"
