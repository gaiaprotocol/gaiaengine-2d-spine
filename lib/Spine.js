import { GameObject, TextureLoader } from "@gaiaengine/2d";
import { AtlasAttachmentLoader, SkeletonBinary, Spine as PixiSpine, SpineTexture, TextureAtlas, } from "@pixi/spine-pixi";
export default class Spine extends GameObject {
    options;
    onAnimEnd;
    pixiSpine;
    _animation;
    constructor(x, y, options, onAnimEnd) {
        super(x, y);
        this.options = options;
        this.onAnimEnd = onAnimEnd;
        this.load();
    }
    async load() {
        let texture;
        let atlasData;
        let skeletonBynary;
        await Promise.all([
            (async () => texture = await TextureLoader.load(this.options.png))(),
            (async () => atlasData = await (await fetch(this.options.atlas)).text())(),
            (async () => skeletonBynary = new Uint8Array(await (await fetch(this.options.skel)).arrayBuffer()))(),
        ]);
        if (!texture || this.removed)
            return;
        const atlas = new TextureAtlas(atlasData);
        atlas.pages.forEach((page) => page.setTexture(SpineTexture.from(texture.source)));
        const attachmentLoader = new AtlasAttachmentLoader(atlas);
        const binaryLoader = new SkeletonBinary(attachmentLoader);
        const skeletonData = binaryLoader.readSkeletonData(skeletonBynary);
        this.pixiSpine = new PixiSpine(skeletonData);
        this.pixiSpine.pivot.y = -this.pixiSpine.getLocalBounds().height / 2;
        this.pixiSpine.state.addListener({
            complete: (entry) => this.onAnimEnd?.(entry.animation?.name ?? ""),
        });
        this.animation = this.options.animation;
        this.container.addChild(this.pixiSpine);
    }
    set animation(animation) {
        this._animation = animation;
        if (this.pixiSpine && animation) {
            this.pixiSpine.state.setAnimation(0, animation, this.options.loop ?? true);
        }
    }
    get animation() {
        return this._animation;
    }
    remove() {
        TextureLoader.release(this.options.png);
        super.remove();
    }
}
//# sourceMappingURL=Spine.js.map