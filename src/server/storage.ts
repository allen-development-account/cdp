import fs from 'fs';
import path from 'path';

export class DiskStorageManager {
  private filePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;
  private isSaving: boolean = false;

  constructor(fileName: string = 'cdp-storage.json') {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('[DiskStorage] Failed to create data directory:', err);
      }
    }
    this.filePath = path.join(dataDir, fileName);
  }

  public exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  public load<T>(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      if (!raw || raw.trim().length === 0) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error('[DiskStorage] Failed to read storage file from disk:', err);
      return null;
    }
  }

  public saveImmediate<T>(data: T): boolean {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (err) {
      console.error('[DiskStorage] Failed to write storage file:', err);
      return false;
    }
  }

  /**
   * Debounced save to prevent excessive disk writes during high-frequency ingestion
   */
  public saveDebounced<T>(data: T, delayMs: number = 400): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(data);
      this.saveTimeout = null;
    }, delayMs);
  }

  public getStorageInfo(): { exists: boolean; sizeBytes: number; lastModified: string | null } {
    try {
      if (fs.existsSync(this.filePath)) {
        const stats = fs.statSync(this.filePath);
        return {
          exists: true,
          sizeBytes: stats.size,
          lastModified: stats.mtime.toISOString(),
        };
      }
    } catch (err) {
      // ignore
    }
    return {
      exists: false,
      sizeBytes: 0,
      lastModified: null,
    };
  }
}

export const diskStorage = new DiskStorageManager();
