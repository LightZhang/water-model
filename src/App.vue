<template>
  <div id="app">
    <index />
  </div>
</template>

<script>
import index from './components/index.vue'

export default {
  name: 'app',
  components: {
    index
  }
}
</script>

<style>
html,
body {
  display: flex;
  flex: 1;
  height: 100%;
  margin: 0px;
  padding: 0px;
}
#app {
  display: flex;
  flex: 1;
}
</style>
