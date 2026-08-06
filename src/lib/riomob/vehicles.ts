import {
  MOCK_VEHICLES,
  type WalletVehicle,
} from '@/app/(app)/(logged-in)/carteira/riomob/mocks/vehicles'

/** When unset, mocks stay on (local/dev default). Set to `false` to disable. */
export function isRiomobMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_RIOMOB_USE_MOCKS !== 'false'
}

/** Wallet vehicle list for home Carteira and `/carteira?riomob=true`. */
export function getRiomobWalletVehicles(): WalletVehicle[] {
  return isRiomobMocksEnabled() ? MOCK_VEHICLES : []
}
