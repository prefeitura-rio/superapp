export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { register: nodeRegister } = await import('./instrumentation.node')
    await nodeRegister()
  }
}
