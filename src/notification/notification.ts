import { Alert } from "../alert.js";
import { Data, QuerySource } from "../data/data.js";
import { CacheType } from "../types.js";
import { NotificationCache } from "./cache.js";
import { EmailProps } from "./email.js";

export type NotificationType =
  | {
      channel: "email";
      props: EmailProps;
    }
  | {
      channel: "console";
      props: {};
    };

type NotificationChannel = NotificationType["channel"];
type NotificationProps = NotificationType["props"];

export type NotificationProvider = {
  kind: NotificationChannel;
  notify: (data: Data, props: Partial<NotificationProps>) => Promise<void>;
};

type NotificationServiceCache = CacheType<
  NotificationChannel,
  NotificationProvider
>;

export class NotificationService {
  private readonly dataCache: NotificationCache;
  private readonly serviceCache: NotificationServiceCache;

  constructor(
    notificationProviders: Array<NotificationProvider>,
    retryNotificationAfterInDays: number = 7
  ) {
    this.dataCache = new NotificationCache(retryNotificationAfterInDays);
    this.serviceCache = this.inititializeCache(notificationProviders);
  }

  public async notify(alert: Alert, data: Array<Data>) {
    const dataToNotify = this.dataCache.filterDataToModify(
      alert.query.source,
      data
    );

    const notificationService = this.serviceCache[alert.notification.channel];
    if (!notificationService) {
      return Promise.resolve();
    }

    const promises = dataToNotify.map((d) =>
      notificationService?.notify(d, alert.notification.props)
    );
    await Promise.all(promises);
  }

  private inititializeCache(
    notificationProviders: Array<NotificationProvider>
  ) {
    const cache = {} as NotificationServiceCache;

    for (const provider of notificationProviders) {
      cache[provider.kind] = provider;
    }

    return cache;
  }
}
