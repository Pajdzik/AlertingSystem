import { LookerDataProvider } from "./data/looker.js";
import { Alert, loadAlerts } from "./alert.js";
import { DataProvider, DataService } from "./data/data.js";
import {
  NotificationProvider,
  NotificationService,
} from "./notification/notification.js";
import { EmailNotificationService } from "./notification/email.js";
import { setInterval } from "timers/promises";

const alerts: Array<Alert> = await loadAlerts();

const dataService = new DataService([
  new LookerDataProvider(),
] as Array<DataProvider>);
const notificationService = new NotificationService([
  new EmailNotificationService(),
] as Array<NotificationProvider>);

const fetchDataAndRaiseAlerts = async () => {
  for (const alert of alerts) {
    const data = await dataService.getData(alert.query);
    await notificationService.notify(alert, data);
  }
};

let cleanupPointer = 1;

for await (const _ of setInterval(10000)) {
  console.log(`${new Date().toLocaleTimeString()}: Executing`);
  await fetchDataAndRaiseAlerts();

  if (cleanupPointer % 100 === 0) {
    console.log("Cleaning stale cache");
    notificationService.clearStaleDataCache();
  }
  cleanupPointer += 1;
}
