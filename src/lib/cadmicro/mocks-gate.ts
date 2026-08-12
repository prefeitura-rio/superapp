/** When unset, mocks stay on (local/dev default). Set to `false` to disable. */
export function isCadmicroMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CADMICRO_USE_MOCKS !== 'false'
}
