export type CacheType<TKind extends string | symbol, TValue> = {
  [key in TKind]?: TValue;
};
