import { DomNode } from "@common-module/app";
import GameNode from "../core/GameNode.js";
export default class GameScreen extends DomNode {
    width: number;
    height: number;
    private renderer;
    private animationInterval;
    private targetFPS;
    private actualFPS;
    root: any;
    camera: any;
    ratio: number;
    constructor(width: number, height: number, ...gameNodes: (GameNode | undefined)[]);
    protected resize(width: number, height: number, ratio?: number): void;
    private createRenderer;
    updateRootNodePosition(): void;
    private update;
    private lastFrameTime;
    private accumulatedTime;
    private animate;
    remove(): void;
}
//# sourceMappingURL=GameScreen.d.ts.map