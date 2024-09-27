import { buildProps } from '@/utils/vue';
import { computed, onBeforeUnmount, onMounted, ref, watch, type ExtractPropTypes } from 'vue';

export const gameProps = buildProps({
    /**棋盘内边距 */
    gridPadding: { type: String, default: '10px' },
    /**棋盘单元格间距 */
    gridGap: { type: String, default: '10px' },
    /**棋盘单元格大小 */
    cellSize: { type: String, default: '100px' },
    /**棋盘行数 */
    rows: { type: Number, default: 4 },
    /**棋盘列数 */
    cols: { type: Number, default: 4 },
});

type GameProps = ExtractPropTypes<typeof gameProps>;

class Piece {
    id: number;
    /**行号 */
    r: number;
    /**列号 */
    c: number;
    /**值 */
    v: number;
    /**位置 */
    pos: {
        t: number;
        l: number;
    };
    props: GameProps;
    /**被合并的对象 */
    merged?: Piece;
    isNew: boolean;

    constructor(r: number, c: number, v: number, props: GameProps) {
        this.id = id++;
        this.r = r;
        this.c = c;
        this.v = v;
        this.props = props;
        this.pos = this.getPos(r, c);
        this.isNew = true;
    }

    move(r: number, c: number) {
        this.r = r;
        this.c = c;
        this.pos = this.getPos(r, c);
    }

    merge(merged: Piece) {
        this.move(merged.r, merged.c);
        this.merged = merged;
        this.v *= 2;
        return this.v;
    }

    getPos(r: number, c: number) {
        const { cellSize, gridPadding, gridGap } = this.props;
        const _cellSize = parseInt(cellSize);
        const _gap = parseInt(gridGap);
        const _padding = parseInt(gridPadding);
        const t = r * (_cellSize + _gap) + _padding;
        const l = c * (_cellSize + _gap) + _padding;
        return { t, l };
    }
}

let id = 0;
const BEST_SCORE_KEY = 'bestScore';

