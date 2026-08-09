/** When unset, mocks stay on (local/dev default). Set to `false` to disable. */
export function isRiomobMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_RIOMOB_USE_MOCKS !== 'false'
}
