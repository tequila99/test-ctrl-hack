<template>
<div class="main-form">
  <div class="main-form__row">
    <div class="main-form__col-3">
      <input type="number" placeholder="Цена" id="price" :value="displayPrice" @input="setValue('price', $event)"/>
      <label class="text-center" for="price">{{ displayPrice }}</label>
    </div>
    <div class="main-form__col-3">
      <input type="text" placeholder="Количество" id="qty" :value="displayQty" @input="setValue('qty', $event)"/>
      <label class="text-center" for="price">{{ displayQty }}</label>
    </div>
    <div class="main-form__col-3">
      <input type="text" id="amount" placeholder="Сумма" :value="displayAmount" @input="setValue('amount', $event)"/>
      <label class="text-center" for="price">{{ displayAmount }}</label>
    </div>
    <div class="main-form__col-3">
      <button :disabled="!enableSend" @click="handleSend">Отправить</button>
      <span class="main-form__info">{{ info  }}</span>
    </div>
  </div>
  <div class="main-form__logs">
    <textarea class="main-form__textarea" name="logs" id="logs" :value="logs"/>
  </div>
</div>
</template>

<script>
import debounce from '../utils/debounce.js'
import { getInfo, getNewNonce } from '../utils/storage.js'
import { addOne } from '../utils/api.js'

export default {
  name: 'Main',
  data () {
    return {
      qty: 0,
      price: 0,
      amount: 0,
      info: getInfo(),
      logs: '',
      queue: [],
      lockWatch: false
    }
  },
  watch: {
    qty () {
      if (this.lockWatch) return
      this.addLog(`Измение значения поля ввода количества. Новое значение: ${this.displayQty || 'отсутствует'}`)
      this.calculate('qty')
    },
    price () {
      if (this.lockWatch) return
      this.addLog(`Измение значения поля ввода цены. Новое значение: ${this.displayPrice || 'отсутсвует'}`)
      this.calculate('price')
    },
    amount () {
      if (this.lockWatch) return
      this.addLog(`Измение значения поля ввода суммы. Новое значение: ${this.displayAmount || 'отсутствует'}`)
      this.calculate('amount')
    }
  },
  computed: {
    displayQty () { return this.qty ? this.qty.toFixed(0) : '' },
    displayPrice () { return this.price ? this.price.toFixed(2) : '' },
    displayAmount () { return this.amount ? this.amount.toFixed(2) : '' },
    enableSend () { return !!this.amount && !!this.qty && !!this.price }
  },
  methods: {
    setValue: debounce(function (entity, event) {
      this[entity] = entity === 'qty' ? parseInt(event.target.value) : parseFloat(event.target.value)
    }, 300),
    calculate (entity) {
      if (this.queue.at(-1) !== entity) this.queue.push(entity)
      if (this.queue.length < 2) return
      if (this.queue.length > 2) this.queue.shift()
      this.lockWatch = true
      if (!this.queue.includes('qty')) this.calcQty()
      if (!this.queue.includes('amount')) this.calcAmount()
      if (!this.queue.includes('price')) this.calcPrice()
      this.$nextTick(() => {
        this.lockWatch = false
      })
    },
    calcPrice () {
      this.price = this.amount / this.qty
    },
    calcAmount () {
      this.amount = this.qty * this.price
    },
    calcQty () {
      this.qty = this.amount / this.price
    },
    async handleSend () {
      const payload = {
        nonce: getNewNonce(),
        qty: this.qty,
        price: this.price,
        amount: this.amount
      }
      this.addLog(`Попытка отправить данные: ${JSON.stringify(payload)} на бекенд. Текущие данные ${this.info || 'отсутствуют'}`)
      try {
        const respond = await addOne(payload)
        if (!respond.success) throw new Error(`Ошибка при попытке отправки данных. Ответ сервера ${JSON.stringify(respond)}. Текущие данные ${this.info || 'отсутсвуют'}`)
        this.info = getInfo()
        this.addLog(`Успешная попытка отправки данных. Ответ сервера ${JSON.stringify(respond)}. Текущие данные ${this.info || 'отсутсвуют'}`)
      } catch (error) {
        this.addLog(error.message)
      }
    },
    addLog (message) {
      this.logs = Date() + ': ' + message + '\n' + this.logs
    }
  }
}
</script>

<style>
.main-form {
  display: flex;
  flex-direction: column;
  width: 80%;
  height: calc(100vh - 60px);
}
.main-form__row {
  display: flex;
  flex-direction: row;
  height: 120px;
}
.main-form__col-3 {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 30px;
  gap: 40px;
}
.main-form__input {
  text-align: right;
}
.text-center {
  text-align: center;
}
.main-form__logs {
  flex: 1;
  padding: 20px;
}
.main-form__textarea {
  width: 100%;
  height: 100%;
  font-size: 10px
}
.main-form__info {
  font-size: 10px;
  text-align: center;
}
</style>
