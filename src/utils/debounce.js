export default function (fn, timeout = 300) {
  let timer = null
  return function (...args) {
    if (timer !== null) clearTimeout(timer)
    const context = this

    timer = setTimeout(() => {
      timer = null
      fn.apply(context, args)
    }, timeout)
  }
}
