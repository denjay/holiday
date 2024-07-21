<script setup lang="ts">
import { ref } from 'vue'
const translateY = ref(`${window.screen.availHeight / 2 - 85}px`)
function randomText() {
  const text = '!@$%^&()_+'
  return text[Math.floor(Math.random() * text.length)]
}

function rain() {
  const cloud = document.querySelector('.cloud')!
  const e = document.createElement('div')
  e.classList.add('drop')
  cloud.appendChild(e)

  const left = Math.floor(Math.random() * 290)
  const size = Math.random() * 1.5
  const duration = Math.random() * 1

  e.innerText = randomText()
  e.style.left = left + 'px'
  e.style.fontSize = 0.5 + size + 'em'
  e.style.animationDuration = 1 + duration + 's'
}

for (let i = 0; i < 50; i++) {
  setTimeout(rain, i * 400)
}
</script>

<template>
  <div :style="{ '--translateY': translateY }" class="container">
    <div class="cloud">
      <h2>Data Rain Cloud</h2>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');

:root {
  --clr: #0f0;
}

.container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: animateColor 5s linear infinite;
}

@keyframes animateColor {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

.container .cloud {
  position: relative;
  width: 350px;
  z-index: 100;
  filter: drop-shadow(0 0 35px var(--clr));
}

.container .cloud h2 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  color: white;
  font-size: 2em;
  z-index: 1000;
  font-weight: 400;
  padding: 0px 10px;
  border-radius: 10px;
  text-transform: uppercase;
  background: var(--clr);
}

.container .cloud h2::before {
  content: '';
  position: absolute;
  top: -115px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 100px;
  width: 120%;
  height: 100px;
  background: var(--clr);
}

.container .cloud h2::after {
  content: '';
  position: absolute;
  top: -150px;
  left: 25px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--clr);
  box-shadow: 120px -30px 0 40px var(--clr);
}

.container .cloud .drop {
  position: absolute;
  top: 60px;
  height: 20px;
  line-height: 20px;
  color: var(--clr);
  transform-origin: bottom;
  animation: animate 2s linear infinite;
}

@keyframes animate {
  0% {
    transform: translateY(0) scaleY(0);
    transform-origin: top;
  }
  10% {
    transform: translateY(0) scaleY(0.25);
    transform-origin: top;
  }
  20% {
    transform: translateY(0) scaleY(1);
  }
  70% {
    transform: translateY(var(--translateY)) scaleY(1);
    transform-origin: bottom;
  }
  80% {
    transform: translateY(var(--translateY)) scaleY(1);
    transform-origin: bottom;
  }
  100% {
    transform: translateY(var(--translateY)) scaleY(0);
    transform-origin: bottom;
    text-shadow:
      -180px 0 0 var(--clr),
      180px 0 0 var(--clr);
  }
}
</style>
