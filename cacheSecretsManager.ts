import SecretsManager = require("aws-sdk/clients/secretsmanager");
export class SecretsCache {
  public readonly value: string;
  // public readonly ttl: number;
  // public readonly expiresAt: number;

  constructor(value: string) {
    this.value = value;
  }
}

//export type SecretsManagerCacheOptions = Partial<SecretsManagerCacheConfig>;

interface SecretsManagerCacheConfig {
  secretsManager: SecretsManager;
}

export class SecretsManagerCache {
  public config: SecretsManagerCacheConfig;
  private cache = new Map<string, SecretsCache>();

  constructor() {
    this.config = {
      secretsManager: new SecretsManager(),
    };
  }

  /**
   * Fetches a secret from SecretsManager and caches it *
   */
  async getSecret(
    secretName: string,
    isJSON = false
  ): Promise<string | undefined> {
    const itemExistsInCache = this.cache.has(secretName);
    console.log("itemExistsInCache", itemExistsInCache);
    if (!itemExistsInCache) {
      console.log("calling SecretsManager, no cache");
      const getSecretResponse = await this.config.secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise();

      if (getSecretResponse.SecretString) {
        this.cache.set(
          secretName,
          new SecretsCache(getSecretResponse.SecretString)
        );
      }
    }

    const secret = this.cache.get(secretName)?.value;

    if (isJSON) {
      try {
        return JSON.parse(secret as any);
      } catch (error) {
        throw new Error("Attempted to parse non-JSON secret string as JSON.");
      }
    }

    return secret;
  }
}
