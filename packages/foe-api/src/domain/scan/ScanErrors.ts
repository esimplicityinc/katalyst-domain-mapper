export class ScanJobNotFoundError extends Error {
  constructor(id: string) {
    super(`Scan job not found: ${id}`);
    this.name = "ScanJobNotFoundError";
  }
}

export class ScanAlreadyRunningError extends Error {
  constructor(repoPath: string) {
    super(`A scan is already running for: ${repoPath}`);
    this.name = "ScanAlreadyRunningError";
  }
}

export class ScanRunnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanRunnerError";
  }
}
