import { Query } from "./data/data.js";
import { NotificationType } from "./notification/notification.js";
import { promises as fs } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

export type Alert = {
  query: Query;
  notification: NotificationType;
};

export const loadAlerts = async (): Promise<Array<Alert>> => {
  const dirName = dirname(fileURLToPath(import.meta.url));
  const alertFile = await fs.readFile(path.join(dirName, "..", "alerts.json"));
  return JSON.parse(alertFile.toString());
};
