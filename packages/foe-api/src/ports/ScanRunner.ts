export interface ScanResult {
  success: boolean;
  report: unknown; // raw JSON output from the scanner
  error?: string;
}

export interface ScanRunner {
  /**
   * Run the scanner against a repository.
   * Returns the raw JSON output on success, or an error message on failure.
   */
  run(repositoryPath: string): Promise<ScanResult>;
}
