// Run with Node.js 22.18+ or 24: node --test tests/vendor-review.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { buildVendorReviewPayload, requiredVendorFields, validateOwnerIdentity, vendorReviewError } from '../src/lib/vendor-review.ts'

const valid = Object.fromEntries(Object.keys(requiredVendorFields).map(key => [key, ` ${key} value `]))

test('all seven API fields are sent, trimmed, without optional UI fields', () => {
  const result = buildVendorReviewPayload({ ...valid, vendor_website: 'example.com' })
  assert.equal(Object.keys(result).length, 7)
  for (const key of Object.keys(requiredVendorFields)) assert.equal(result[key], `${key} value`)
  assert.equal('vendor_website' in result, false)
})

for (const [field, label] of Object.entries(requiredVendorFields)) {
  for (const value of [undefined, null, '', '   ']) {
    test(`${field} rejects ${JSON.stringify(value)}`, () => {
      assert.throws(() => buildVendorReviewPayload({ ...valid, [field]: value }), err => err.message.includes(label))
    })
  }
}

test('accepted MIME types and size boundary match existing upload API', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) {
    assert.doesNotThrow(() => validateOwnerIdentity({ type, size: 5 * 1024 * 1024 }))
  }
  assert.throws(() => validateOwnerIdentity({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }), /5 MB/)
  assert.throws(() => validateOwnerIdentity({ type: 'image/jpeg', size: 0 }), /kosong/)
  assert.throws(() => validateOwnerIdentity({ type: 'text/html', size: 100 }), /JPG/)
})

test('FastAPI 422 details show the affected field and real API message', () => {
  assert.equal(vendorReviewError({ detail: [{ loc: ['body', 'vendor_owner_id_card_url'], msg: 'Field required' }] }, 'fallback'), 'Identitas Pemilik: Field required')
  assert.equal(vendorReviewError({ detail: 'Pengajuan sedang direview' }, 'fallback'), 'Pengajuan sedang direview')
  assert.equal(vendorReviewError(new Error('Network failure'), 'fallback'), 'Network failure')
  assert.equal(vendorReviewError({ detail: [null, {}] }, 'fallback'), 'fallback')
  assert.equal(vendorReviewError(undefined, 'fallback'), 'fallback')
})
