import { BodyNode } from "@common-module/app";
import GameScreen from "./GameScreen.js";
export default class Fullscreen extends GameScreen {
    constructor(...gameNodes) {
        super(document.documentElement.clientWidth, window.innerHeight, ...gameNodes);
        this.appendTo(BodyNode);
    }
}
//# sourceMappingURL=Fullscreen.js.map