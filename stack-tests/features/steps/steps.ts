import { test } from './fixtures';
import {
  registerApiSteps,
  registerUiSteps,
  registerSharedSteps,
  registerHybridSuite,
  registerTuiSteps,
} from '@esimplicity/stack-tests/steps';

registerApiSteps(test);
registerUiSteps(test);
registerSharedSteps(test);
registerHybridSuite(test);

// TUI steps (optional - requires tui-tester and tmux installed)
// Uncomment when you have TUI testing configured:
// registerTuiSteps(test);

export { test };