export function useGame(props: GameProps) {
    const pieces = ref<Piece[]>([]);
    const score = ref(0);
    const bestScore = ref(0);
    const gameOver = ref(false);
    let gameOverTimeout: number;

    const count = computed(() => props.rows * props.cols);

    function random(max: number) {
        return Math.floor(Math.random() * max);
    }

    function buildBlank() {
        const map = pieces.value.reduce<Record<string, boolean>>((map, item) => {
            map[`${item.r}-${item.c}`] = item.v > 0;
            return map;
        }, {});
        const blank: number[] = [];
        for (let r = 0; r < props.rows; r++) {
            for (let c = 0; c < props.cols; c++) {
                if (!map[`${r}-${c}`]) {
                    blank.push(getIndex(r, c));
                }
            }
        }
        return blank;
    }

    function generate(count = 1) {
        const blank = buildBlank();
        if (!blank.length) return;
        while (count--) {
            const randomIndex = random(blank.length);
            const index = blank[randomIndex];
            blank.splice(randomIndex, 1);
            const [r, c] = getRowAndCol(index);
            // 90%的概率生成2，10%的概率生成4
            const v = random(10) === 9 ? 4 : 2;
            pieces.value.push(new Piece(r, c, v, props));
        }
    }

    function init() {
        score.value = 0;
        pieces.value = [];
        gameOver.value = false;

        generate(2);

        // function build(arr: number[][]) {
        //     return arr.map((row, r) => row.map((v, c) => new Piece(r, c, v, props)).filter((item) => item.v > 0)).flat();
        // }

        // pieces.value = build([
        //     [0, 2, 0, 0],
        //     [2, 2, 2, 2],
        //     [0, 4, 0, 4],
        //     [0, 4, 2, 2],
        // ]);

        // pieces.value = build([
        //     [2, 4, 8, 16],
        //     [32, 64, 128, 512],
        //     [1024, 2048, 4096, 4],
        //     [0, 4, 2, 2],
        // ]);
    }

    function isGameOver() {
        if (pieces.value.length < count.value) return false;
        for (let r = 0; r < props.rows; r++) {
            for (let c = 0; c < props.cols; c++) {
                const current = getPiece(r, c);
                if (!current?.v) return false;
                if (c < props.cols - 1) {
                    const nextHorizontal = getPiece(r, c + 1);
                    // 只要存在当前元素和水平方向下一个元素相等，那么游戏就未结束【水平方向可合并】
                    if (current.v === nextHorizontal?.v) return false;
                }
                if (r < props.rows - 1) {
                    const nextVertical = getPiece(r + 1, c);
                    // 只要存在当前元素和竖直方向下一个元素相等，那么游戏就未结束【竖直方向可合并】
                    if (current.v === nextVertical?.v) return false;
                }
            }
        }
        return true;
    }

    function handleGameOver() {
        clearTimeout(gameOverTimeout);
        gameOverTimeout = setTimeout(() => {
            gameOver.value = isGameOver();
        }, 300);
    }

    function getRowAndCol(i: number) {
        const r = Math.floor(i / props.rows);
        const c = i % props.cols;
        return [r, c];
    }

    function getIndex(r: number, c: number) {
        return r * props.rows + c;
    }

    function getPiece(r: number, c: number) {
        return pieces.value.find((item) => item.r === r && item.c === c);
    }

    function onAnimationend(piece: Piece) {
        if (piece.merged) {
            // 删除被合并的元素
            const index = pieces.value.findIndex((item) => item.id === piece.merged?.id);
            pieces.value.splice(index, 1);
            piece.merged = undefined;
        }
        if (piece.isNew) {
            piece.isNew = false;
            // 新建元素的动画结束，再判断游戏是否结束
            handleGameOver();
        }
    }

    function move(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
        let changed = false;

        /**查询某个点的下一个位置 */
        function findNext(r: number, c: number) {
            // 向下，下一个位置应该是从下往上
            if (direction === 'DOWN') {
                if (r <= 0) return null;
                return [r - 1, c];
            }
            // 向上，下一个位置是从上往下
            if (direction === 'UP') {
                if (r >= props.rows - 1) return null;
                return [r + 1, c];
            }
            // 向右，下一个位置是从右往左
            if (direction === 'RIGHT') {
                if (c <= 0) return null;
                return [r, c - 1];
            }
            // 向左，下一个位置是从左往右
            if (direction === 'LEFT') {
                if (c >= props.cols - 1) return null;
                return [r, c + 1];
            }
        }

        /**查询某个点的下一个非空元素 */
        function fineNextNonEmpty(r: number, c: number) {
            const next = findNext(r, c);
            if (!next) return;
            const [nr, nc] = next;
            const piece = getPiece(nr, nc);
            if (piece?.v) return piece;
            return fineNextNonEmpty(nr, nc);
        }

        function calc(r: number, c: number) {
            const nextNonEmpty = fineNextNonEmpty(r, c);
            if (!nextNonEmpty) return;

            const current = getPiece(r, c);
            if (!current) {
                // 将下一个非空位置移动到当前位置
                nextNonEmpty.move(r, c);
                changed = true;
                // 重新处理当前位置
                calc(r, c);
            } else if (current.v === nextNonEmpty.v) {
                // 将下一个非空位置合并到当前位置，并计算当前分数
                score.value += nextNonEmpty.merge(current);
                changed = true;
            }
            // 继续处理下一个位置
            const nextPos = findNext(r, c);
            if (nextPos) calc(nextPos[0], nextPos[1]);
        }

        if (direction === 'UP') {
            for (let c = 0; c < props.cols; c++) {
                calc(0, c);
            }
        } else if (direction === 'DOWN') {
            for (let c = 0; c < props.cols; c++) {
                calc(props.rows - 1, c);
            }
        } else if (direction === 'LEFT') {
            for (let r = 0; r < props.rows; r++) {
                calc(r, 0);
            }
        } else if (direction === 'RIGHT') {
            for (let r = 0; r < props.rows; r++) {
                calc(r, props.cols - 1);
            }
        }

        if (changed) {
            generate();
        }
    }

    function onKeyup(e: KeyboardEvent) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                move('UP');
                break;
            case 'KeyS':
            case 'ArrowDown':
                move('DOWN');
                break;
            case 'KeyA':
            case 'ArrowLeft':
                move('LEFT');
                break;
            case 'KeyD':
            case 'ArrowRight':
                move('RIGHT');
                break;
        }
    }

    onMounted(() => {
        window.addEventListener('keyup', onKeyup);
        const _bestScore = localStorage.getItem(BEST_SCORE_KEY);
        if (_bestScore && /^\d+$/.test(_bestScore)) {
            bestScore.value = parseInt(_bestScore);
        }
    });

    onBeforeUnmount(() => {
        window.addEventListener('keyup', onKeyup);
    });

    watch(score, (score) => {
        if (score > bestScore.value) {
            bestScore.value = score;
            localStorage.setItem(BEST_SCORE_KEY, score + '');
        }
    });

    return {
        count,
        pieces,
        gameOver,
        score,
        bestScore,
        init,
        onAnimationend,
    };
}
