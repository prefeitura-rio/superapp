import { useMemo } from 'react'
import { deepEqual } from '../utils/deep-equal'

/**
 * Configuration for array fields to detect valid new items.
 */
interface ArrayFieldConfig {
  /** Path to the array field (e.g., 'idiomas', 'empregos') */
  fieldPath: string
  /** Function to check if an item has all required fields filled */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isItemComplete: (item: any) => boolean
  /** Function to check if an item is completely empty */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isItemEmpty: (item: any) => boolean
}

/**
 * Options for the useFormDirtyState hook.
 */
interface UseFormDirtyStateOptions<T> {
  /** Current form values (from react-hook-form watch) */
  currentValues: T
  /** Snapshot taken when accordion opened (from useRef) */
  snapshot: T | null
  /** Function to extract comparable fields from the form values */
  getSnapshot: (values: T) => T
  /** Function that validates if the form has all required fields filled */
  hasRequiredFields: (values: T) => boolean
  /** Array field configurations for detecting valid new items */
  arrayFields?: ArrayFieldConfig[]
}

/**
 * Result of the useFormDirtyState hook.
 */
interface UseFormDirtyStateResult {
  /** True if current values differ from snapshot (actual changes detected) */
  isDirty: boolean
  /** True if there are new items in array fields that are complete */
  hasValidNewItems: boolean
  /** True if the Save button should be enabled */
  canSave: boolean
}

/**
 * Hook to detect dirty state in form values by comparing with a snapshot.
 *
 * The Save button should be enabled when:
 * 1. User has modified existing data (isDirty), OR
 * 2. User has added a new item AND filled all required fields (hasValidNewItems)
 *
 * AND hasRequiredFields returns true.
 *
 * @example
 * ```tsx
 * const { canSave } = useFormDirtyState({
 *   currentValues: form.watch(),
 *   snapshot: snapshotRef.current,
 *   getSnapshot: getFormacaoSnapshot,
 *   hasRequiredFields: hasFormacaoRequiredFields,
 *   arrayFields: [
 *     { fieldPath: 'idiomas', isItemComplete: isIdiomaComplete, isItemEmpty: isIdiomaEmpty },
 *   ],
 * });
 *
 * <CustomButton disabled={!canSave}>Salvar</CustomButton>
 * ```
 */
export function useFormDirtyState<T>({
  currentValues,
  snapshot,
  getSnapshot,
  hasRequiredFields,
  arrayFields = [],
}: UseFormDirtyStateOptions<T>): UseFormDirtyStateResult {
  return useMemo(() => {
    // No snapshot yet = accordion just opened, use existing hasRequiredFields logic
    if (!snapshot) {
      return {
        isDirty: false,
        hasValidNewItems: false,
        canSave: hasRequiredFields(currentValues),
      }
    }

    const currentSnapshot = getSnapshot(currentValues)

    // Track meaningful changes
    let hasValidNewItems = false
    let hasIncompleteNewItems = false
    let hasItemsRemoved = false
    let hasExistingItemsModified = false

    for (const { fieldPath, isItemComplete, isItemEmpty } of arrayFields) {
      const currentArray =
        ((currentSnapshot as Record<string, unknown[]>)[fieldPath] as unknown[]) ?? []
      const snapshotArray =
        ((snapshot as Record<string, unknown[]>)[fieldPath] as unknown[]) ?? []

      // Check if items were removed
      if (currentArray.length < snapshotArray.length) {
        hasItemsRemoved = true
      }

      // Check if existing items were modified (compare items at same indices)
      const minLength = Math.min(currentArray.length, snapshotArray.length)
      for (let i = 0; i < minLength; i++) {
        if (!deepEqual(currentArray[i], snapshotArray[i])) {
          hasExistingItemsModified = true
          break
        }
      }

      // Check new items (indices beyond snapshot length)
      if (currentArray.length > snapshotArray.length) {
        const newItems = currentArray.slice(snapshotArray.length)

        for (const item of newItems) {
          const isEmpty = isItemEmpty(item)
          const isComplete = isItemComplete(item)

          if (isComplete && !isEmpty) {
            // New item is complete and valid
            hasValidNewItems = true
          } else if (!isEmpty && !isComplete) {
            // New item has some data but is incomplete - block save
            hasIncompleteNewItems = true
          }
          // If isEmpty, we ignore it (placeholder - no meaningful change)
        }
      }
    }

    // For non-array fields, check if they changed
    // Create copies without array fields to compare scalar values
    const currentScalars = { ...currentSnapshot } as Record<string, unknown>
    const snapshotScalars = { ...snapshot } as Record<string, unknown>
    for (const { fieldPath } of arrayFields) {
      delete currentScalars[fieldPath]
      delete snapshotScalars[fieldPath]
    }
    const hasScalarChanges = !deepEqual(currentScalars, snapshotScalars)

    // isDirty = meaningful changes (not just adding empty placeholders)
    const isDirty =
      hasExistingItemsModified || hasItemsRemoved || hasScalarChanges

    // Can save if:
    // 1. Has meaningful changes (modified existing, removed items, scalar changes, or valid new items)
    // 2. AND no incomplete new items exist
    // 3. AND required fields are filled
    const meetsRequirements = hasRequiredFields(currentValues)
    const hasMeaningfulChanges = isDirty || hasValidNewItems
    const canSave = hasMeaningfulChanges && !hasIncompleteNewItems && meetsRequirements

    return { isDirty, hasValidNewItems, canSave }
  }, [currentValues, snapshot, getSnapshot, hasRequiredFields, arrayFields])
}
