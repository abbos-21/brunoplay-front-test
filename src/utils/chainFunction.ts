export const runChainUntilSuccess = async (functions: Array<() => Promise<unknown>>) => {
  for (const func of functions) {
    try {
      await func()
      console.log(`Successfully executed: ${func.name}. Stopping chain.`)
      return
    } catch (error) {
      console.warn(`Function ${func.name} failed. Moving to next function.`, error)
    }
  }

  console.error('FAILURE: All functions in the chain failed to execute successfully.')
}
