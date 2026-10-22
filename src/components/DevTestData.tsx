import { addCheckIns, removeCheckIns } from '../lib/storage'
import { TEST_ID_PREFIX, testCheckIns } from '../lib/testData'
import { toast } from '../lib/ui'

/** Only rendered under `npm run dev`. Loads fixed sample check-ins for checking the mood chart. */
export function DevTestData() {
  return (
    <section className="rounded-xl border border-dashed border-line p-4" aria-label="Developer test data">
      <p className="text-sm text-muted">Dev only, not in the production build. Test check-ins skip days that already have a real one.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-quiet"
          onClick={() => {
            const n = addCheckIns(testCheckIns())
            toast(n ? `Added ${n} test check-ins.` : 'Test check-ins are already loaded.')
          }}
        >
          Load test check-ins
        </button>
        <button
          type="button"
          className="btn-quiet"
          onClick={() => {
            const n = removeCheckIns(TEST_ID_PREFIX)
            toast(n ? `Removed ${n} test check-ins.` : 'No test check-ins to remove.')
          }}
        >
          Remove test check-ins
        </button>
      </div>
    </section>
  )
}
