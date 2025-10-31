// lib/sync/conflict-resolution.ts

export interface SyncConflict {
  id: string;
  localVersion: any;
  remoteVersion: any;
  field: string;
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
  mergedVersion?: any;
}

export interface ConflictResolutionOptions {
  autoResolve: boolean;
  preferLocal: boolean;
  mergeStrategy: 'last-wins' | 'manual' | 'smart-merge';
  notifyOnConflict: boolean;
}

export class ConflictResolver {
  private conflicts: Map<string, SyncConflict> = new Map();
  private options: ConflictResolutionOptions = {
    autoResolve: true,
    preferLocal: false,
    mergeStrategy: 'last-wins',
    notifyOnConflict: true,
  };

  /**
   * Detect conflicts between local and remote data
   */
  detectConflicts(localData: any, remoteData: any, key: string): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    // Compare timestamps and versions
    const localTimestamp = localData?._lastModified || localData?.timestamp || 0;
    const remoteTimestamp = remoteData?._lastModified || remoteData?.timestamp || 0;

    // Check for field-level conflicts
    if (localData && remoteData) {
      const conflictingFields = this.findConflictingFields(localData, remoteData);

      conflictingFields.forEach(field => {
        const conflict: SyncConflict = {
          id: this.generateConflictId(key, field),
          localVersion: localData[field],
          remoteVersion: remoteData[field],
          field,
          timestamp: Math.max(localTimestamp, remoteTimestamp),
          resolved: false,
        };

        conflicts.push(conflict);
        this.conflicts.set(conflict.id, conflict);
      });
    }

    return conflicts;
  }

  /**
   * Resolve a conflict automatically
   */
  resolveConflict(conflictId: string, resolution: SyncConflict['resolution']): any {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    let resolvedValue: any;

    switch (resolution) {
      case 'local':
        resolvedValue = conflict.localVersion;
        break;
      case 'remote':
        resolvedValue = conflict.remoteVersion;
        break;
      case 'merge':
        resolvedValue = this.mergeValues(conflict.localVersion, conflict.remoteVersion);
        break;
      case 'manual':
        // Manual resolution required - return null to indicate manual intervention needed
        return null;
      default:
        // Auto-resolve based on strategy
        resolvedValue = this.autoResolve(conflict);
    }

    // Mark conflict as resolved
    conflict.resolved = true;
    conflict.resolution = resolution;
    conflict.mergedVersion = resolvedValue;

    return resolvedValue;
  }

  /**
   * Batch resolve conflicts
   */
  resolveConflictsBatch(conflictIds: string[], resolution: SyncConflict['resolution']): Map<string, any> {
    const resolutions = new Map<string, any>();

    conflictIds.forEach(conflictId => {
      try {
        const resolvedValue = this.resolveConflict(conflictId, resolution);
        if (resolvedValue !== null) {
          resolutions.set(conflictId, resolvedValue);
        }
      } catch (error) {
        console.warn(`Failed to resolve conflict ${conflictId}:`, error);
      }
    });

    return resolutions;
  }

  /**
   * Get all unresolved conflicts
   */
  getUnresolvedConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).filter(conflict => !conflict.resolved);
  }

  /**
   * Get conflict statistics
   */
  getConflictStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    byResolution: Record<string, number>;
  } {
    const allConflicts = Array.from(this.conflicts.values());
    const resolved = allConflicts.filter(c => c.resolved);
    const unresolved = allConflicts.filter(c => !c.resolved);

    const byResolution: Record<string, number> = {};
    resolved.forEach(conflict => {
      const resolution = conflict.resolution || 'unknown';
      byResolution[resolution] = (byResolution[resolution] || 0) + 1;
    });

    return {
      total: allConflicts.length,
      resolved: resolved.length,
      unresolved: unresolved.length,
      byResolution,
    };
  }

  /**
   * Clear resolved conflicts
   */
  clearResolvedConflicts(): number {
    let cleared = 0;
    for (const [id, conflict] of this.conflicts.entries()) {
      if (conflict.resolved) {
        this.conflicts.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Update conflict resolution options
   */
  updateOptions(newOptions: Partial<ConflictResolutionOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  // Private methods

  private findConflictingFields(localData: any, remoteData: any): string[] {
    const conflicts: string[] = [];
    const allFields = new Set([...Object.keys(localData), ...Object.keys(remoteData)]);

    allFields.forEach(field => {
      // Skip metadata fields
      if (field.startsWith('_') || field === 'id') {
        return;
      }

      const localValue = localData[field];
      const remoteValue = remoteData[field];

      // Check if values are different
      if (!this.valuesEqual(localValue, remoteValue)) {
        conflicts.push(field);
      }
    });

    return conflicts;
  }

  private valuesEqual(a: any, b: any): boolean {
    // Handle primitive types
    if (a === b) return true;

    // Handle null/undefined
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, index) => this.valuesEqual(val, b[index]));
    }

    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => keysB.includes(key) && this.valuesEqual(a[key], b[key]));
    }

    return false;
  }

  private mergeValues(localValue: any, remoteValue: any): any {
    // Simple merge strategy - can be enhanced based on data type
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      // Merge arrays by combining unique items
      return [...new Set([...localValue, ...remoteValue])];
    }

    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      // Merge objects by combining properties
      return { ...localValue, ...remoteValue };
    }

    // For primitive values, prefer the most recent
    return localValue;
  }

  private autoResolve(conflict: SyncConflict): any {
    switch (this.options.mergeStrategy) {
      case 'last-wins':
        // Prefer the version with the most recent timestamp
        return this.options.preferLocal ? conflict.localVersion : conflict.remoteVersion;

      case 'smart-merge':
        // Attempt intelligent merging
        return this.mergeValues(conflict.localVersion, conflict.remoteVersion);

      case 'manual':
      default:
        // Require manual resolution
        return null;
    }
  }

  private generateConflictId(key: string, field: string): string {
    return `conflict_${key}_${field}_${Date.now()}`;
  }

  /**
   * Export conflicts for debugging/analysis
   */
  exportConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Import conflicts (for debugging/testing)
   */
  importConflicts(conflicts: SyncConflict[]): void {
    conflicts.forEach(conflict => {
      this.conflicts.set(conflict.id, conflict);
    });
  }
}

// Singleton instance
export const conflictResolver = new ConflictResolver();