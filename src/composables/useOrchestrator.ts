/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'

export interface OrchestratorTask {
  name: string
  probability: number
  fn: () => any | Promise<any>
}

export function useOrchestrator(tasks: OrchestratorTask[]) {
  const lastExecuted = ref<string | null>(null)

  function validateProbabilities() {
    const total = tasks.reduce((sum, t) => sum + t.probability, 0)
    if (total !== 100) {
      throw new Error('Total probability must equal 100%')
    }
  }

  function selectTask(): OrchestratorTask {
    validateProbabilities()

    if (tasks.length === 0) {
      throw new Error('No tasks provided')
    }

    const rand = Math.random() * 100
    let cumulative = 0

    for (const task of tasks) {
      cumulative += task.probability
      if (rand < cumulative) {
        return task
      }
    }

    const last = tasks[tasks.length - 1]
    if (!last) {
      throw new Error('No task selected')
    }
    return last
  }

  function run() {
    const task = selectTask()
    lastExecuted.value = task.name
    return task.fn()
  }

  async function runAsync() {
    const task = selectTask()
    lastExecuted.value = task.name
    return await task.fn()
  }

  return {
    run,
    runAsync,
    lastExecuted,
  }
}
