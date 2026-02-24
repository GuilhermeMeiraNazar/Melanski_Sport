/**
 * Bug Condition Exploration Test - Feature Buttons Rendering
 * 
 * **Validates: Requirements 1.2, 1.3, 2.2, 2.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * Property 1: Fault Condition - Disabled Feature Buttons Appear in DOM
 * 
 * This test explores the bug where disabled feature buttons are rendered in the HTML DOM
 * (even if not visible) instead of not being rendered at all.
 * 
 * Bug Scenario:
 * - When feature_appearance=false, appearance button element should NOT exist in DOM
 * - When feature_orders=false, orders button element should NOT exist in DOM
 * - When feature_logs=false, logs button element should NOT exist in DOM
 * - Same for all other feature flags (export, insights, users)
 * 
 * Expected Outcome: TEST FAILS (proves bug exists - buttons appear in DOM when they shouldn't)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';

// Components to test
import Admin from '../pages/admin/Admin';
import MobileMenuDrawer from '../components/admin/MobileMenuDrawer';

// Mock API services
vi.mock('../services/api', () => ({
  productSvc: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({ data: { success: true } }),
    update: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } })
  },
  developerSettingsSvc: {
    getSettings: vi.fn().mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: false },
          feature_logs: { value: false },
          feature_appearance: { value: false },
          feature_export: { value: false },
          feature_insights: { value: false },
          feature_users: { value: false }
        }
      }
    })
  }
}));

// Mock user for admin authentication
const mockDeveloperUser = {
  role: 'developer',
  name: 'Test Developer'
};

const mockAdministratorUser = {
  role: 'administrator',
  name: 'Test Administrator'
};

describe('Bug Condition Exploration - Feature Buttons Rendering', () => {
  beforeEach(() => {
    // Setup localStorage for admin authentication
    localStorage.setItem('user', JSON.stringify(mockDeveloperUser));
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    // Cleanup
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Test Scenario 1: Disabled feature_orders - Orders button should NOT exist in DOM
   * 
   * Bug: When feature_orders=false, the orders button is rendered in HTML (possibly hidden)
   * Expected: Orders button should NOT be rendered at all in the DOM
   * 
   * This test WILL FAIL on unfixed code because:
   * - The conditional rendering uses `features.feature_orders && (...)` pattern
   * - This may render empty elements or hidden buttons in the DOM
   */
  it('SCENARIO 1: Orders button should NOT exist in DOM when feature_orders=false', async () => {
    // Mock API to return feature_orders=false
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: false },
          feature_logs: { value: true },
          feature_appearance: { value: true },
          feature_export: { value: true },
          feature_insights: { value: true },
          feature_users: { value: true }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Search for orders button in the DOM
    const ordersButton = container.querySelector('.btn-orders');
    const ordersButtonByText = screen.queryByText(/Vendas/i);

    // BUG: This will FAIL because the button exists in DOM (even if hidden)
    // Expected: null (button should not be rendered)
    // Actual on unfixed code: button element exists in DOM
    expect(ordersButton).toBeNull();
    expect(ordersButtonByText).toBeNull();
  });

  /**
   * Test Scenario 2: Disabled feature_appearance - Appearance button should NOT exist in DOM
   * 
   * Bug: When feature_appearance=false, the appearance button is rendered in HTML
   * Expected: Appearance button should NOT be rendered at all in the DOM
   */
  it('SCENARIO 2: Appearance button should NOT exist in DOM when feature_appearance=false', async () => {
    // Mock API to return feature_appearance=false
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: true },
          feature_logs: { value: true },
          feature_appearance: { value: false },
          feature_export: { value: true },
          feature_insights: { value: true },
          feature_users: { value: true }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Search for appearance button in the DOM
    const appearanceButton = container.querySelector('.btn-appearance');
    const appearanceButtonByText = screen.queryByText(/Aparencia/i);

    // BUG: This will FAIL because the button exists in DOM
    expect(appearanceButton).toBeNull();
    expect(appearanceButtonByText).toBeNull();
  });

  /**
   * Test Scenario 3: Disabled feature_logs - Logs button should NOT exist in DOM
   * 
   * Bug: When feature_logs=false, the logs button is rendered in HTML
   * Expected: Logs button should NOT be rendered at all in the DOM
   */
  it('SCENARIO 3: Logs button should NOT exist in DOM when feature_logs=false', async () => {
    // Mock API to return feature_logs=false
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: true },
          feature_logs: { value: false },
          feature_appearance: { value: true },
          feature_export: { value: true },
          feature_insights: { value: true },
          feature_users: { value: true }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Search for logs button in the DOM
    const logsButton = container.querySelector('.btn-logs');
    const logsButtonByText = screen.queryByText(/Logs/i);

    // BUG: This will FAIL because the button exists in DOM
    expect(logsButton).toBeNull();
    expect(logsButtonByText).toBeNull();
  });

  /**
   * Test Scenario 4: Disabled feature_export - Export button should NOT exist in DOM
   */
  it('SCENARIO 4: Export button should NOT exist in DOM when feature_export=false', async () => {
    // Mock API to return feature_export=false
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: true },
          feature_logs: { value: true },
          feature_appearance: { value: true },
          feature_export: { value: false },
          feature_insights: { value: true },
          feature_users: { value: true }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Search for export button in the DOM
    const exportButton = container.querySelector('.btn-export');
    const exportButtonByText = screen.queryByText(/Exportar/i);

    // BUG: This will FAIL because the button exists in DOM
    expect(exportButton).toBeNull();
    expect(exportButtonByText).toBeNull();
  });

  /**
   * Test Scenario 5: Disabled feature_insights - Insights button should NOT exist in DOM
   */
  it('SCENARIO 5: Insights button should NOT exist in DOM when feature_insights=false', async () => {
    // Mock API to return feature_insights=false
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: true },
          feature_logs: { value: true },
          feature_appearance: { value: true },
          feature_export: { value: true },
          feature_insights: { value: false },
          feature_users: { value: true }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Search for insights button in the DOM
    const insightsButton = container.querySelector('.btn-insights');
    const insightsButtonByText = screen.queryByText(/Insights/i);

    // BUG: This will FAIL because the button exists in DOM
    expect(insightsButton).toBeNull();
    expect(insightsButtonByText).toBeNull();
  });

  /**
   * Test Scenario 6: Disabled feature_users - Users button should NOT exist in DOM
   */
  it('SCENARIO 6: Users button should NOT exist in DOM when feature_users=false', async () => {
    // Mock API to return feature_users=false
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: true },
          feature_logs: { value: true },
          feature_appearance: { value: true },
          feature_export: { value: true },
          feature_insights: { value: true },
          feature_users: { value: false }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Search for users button in the DOM
    const usersButton = container.querySelector('.btn-users');
    const usersButtonByText = screen.queryByText(/Usuarios/i);

    // BUG: This will FAIL because the button exists in DOM
    expect(usersButton).toBeNull();
    expect(usersButtonByText).toBeNull();
  });

  /**
   * Test Scenario 7: MobileMenuDrawer - Disabled features should NOT render in mobile menu
   * 
   * Bug: When features are disabled, their buttons still appear in mobile menu
   * Expected: Disabled feature buttons should NOT be rendered in mobile menu
   */
  it('SCENARIO 7: MobileMenuDrawer should NOT render disabled feature buttons', () => {
    // Features with all disabled
    const features = {
      feature_orders: false,
      feature_logs: false,
      feature_appearance: false,
      feature_export: false,
      feature_insights: false,
      feature_users: false
    };

    // Render MobileMenuDrawer
    const { container } = render(
      <MobileMenuDrawer
        user={mockDeveloperUser}
        currentView="list"
        setCurrentView={() => {}}
        canManageCategories={true}
        canViewLogs={true}
        features={features}
        onClose={() => {}}
        onLogout={() => {}}
      />
    );

    // Search for disabled feature buttons in mobile menu
    const ordersButton = screen.queryByText(/Vendas/i);
    const logsButton = screen.queryByText(/Logs de Atividade/i);
    const appearanceButton = screen.queryByText(/Aparencia/i);
    const exportButton = screen.queryByText(/Exportar Dados/i);
    const insightsButton = screen.queryByText(/Insights/i);
    const usersButton = screen.queryByText(/Usuarios/i);

    // BUG: These will FAIL because buttons exist in DOM
    expect(ordersButton).toBeNull();
    expect(logsButton).toBeNull();
    expect(appearanceButton).toBeNull();
    expect(exportButton).toBeNull();
    expect(insightsButton).toBeNull();
    expect(usersButton).toBeNull();
  });

  /**
   * Test Scenario 8: All features disabled - No feature buttons should exist in DOM
   * 
   * Bug: When all features are disabled, multiple button elements pollute the DOM
   * Expected: No feature buttons should be rendered when all features are disabled
   */
  it('SCENARIO 8: No feature buttons should exist when all features are disabled', async () => {
    // Mock API to return all features disabled
    const { developerSettingsSvc } = await import('../services/api');
    developerSettingsSvc.getSettings.mockResolvedValue({
      data: {
        settings: {
          feature_orders: { value: false },
          feature_logs: { value: false },
          feature_appearance: { value: false },
          feature_export: { value: false },
          feature_insights: { value: false },
          feature_users: { value: false }
        }
      }
    });

    // Render Admin component
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Wait for component to load features
    await new Promise(resolve => setTimeout(resolve, 100));

    // Count feature buttons in DOM
    const featureButtons = container.querySelectorAll(
      '.btn-orders, .btn-logs, .btn-appearance, .btn-export, .btn-insights, .btn-users'
    );

    // BUG: This will FAIL because buttons exist in DOM (count > 0)
    // Expected: 0 buttons
    // Actual on unfixed code: 6 buttons (or empty elements)
    expect(featureButtons.length).toBe(0);
  });

  /**
   * Property-Based Test: Disabled Features Should Never Render in DOM
   * 
   * This property test generates random feature flag configurations and verifies that
   * disabled features never render their buttons in the DOM.
   * 
   * Expected: TEST FAILS (proves bug exists across many feature combinations)
   */
  it('PROPERTY: Disabled features should NEVER render buttons in DOM', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary feature flag configurations
        fc.record({
          feature_orders: fc.boolean(),
          feature_logs: fc.boolean(),
          feature_appearance: fc.boolean(),
          feature_export: fc.boolean(),
          feature_insights: fc.boolean(),
          feature_users: fc.boolean()
        }),
        async (features) => {
          // Mock API to return generated feature flags
          const { developerSettingsSvc } = await import('../services/api');
          developerSettingsSvc.getSettings.mockResolvedValue({
            data: {
              settings: Object.keys(features).reduce((acc, key) => {
                acc[key] = { value: features[key] };
                return acc;
              }, {})
            }
          });

          // Render Admin component
          const { container } = render(
            <BrowserRouter>
              <Admin />
            </BrowserRouter>
          );

          // Wait for component to load features
          await new Promise(resolve => setTimeout(resolve, 100));

          // Property: For each disabled feature, its button should NOT exist in DOM
          if (!features.feature_orders) {
            const ordersButton = container.querySelector('.btn-orders');
            // BUG: Will fail because button exists when feature is disabled
            expect(ordersButton).toBeNull();
          }

          if (!features.feature_logs) {
            const logsButton = container.querySelector('.btn-logs');
            expect(logsButton).toBeNull();
          }

          if (!features.feature_appearance) {
            const appearanceButton = container.querySelector('.btn-appearance');
            expect(appearanceButton).toBeNull();
          }

          if (!features.feature_export) {
            const exportButton = container.querySelector('.btn-export');
            expect(exportButton).toBeNull();
          }

          if (!features.feature_insights) {
            const insightsButton = container.querySelector('.btn-insights');
            expect(insightsButton).toBeNull();
          }

          if (!features.feature_users) {
            const usersButton = container.querySelector('.btn-users');
            expect(usersButton).toBeNull();
          }
        }
      ),
      { numRuns: 20 } // Test 20 random feature configurations
    );
  });

  /**
   * Property-Based Test: DOM Pollution - Disabled features should not add empty elements
   * 
   * This test verifies that disabled features don't pollute the HTML with empty or hidden elements.
   */
  it('PROPERTY: Disabled features should not pollute DOM with empty elements', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate feature configurations with at least one disabled feature
        fc.record({
          feature_orders: fc.boolean(),
          feature_logs: fc.boolean(),
          feature_appearance: fc.boolean(),
          feature_export: fc.boolean(),
          feature_insights: fc.boolean(),
          feature_users: fc.boolean()
        }).filter(features => 
          // Ensure at least one feature is disabled
          Object.values(features).some(value => value === false)
        ),
        async (features) => {
          // Mock API
          const { developerSettingsSvc } = await import('../services/api');
          developerSettingsSvc.getSettings.mockResolvedValue({
            data: {
              settings: Object.keys(features).reduce((acc, key) => {
                acc[key] = { value: features[key] };
                return acc;
              }, {})
            }
          });

          // Render Admin component
          const { container } = render(
            <BrowserRouter>
              <Admin />
            </BrowserRouter>
          );

          // Wait for component to load
          await new Promise(resolve => setTimeout(resolve, 100));

          // Count enabled features
          const enabledCount = Object.values(features).filter(v => v === true).length;

          // Count feature buttons in DOM
          const featureButtons = container.querySelectorAll(
            '.btn-orders, .btn-logs, .btn-appearance, .btn-export, .btn-insights, .btn-users'
          );

          // Property: Number of buttons in DOM should equal number of enabled features
          // BUG: Will fail because disabled features still render buttons
          expect(featureButtons.length).toBe(enabledCount);
        }
      ),
      { numRuns: 15 } // Test 15 random configurations
    );
  });
});
