import EJSON from 'mongodb-extjson';
import BSON from 'bson';


export const toStrictBinData = (json) => {
  let procJson = json;
  const regex = /BinData\(\n?\s*?(\d+)\s*?\n?,\n?\s*?\"(.+)\"\s*?\n?\)/g;
  let match;

  while ((match = regex.exec(procJson)) !== null) {
    const subType = parseInt(match[1], 10);
    const binData = match[2];

    const convertedBin = EJSON.stringify(BSON.Binary.fromBase64(binData, subType));
    procJson = procJson.replace(match[0], convertedBin);
  }
  return procJson;
};
