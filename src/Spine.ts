import {
  AtlasAttachmentLoader,
  Spine as PixiSpine,
  SkeletonBinary,
  SkeletonData,
  SkeletonJson,
  Skin as SpineSkin,
  SpineTexture,
  TextureAtlas,
} from "@esotericsoftware/spine-pixi-v8";
import {
  BinaryLoader,
  GameObject,
  TextLoader,
  TextureLoader,
} from "@gaiaengine/2d";
import { Texture } from "pixi.js";

interface SpineOptions {
  atlas: string;
  skeletonData?: any;
  skel?: string;
  json?: string;
  texture: Record<string, string> | string;
  skins?: string[];
  animation?: string;
  loop?: boolean;
  onLoad?: () => void;
  onAnimationEnd?: (animation: string) => void;
}

export default class Spine extends GameObject {
  private pixiSpine: PixiSpine | undefined;
  private _animation: string | undefined;
  private _skins: string[] = [];

  constructor(x: number, y: number, private options: SpineOptions) {
    super(x, y);
    this.load();
  }

  private async load() {
    const promises: Promise<any>[] = [];

    let textAtlasData: string | undefined;
    let skeletonBynary: Uint8Array | undefined;
    let textSkeletonData: string | undefined;

    let texture: Texture | undefined;
    let textures: Record<string, Texture> | undefined;

    promises.push(
      (async () => textAtlasData = await TextLoader.load(this.options.atlas))(),
    );

    if (this.options.skeletonData) {}
    else if (this.options.skel !== undefined) {
      promises.push(
        (async () =>
          skeletonBynary = await BinaryLoader.load(this.options.skel!))(),
      );
    } else if (this.options.json !== undefined) {
      promises.push(
        (async () =>
          textSkeletonData = await TextLoader.load(this.options.json!))(),
      );
    } else {
      throw new Error("Either skel or json must be provided");
    }

    if (typeof this.options.texture === "string") {
      promises.push(
        (async () =>
          texture = await TextureLoader.load(this.options.texture as string))(),
      );
    } else {
      textures = {};
      for (const [key, path] of Object.entries(this.options.texture)) {
        promises.push(
          (async () => {
            const texture = await TextureLoader.load(path);
            if (texture) textures[key] = texture;
          })(),
        );
      }
    }

    await Promise.all(promises);

    if ((!texture && !textures) || this.removed) return;

    const atlas = new TextureAtlas(textAtlasData!);
    atlas.pages.forEach((page) => {
      if (texture) page.setTexture(SpineTexture.from(texture.source));
      else if (textures) {
        page.setTexture(SpineTexture.from(textures[page.name].source));
      }
    });

    const atlasLoader = new AtlasAttachmentLoader(atlas);

    let skeletonData: SkeletonData;
    if (this.options.skeletonData) {
      const jsonLoader = new SkeletonJson(atlasLoader);
      skeletonData = jsonLoader.readSkeletonData(this.options.skeletonData);
    } else if (skeletonBynary) {
      const binaryLoader = new SkeletonBinary(atlasLoader);
      skeletonData = binaryLoader.readSkeletonData(skeletonBynary);
    } else if (textSkeletonData) {
      const jsonLoader = new SkeletonJson(atlasLoader);
      skeletonData = jsonLoader.readSkeletonData(textSkeletonData);
    } else {
      throw new Error("Either skel or json must be provided");
    }

    this.pixiSpine = new PixiSpine(skeletonData);
    this.pixiSpine.state.addListener({
      complete: (entry) =>
        this.options.onAnimationEnd?.(entry.animation?.name ?? ""),
    });

    this.animation = this.options.animation;
    if (this.options.skins) this.skins = this.options.skins;

    this.container.addChild(this.pixiSpine);
    this.options.onLoad?.();
  }

  public set animation(animation: string | undefined) {
    this._animation = animation;

    if (this.pixiSpine && animation) {
      this.pixiSpine.state.setAnimation(
        0,
        animation,
        this.options.loop ?? true,
      );
      this.pixiSpine.state.apply(this.pixiSpine.skeleton);
    }
  }

  public get animation(): string | undefined {
    return this._animation;
  }

  public set skins(skins: string[]) {
    this._skins = skins;

    if (this.pixiSpine) {
      const newSkin = new SpineSkin("combined-skin");
      for (const skinName of skins) {
        const skin = this.pixiSpine.skeleton.data.findSkin(skinName);
        if (skin) newSkin.addSkin(skin);
      }
      this.pixiSpine.skeleton.setSkin(newSkin);
      this.pixiSpine.skeleton.setSlotsToSetupPose();
    }
  }

  public get skins(): string[] {
    return this._skins;
  }

  public remove(): void {
    if (typeof this.options.texture === "string") {
      TextureLoader.release(this.options.texture);
    } else {
      for (const path of Object.values(this.options.texture)) {
        TextureLoader.release(path);
      }
    }
    super.remove();
  }
}
