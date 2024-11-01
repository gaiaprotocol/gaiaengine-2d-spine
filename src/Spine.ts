import { GameObject, TextureLoader } from "@gaiaengine/2d";
import {
  AtlasAttachmentLoader,
  SkeletonBinary,
  Spine as PixiSpine,
  SpineTexture,
  TextureAtlas,
} from "@pixi/spine-pixi";
import { Texture } from "pixi.js";

interface SpineOptions {
  atlas: string;
  skel: string;
  png: string;
  animation?: string;
  loop?: boolean;
}

export default class Spine extends GameObject {
  private pixiSpine: PixiSpine | undefined;
  private _animation: string | undefined;

  constructor(
    x: number,
    y: number,
    private options: SpineOptions,
    private onAnimEnd?: (animation: string) => void,
  ) {
    super(x, y);
    this.load();
  }

  private async load() {
    let texture: Texture | undefined;
    let atlasData: string;
    let skeletonBynary: Uint8Array;

    await Promise.all([
      (async () => texture = await TextureLoader.load(this.options.png))(),
      (async () =>
        atlasData = await (await fetch(this.options.atlas)).text())(),
      (async () =>
        skeletonBynary = new Uint8Array(
          await (await fetch(this.options.skel)).arrayBuffer(),
        ))(),
    ]);

    if (!texture || this.removed) return;

    const atlas = new TextureAtlas(atlasData!);
    atlas.pages.forEach((page) =>
      page.setTexture(SpineTexture.from(texture!.source))
    );

    const attachmentLoader = new AtlasAttachmentLoader(atlas);
    const binaryLoader = new SkeletonBinary(attachmentLoader);
    const skeletonData = binaryLoader.readSkeletonData(skeletonBynary!);

    this.pixiSpine = new PixiSpine(skeletonData);
    this.pixiSpine.pivot.y = -this.pixiSpine.getLocalBounds().height / 2;
    this.pixiSpine.state.addListener({
      complete: (entry) => this.onAnimEnd?.(entry.animation?.name ?? ""),
    });

    this.animation = this.options.animation;

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
      //this.pixiSpine.state.apply(this.pixiSpine.skeleton);
    }
  }

  public get animation(): string | undefined {
    return this._animation;
  }

  public remove(): void {
    TextureLoader.release(this.options.png);
    super.remove();
  }
}
