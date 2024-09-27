<template>
    <div class="app">
        <Game2048 cell-size="100px" />
    </div>
</template>

<script setup lang="ts">
import Game2048 from './components/game-2048/game-2048.vue';
</script>

<style lang="scss" scoped>
.app {
    .game-2048 {
        margin: 29px auto;
    }
}
</style>
