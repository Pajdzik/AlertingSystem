import { LookerAlertQueryProps } from "./looker";

export type Data = Record<string, unknown>;

export type Query =
  | {
      source: "looker";
      props: LookerAlertQueryProps;
    }
  | {
      source: "json";
      props: {
        filepath: string;
      };
    };

export type QuerySource = Query["source"];

export type DataProvider = {
  kind: QuerySource;
  getData: (props: Partial<Query["props"]>) => Promise<Array<Data>>;
};

export class DataService {
  private readonly dataProvidersCache: Record<QuerySource, DataProvider>;

  constructor(dataProviders: Array<DataProvider>) {
    this.dataProvidersCache = this.initializeCache(dataProviders);
  }

  public async getData(query: Query): Promise<Array<Data>> {
    const dataProvider = this.dataProvidersCache[query.source];
    if (!dataProvider) {
      return Promise.resolve([]);
    }

    const data = await dataProvider.getData(query.props);
    return data;
  }

  private initializeCache(
    dataProviders: Array<DataProvider>
  ): Record<QuerySource, DataProvider> {
    const cache = {} as Record<QuerySource, DataProvider>;

    for (const dataProvider of dataProviders) {
      cache[dataProvider.kind] = dataProvider;
    }

    return cache;
  }
}
