import { ResourceLoader, TextureLoader } from "@gaiaengine/2d";
import BinaryLoader from "./BinaryLoader";
import TextLoader from "./TextLoader";
class SpineLoader extends ResourceLoader {
    async load(options) {
        const key = this.getKey(options);
        return super.load(key, options);
    }
    async loadFromPath(key, options) {
        const loadPromise = (async () => {
            const promises = [];
            let atlasData;
            let skeletonData;
            let textures;
            promises.push((async () => {
                atlasData = await TextLoader.load(options.atlasPath);
            })());
            if (options.isBinary) {
                promises.push((async () => {
                    skeletonData = await BinaryLoader.load(options.skeletonPath);
                })());
            }
            else {
                promises.push((async () => {
                    skeletonData = await TextLoader.load(options.skeletonPath);
                })());
            }
            if (typeof options.texturePaths === "string") {
                promises.push((async () => {
                    textures = await TextureLoader.load(options.texturePaths);
                })());
            }
            else {
                textures = {};
                const entries = Object.entries(options.texturePaths);
                const texturePromises = entries.map(async ([key, path]) => {
                    const texture = await TextureLoader.load(path);
                    if (texture)
                        textures[key] = texture;
                });
                promises.push(...texturePromises);
            }
            await Promise.all(promises);
            this.pendingLoads.delete(key);
            if ((!atlasData || !skeletonData || !textures) || !this.isResourceInUse(key)) {
                TextLoader.release(options.atlasPath);
                if (options.isBinary) {
                    BinaryLoader.release(options.skeletonPath);
                }
                else {
                    TextLoader.release(options.skeletonPath);
                }
                if (typeof options.texturePaths === "string") {
                    TextureLoader.release(options.texturePaths);
                }
                else {
                    for (const path of Object.values(options.texturePaths)) {
                        TextureLoader.release(path);
                    }
                }
                return undefined;
            }
            const spineData = {
                atlasData: atlasData,
                skeletonData: skeletonData,
                textures: textures,
            };
            if (this.resources.has(key)) {
                throw new Error(`Spine data already exists: ${key}`);
            }
            else {
                this.resources.set(key, spineData);
                return spineData;
            }
        })();
        this.pendingLoads.set(key, loadPromise);
        return await loadPromise;
    }
    cleanup(data, key) {
        TextLoader.release(data.atlasData);
        if (typeof data.skeletonData === "string") {
            TextLoader.release(data.skeletonData);
        }
        else {
            BinaryLoader.release(data.skeletonData);
        }
        if (typeof data.textures === "string") {
            TextureLoader.release(data.textures);
        }
        else {
            for (const texture of Object.values(data.textures)) {
                TextureLoader.release(texture.baseTexture.resource.url);
            }
        }
    }
    getKey(options) {
        const texturePaths = typeof options.texturePaths === "string"
            ? options.texturePaths
            : Object.entries(options.texturePaths)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, path]) => `${key}:${path}`)
                .join("|");
        const key = `atlas:${options.atlasPath}|skeleton:${options.skeletonPath}|binary:${options.isBinary}|textures:${texturePaths}`;
        return key;
    }
}
export default new SpineLoader();
//# sourceMappingURL=SpineLoader.js.map