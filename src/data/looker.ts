import { LookerNodeSDK } from "@looker/sdk-node";
import { Data } from "./data";

export type LookerAlertQueryProps = {
  readonly model?: string;
  readonly view?: string;
  readonly fields?: Array<string>;
  readonly filters?: Record<string, string>;
  readonly look_id?: string;
};

export class LookerDataProvider {
  public kind = "looker" as const;
  private readonly sdk: ReturnType<typeof LookerNodeSDK.init40>;

  constructor() {
    this.sdk = LookerNodeSDK.init40();
  }

  public async getData(props: LookerAlertQueryProps): Promise<Array<Data>> {
    if (props.look_id) {
      return this.runLook(props)
    } else {
      return this.runInlineQuery(props);
    }
  }

  private async runInlineQuery({
    model,
    view,
    fields,
    filters,
  }: LookerAlertQueryProps): Promise<Array<Data>> {
    const requestParams: Parameters<typeof this.sdk.run_inline_query>[0] = {
      result_format: "json",
      body: {
        model: model!,
        view: view!,
        fields: fields,
        filters: filters,
      },
      cache: true, // use looker cache by default
      limit: 10,
    };

    const results: unknown = await this.sdk.ok(
      this.sdk.run_inline_query(requestParams)
    );

    return Promise.resolve(results as Array<Data>);
  }

  private async runLook({ look_id }: LookerAlertQueryProps) {
    const lookRequestParams = {
      look_id: look_id!,
      result_format: "json",
      cache: true, // use looker cache by default
      limit: 10,
    };
    const lookResults: unknown = await this.sdk.ok(
      this.sdk.run_look(lookRequestParams)
    );
    return Promise.resolve(lookResults as Array<Data>);
  }
}
