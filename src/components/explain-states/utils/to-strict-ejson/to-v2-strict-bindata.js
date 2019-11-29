import EJSON from 'mongodb-extjson';
import BSON from 'bson';

export const toV2StrictBinData = (json) => {
  let procJson = json;
  const regex = /{ \"\$binary\" : \"(.+?)\", \"\$type\" : \"(.+?)\" }/g;

  let match;
  while ((match = regex.exec(procJson)) !== null) {
    const subType = parseInt(match[2], 10);
    const binData = match[1];

    const convertedBin = EJSON.stringify(BSON.Binary.fromBase64(binData, subType));
    procJson = procJson.replace(match[0], convertedBin);
  }

  return procJson;
};
