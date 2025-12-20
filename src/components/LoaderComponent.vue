<template>
  <div class="loader-overlay">
    <div class="boxLoading"></div>
  </div>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.boxLoading {
  width: 40px;
  height: 40px;
  position: relative;
  &:before {
    content: '';
    width: 40px;
    height: 4px;
    background: #000;
    opacity: 0.1;
    position: absolute;
    top: 49px;
    left: 0;
    border-radius: 50%;
    animation: shadow 0.5s linear infinite;
  }
  &:after {
    content: '';
    width: 40px;
    height: 40px;
    background: #00bcff;
    animation: animate 0.5s linear infinite;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 3px;
  }
}

@keyframes animate {
  17% {
    border-bottom-right-radius: 3px;
  }
  25% {
    transform: translateY(7.2px) rotate(22.5deg);
  }
  50% {
    transform: translateY(14.4px) scale(1, 0.9) rotate(45deg);

    border-bottom-right-radius: 32px;
  }
  75% {
    transform: translateY(7.2px) rotate(67.5deg);
  }
  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes shadow {
  0%,
  100% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.2, 1);
  }
}
</style>
