<template>
    <div class="game-2048">
        <div class="header">
            <div class="title">2048</div>
            <div class="right">
                <div>
                    <div class="score">
                        <div class="label">分数</div>
                        <div class="value">{{ score }}</div>
                    </div>
                    <div class="score">
                        <div class="label">最高分</div>
                        <div class="value">{{ bestScore }}</div>
                    </div>
                </div>
                <div class="btn" @click="init">新建游戏</div>
            </div>
        </div>
        <div class="grid">
            <div v-show="gameOver" class="game-over">游戏结束</div>
            <div v-for="i in count" :key="i" class="cell"></div>
            <div
                v-for="item in pieces"
                :key="item.id"
                class="piece"
                :class="[{ merged: !!item.merged, new: item.isNew }, `color_${item.v}`]"
                :style="{ top: `${item.pos.t}px`, left: `${item.pos.l}px` }"
                @animationend="onAnimationend(item)"
            >
                {{ item.v }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { gameProps, useGame } from './game-2048';
const props = defineProps(gameProps);

const { count, pieces, score, bestScore, gameOver, init, onAnimationend } = useGame(props);
</script>

<style lang="scss" scoped>
@keyframes merged {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes new {
    0% {
        transform: scale(0);
    }

    100% {
        transform: scale(1);
    }
}

$cellSize: v-bind(cellSize);
$gridPadding: v-bind(gridPadding);
$colNum: v-bind(cols);
$gap: v-bind(gridGap);
$containerWidth: calc(($colNum - 1) * $gap + $gridPadding * 2 + $cellSize * $colNum);

.game-2048 {
    width: $containerWidth;
}

.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .title {
        font-size: 70px;
        font-weight: bold;
        line-height: 1;
        color: #776e65;
    }

    .right {
        text-align: right;
    }

    .score {
        display: inline-block;
        padding: 15px 25px;
        font-size: 12px;
        color: #fff;
        text-align: center;
        background-color: #bbada0;
        border-radius: 3px;

        + .score {
            margin-left: 10px;
        }

        .value {
            font-size: 18px;
            font-weight: bold;
        }
    }

    .btn {
        display: inline-block;
        height: 40px;
        padding: 0 20px;
        margin-top: 20px;
        font-weight: bold;
        line-height: 40px;
        color: #fff;
        cursor: pointer;
        background-color: #8f7a66;
        border-radius: 3px;

        &:active {
            opacity: 0.5;
        }
    }
}

.grid {
    position: relative;
    display: inline-grid;
    flex-shrink: 0;
    grid-template-columns: repeat($colNum, $cellSize);
    gap: $gap;
    padding: $gridPadding;
    background: #bbada0;
    border-radius: 10px;

    .game-over {
        position: absolute;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
        font-weight: 700;
        color: #8b7e71;
        text-align: center;
        background: rgb(238 228 218 / 50%);
    }

    .cell {
        align-content: center;
        width: $cellSize;
        height: $cellSize;
        background: rgb(238 228 218 / 35%);
        border-radius: 5px;
    }

    .piece {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: $cellSize;
        height: $cellSize;
        font-size: calc($cellSize / 3);
        font-weight: bold;
        color: #fff;
        border-radius: 5px;
        transition: all 0.1s ease-in-out;

        &.merged {
            z-index: 1;
            animation: merged 0.2s ease;
            animation-delay: 0.1s;
        }

        &.new {
            animation: new 0.2s ease backwards;
            animation-delay: 0.1s;
        }

        &.color_2 {
            color: #776e65;
            background-color: #eee4da;
        }

        &.color_4 {
            color: #776e65;
            background-color: #ede0c8;
        }

        &.color_8 {
            background-color: #f2b179;
        }

        &.color_16 {
            background-color: #f59563;
        }

        &.color_32 {
            background-color: #f67c5f;
        }

        &.color_64 {
            background-color: #f65e3b;
        }

        &.color_128 {
            font-size: calc($cellSize / 3.5);
            background-color: #edcf72;
        }

        &.color_256 {
            font-size: calc($cellSize / 3.5);
            background-color: #edcc61;
        }

        &.color_512 {
            font-size: calc($cellSize / 4);
            background-color: #edc850;
        }

        &.color_1024 {
            font-size: calc($cellSize / 4);
            background-color: #edc53f;
        }

        &.color_2048 {
            font-size: calc($cellSize / 4);
            background-color: #edc22e;
        }

        &.color_4096 {
            font-size: calc($cellSize / 4);
            background-color: #ecb80b;
        }
    }
}
</style>
