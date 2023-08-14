const PREFIX = 'test-ctrl-hack-'

export function getNewNonce () {
  const nonce = parseInt(localStorage.getItem(PREFIX + 'nonce') || 1)
  localStorage.setItem(PREFIX + 'nonce', nonce + 1)

  return nonce
}

export function getInfo () {
  return localStorage.getItem(PREFIX + 'info') || ''
}

export function setInfo ({ nonce, qty, price, amount }) {
  localStorage.setItem(PREFIX + 'info', JSON.stringify({ nonce, qty, price, amount }))
}
