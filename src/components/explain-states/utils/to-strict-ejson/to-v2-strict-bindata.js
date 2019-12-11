import EJSON from 'mongodb-extjson';
import BSON from 'bson';

export const toV2StrictBinData = (json) => {
  let procJson = json;
  const regex = /{ \"\$binary\" : \"(.+?)\", \"\$type\" : \"(.+?)\" }/g;

  let match = regex.exec(procJson);
  while (match !== null) {
    const subType = parseInt(match[2], 10);
    const binData = match[1];

    const binDataBuf = Buffer.from(binData, 'base64');
    const convertedBin = EJSON.stringify(BSON.Binary(binDataBuf, subType));
    procJson = procJson.replace(match[0], convertedBin);

    match = regex.exec(procJson);
  }

  return procJson;
};
