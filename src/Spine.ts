import { GameObject, TextureLoader } from "@gaiaengine/2d";
import {
  AtlasAttachmentLoader,
  SkeletonBinary,
  SkeletonJson,
  Skin as SpineSkin,
  Spine as PixiSpine,
  SpineTexture,
  TextureAtlas,
} from "@pixi/spine-pixi";
import { Texture } from "pixi.js";

interface SpineOptions {
  atlas: string;
  skel?: string;
  json?: string;
  png: Record<string, string> | string;
  skins?: string[];
  animation?: string;
  loop?: boolean;
  onAnimationEnd?: (animation: string) => void;
}

export default class Spine extends GameObject {
  private pixiSpine: PixiSpine | undefined;
  private _animation: string | undefined;

  constructor(x: number, y: number, private options: SpineOptions) {
    super(x, y);
    this.load();
  }

  private async load() {
    let texture: Texture | undefined;
    let textures: Record<string, Texture> | undefined;
    let textAtlasData: string;
    let skeletonBynary: Uint8Array | undefined;
    let textSkeletonData: string | undefined;

    const promises: Promise<any>[] = [];

    promises.push(
      (async () =>
        textAtlasData = await (await fetch(this.options.atlas)).text())(),
    );

    if (this.options.skel !== undefined) {
      promises.push(
        (async () =>
          skeletonBynary = new Uint8Array(
            await (await fetch(this.options.skel!)).arrayBuffer(),
          ))(),
      );
    } else if (this.options.json !== undefined) {
      promises.push(
        (async () =>
          textSkeletonData = await (await fetch(this.options.json!)).text())(),
      );
    } else {
      throw new Error("Either skel or json must be provided");
    }

    if (typeof this.options.png === "string") {
      promises.push(
        (async () =>
          texture = await TextureLoader.load(this.options.png as string))(),
      );
    } else {
      textures = {};
      for (const [key, path] of Object.entries(this.options.png)) {
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

    const attachmentLoader = new AtlasAttachmentLoader(atlas);

    let skeletonData;
    if (skeletonBynary) {
      const binaryLoader = new SkeletonBinary(attachmentLoader);
      skeletonData = binaryLoader.readSkeletonData(skeletonBynary);
    } else if (textSkeletonData) {
      const jsonLoader = new SkeletonJson(attachmentLoader);
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

    if (this.options.skins !== undefined) {
      this.changeSkins(this.options.skins);
    }

    this.container.addChild(this.pixiSpine);
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

  private changeSkins(skins: string[]) {
    if (this.pixiSpine) {
      const newSkin = new SpineSkin("combined-skin");
      for (const skinName of skins) {
        const skin = this.pixiSpine.skeleton.data.findSkin(skinName);
        if (skin) newSkin.addSkin(skin);
      }
      this.pixiSpine.skeleton.skin = newSkin;
      this.pixiSpine.skeleton.setSlotsToSetupPose();
    }
  }

  public remove(): void {
    if (typeof this.options.png === "string") {
      TextureLoader.release(this.options.png);
    } else {
      for (const path of Object.values(this.options.png)) {
        TextureLoader.release(path);
      }
    }
    super.remove();
  }
}
