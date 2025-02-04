import { BittensorSpecNameType } from '@bitgo/statics';
import { TypeRegistry } from '@substrate/txwrapper-core/lib/types';
import { getRegistry } from '@substrate/txwrapper-registry';
import { Material } from './iface';

export class SingletonRegistry {
  private static instance: TypeRegistry;
  private static material: Material;

  static getInstance(material): TypeRegistry {
    if (material !== SingletonRegistry.material) {
      SingletonRegistry.material = material;
      SingletonRegistry.instance = getRegistry({
        chainName: material.chainName,
        specName: material.specName as BittensorSpecNameType,
        specVersion: material.specVersion,
        metadataRpc: material.metadata as `0x${string}`,
      });
    }
    return SingletonRegistry.instance;
  }
}
