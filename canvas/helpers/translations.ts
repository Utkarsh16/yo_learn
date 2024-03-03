import { type TFuncKey, type TFunction, getFixedT } from '@rippling/lib-i18n';

type Namespace = 'hubPlatform';
type KeyPrefix = 'canvas';
type CanvasTFunction = TFunction<Namespace, KeyPrefix>;
type CanvasTFuncKey = TFuncKey<Namespace, KeyPrefix>;

export function translateCanvasString(key: CanvasTFuncKey, options?: object) {
  const t = getFixedT(undefined, 'hubPlatform', 'canvas') as CanvasTFunction;
  return t(key, options);
}
