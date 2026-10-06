import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from '@playwright/test/reporter'

/**
 * Resumo de skips no log da run.
 *
 * O reporter padrão só diz "N skipped" — não diz O QUE nem POR QUE. Este
 * percorre a suíte no fim e imprime cada teste pulado com o motivo declarado,
 * seja de `test.skip(condição, 'motivo')` (skip discriminante de dado do
 * ambiente) ou de `describe.skip` (fora de escopo). Assim o CI deixa explícito
 * que os skips são intencionais/condicionais, não falhas mascaradas.
 */
class SkipsReporter implements Reporter {
  private suite?: Suite

  onBegin(_config: FullConfig, suite: Suite) {
    this.suite = suite
  }

  onEnd(_result: FullResult) {
    const skipped = (this.suite?.allTests() ?? []).filter(
      (t: TestCase) => t.outcome() === 'skipped'
    )
    if (skipped.length === 0) return

    const lines = skipped.map((t: TestCase) => {
      const title = t.titlePath().filter(Boolean).join(' › ')
      const reason =
        t.annotations.find(a => a.type === 'skip')?.description?.trim() ||
        'sem motivo declarado (describe.skip ou test.skip sem descrição) — ver título'
      return `   • ${title}\n       ↳ ${reason}`
    })

    console.log(
      `\n⏭️  Testes pulados (${skipped.length}) — motivos:\n${lines.join('\n')}\n`
    )
  }
}

export default SkipsReporter
