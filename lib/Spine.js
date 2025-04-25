import { AtlasAttachmentLoader, Spine as PixiSpine, SkeletonBinary, SkeletonJson, Skin as SpineSkin, SpineTexture, TextureAtlas, } from "@esotericsoftware/spine-pixi-v8";
import { BinaryLoader, GameObject, TextLoader, TextureLoader, } from "@gaiaengine/2d";
export default class Spine extends GameObject {
    options;
    pixiSpine;
    _animation;
    _skins = [];
    constructor(x, y, options) {
        super(x, y);
        this.options = options;
        this.load();
    }
    async load() {
        const promises = [];
        let textAtlasData;
        let skeletonBynary;
        let textSkeletonData;
        let texture;
        let textures;
        promises.push((async () => textAtlasData = await TextLoader.load(this.options.atlas))());
        if (this.options.skeletonData) { }
        else if (this.options.skel !== undefined) {
            promises.push((async () => skeletonBynary = await BinaryLoader.load(this.options.skel))());
        }
        else if (this.options.json !== undefined) {
            promises.push((async () => textSkeletonData = await TextLoader.load(this.options.json))());
        }
        else {
            throw new Error("Either skel or json must be provided");
        }
        if (typeof this.options.texture === "string") {
            promises.push((async () => texture = await TextureLoader.load(this.options.texture))());
        }
        else {
            textures = {};
            for (const [key, path] of Object.entries(this.options.texture)) {
                promises.push((async () => {
                    const texture = await TextureLoader.load(path);
                    if (texture)
                        textures[key] = texture;
                })());
            }
        }
        await Promise.all(promises);
        if ((!texture && !textures) || this.removed)
            return;
        const atlas = new TextureAtlas(textAtlasData);
        atlas.pages.forEach((page) => {
            if (texture)
                page.setTexture(SpineTexture.from(texture.source));
            else if (textures) {
                page.setTexture(SpineTexture.from(textures[page.name].source));
            }
        });
        const atlasLoader = new AtlasAttachmentLoader(atlas);
        let skeletonData;
        if (this.options.skeletonData) {
            const jsonLoader = new SkeletonJson(atlasLoader);
            skeletonData = jsonLoader.readSkeletonData(this.options.skeletonData);
        }
        else if (skeletonBynary) {
            const binaryLoader = new SkeletonBinary(atlasLoader);
            skeletonData = binaryLoader.readSkeletonData(skeletonBynary);
        }
        else if (textSkeletonData) {
            const jsonLoader = new SkeletonJson(atlasLoader);
            skeletonData = jsonLoader.readSkeletonData(textSkeletonData);
        }
        else {
            throw new Error("Either skel or json must be provided");
        }
        this.pixiSpine = new PixiSpine(skeletonData);
        this.pixiSpine.state.addListener({
            complete: (entry) => this.options.onAnimationEnd?.(entry.animation?.name ?? ""),
        });
        this.animation = this.options.animation;
        if (this.options.skins)
            this.skins = this.options.skins;
        this.container.addChild(this.pixiSpine);
        this.options.onLoad?.();
    }
    set animation(animation) {
        this._animation = animation;
        if (this.pixiSpine && animation) {
            this.pixiSpine.state.setAnimation(0, animation, this.options.loop ?? true);
            this.pixiSpine.state.apply(this.pixiSpine.skeleton);
        }
    }
    get animation() {
        return this._animation;
    }
    set skins(skins) {
        this._skins = skins;
        if (this.pixiSpine) {
            const newSkin = new SpineSkin("combined-skin");
            for (const skinName of skins) {
                const skin = this.pixiSpine.skeleton.data.findSkin(skinName);
                if (skin)
                    newSkin.addSkin(skin);
            }
            this.pixiSpine.skeleton.setSkin(newSkin);
            this.pixiSpine.skeleton.setSlotsToSetupPose();
        }
    }
    get skins() {
        return this._skins;
    }
    remove() {
        if (typeof this.options.texture === "string") {
            TextureLoader.release(this.options.texture);
        }
        else {
            for (const path of Object.values(this.options.texture)) {
                TextureLoader.release(path);
            }
        }
        super.remove();
    }
}
//# sourceMappingURL=Spine.js.map