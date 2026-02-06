@ui
Feature: FOE Web UI - Report Viewer
  As a development team lead
  I want to view FOE scan reports in the web interface
  So that I can visualize engineering maturity

  Scenario: Load the web application
    Given I navigate to "/"
    Then I wait for the page to load

  Scenario: Upload page is accessible
    Given I navigate to "/"
    Then I wait for the page to load
    Then I should see text "FOE"
