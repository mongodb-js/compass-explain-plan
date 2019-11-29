/**
 * This module was contributed by Manuel Fontan (manuel.fontan@mongodb.com)
 * Thank you very much!
 */
import { toStrictBinData } from './to-strict-bindata';
import { toV2StrictBinData } from './to-v2-strict-bindata';
import { toStrictSimple } from './to-strict-simple';

const toStrictEJSON = (json) => {
  let procJSON = json;
  procJSON = toStrictBinData(procJSON);
  procJSON = toV2StrictBinData(procJSON);
  procJSON = toStrictSimple(procJSON);

  return procJSON;
};
export default toStrictEJSON;
