<script setup lang="ts">
import { reactive, ref } from 'vue'
import DataCloudsRain from './components/DataCloudsRain.vue'

interface Holiday {
  holiday: boolean
  name: string
  date: string
}

interface HolidayGroupBy {
  name: string
  rest: number
  date: string[]
}

const tts = ref('')
const holidayObjArr = reactive<HolidayGroupBy[]>([])
const holidayVisible = ref(true)
const animationVisible = ref(true)

getTTS()
getHolidayData()
scheduledUpdate()

window.api.onUpdate(() => {
  getTTS()
  getHolidayData()
})
window.api.onToggleHoliday(() => {
  holidayVisible.value = !holidayVisible.value
})
window.api.onToggleAnimation(() => {
  animationVisible.value = !animationVisible.value
})

async function getTTS() {
  await fetch('https://timor.tech/api/holiday/tts/')
    .then((res) => res.json())
    .then((datas) => {
      tts.value = datas.tts
    })
  await fetch('https://timor.tech/api/holiday/tts/next/')
    .then((res) => res.json())
    .then((datas) => {
      window.electron.ipcRenderer.send('message', datas.tts)
    })
}

async function getHolidayData() {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const day = new Date().getDate()
  const today = `${year}-${month}-${day}`
  const holidayData: HolidayGroupBy[] = await fetchHolidayData(year, today)
  holidayObjArr.splice(0, Infinity, ...holidayData)
  if (holidayData.length < 3) {
    holidayObjArr.push(...(await fetchHolidayData(year + 1, today)))
  }
  holidayObjArr.splice(3)
}
async function fetchHolidayData(year: number, today: string) {
  const result = reactive<HolidayGroupBy[]>([])
  await fetch(`https://timor.tech/api/holiday/year/${year}`)
    .then((res) => res.json())
    .then(({ holiday }) => {
      // 如果没数据,则只返回元旦
      if (Object.values(holiday).length === 0) {
        const rest = Math.ceil(
          (new Date(`${year}-01-01`).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
        )
        result.push({ name: '元旦', rest, date: [] })
      } else {
        let holidayGroupBy: HolidayGroupBy = { name: '', rest: 0, date: [] as string[] }
        void (Object.values(holiday) as Holiday[])
          .filter(
            (item) => new Date(item.date).getTime() >= new Date(today).getTime() && item.holiday
          )
          .forEach((item) => {
            if (item.name === holidayGroupBy.name) {
              holidayGroupBy.date.push(item.date)
            } else {
              const rest = Math.ceil(
                (new Date(item.date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
              )
              holidayGroupBy = { name: item.name, rest, date: [item.date] }
              result.push(holidayGroupBy)
            }
          })
      }
    })
  return result
}

// 第二天定时更新
function scheduledUpdate() {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const day = new Date().getDate()
  const tomorrow = `${year}-${month}-${day + 1}`
  const deltaTime = new Date(tomorrow).getTime() - new Date().getTime()
  setTimeout(
    () => {
      getTTS()
      getHolidayData()
      scheduledUpdate()
    },
    deltaTime + 1000 * 60
  )
}

function alert(name: string, date: string[]) {
  if (date.length) {
    window.alert(`${name}放${date.length}天假，从${date[0]}到${date[date.length - 1]}`)
  }
}
</script>

<template>
  <div id="container">
    <DataCloudsRain v-if="animationVisible"></DataCloudsRain>
    <div v-if="holidayVisible" id="holiday">
      <p id="title">🌟 假日倒计时 🌟</p>
      <div>{{ tts }}</div>
      <hr />
      <div v-if="holidayObjArr.length === 0" id="empty">无数据</div>
      <div v-for="({ name, rest, date }, index) in holidayObjArr" v-else :key="index">
        <p class="holiday-item">
          🔥 距【<span class="holiday-name" @click="alert(name, date)">{{ name }}</span
          >】还有 <span class="holiday-rest">{{ rest }}</span> 天
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  position: relative;
  height: 100vh;
  width: 100vw;
}
#holiday {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  padding: 8px 15px;
  margin: 10px;
  font-size: 13px;
}

#title {
  font-size: 18px;
  font-weight: bold;
}

#empty {
  margin: 10px;
}

hr {
  border: none;
  border-top: 1px dotted #8a45a3;
  width: 100%;
  margin: 5px 0 -5px 0;
}

.holiday-item .holiday-name {
  font-weight: bold;
  color: #8a45a3;
}

.holiday-item .holiday-rest {
  font-size: 25px;
  color: #8a45a3;
  font-weight: bold;
}
</style>
