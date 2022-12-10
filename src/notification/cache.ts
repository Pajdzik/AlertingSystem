import hash from "object-hash";
import { Data, QuerySource } from "../data/data.js";

type LastNotifiedCache = Record<string, Date>;

export class NotificationCache {
  private readonly perSourceCache: { [key in QuerySource]?: LastNotifiedCache };
  private readonly retryNotificationAfterInDays;

  constructor(retryNotificationAfterInDays: number) {
    this.perSourceCache = {};
    this.retryNotificationAfterInDays = retryNotificationAfterInDays;
  }

  public filterDataToModify(
    querySource: QuerySource,
    result: Array<Data>
  ): Array<Data> {
    const sourceCache = this.getOrCreateSourceCache(querySource);
    const filteredData = result.filter((data) =>
      this.shouldNotify(sourceCache, data)
    );
    return filteredData;
  }

  private shouldNotify(cache: LastNotifiedCache, data: Data): boolean {
    const key = hash(data);
    const lastAccess = cache[key];
    const now = new Date();

    if (!lastAccess) {
      cache[key] = now;
      return true;
    } else {
      const threshold = now.setDate(
        now.getDate() - this.retryNotificationAfterInDays
      );

      if (lastAccess.getDate() < threshold) {
        return false;
      } else {
        cache[key] = now;
        return true;
      }
    }
  }

  private getOrCreateSourceCache(key: QuerySource): LastNotifiedCache {
    if (!this.perSourceCache[key]) {
      this.perSourceCache[key] = {};
    }

    return this.perSourceCache[key]!;
  }
}
