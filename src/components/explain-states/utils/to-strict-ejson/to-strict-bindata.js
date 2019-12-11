import EJSON from 'mongodb-extjson';
import BSON from 'bson';


export const toStrictBinData = (json) => {
  let procJson = json;
  const regex = /BinData\(\n?\s*?(\d+)\s*?\n?,\n?\s*?\"(.+)\"\s*?\n?\)/g;
  let match = regex.exec(procJson);

  while (match !== null) {
    const subType = parseInt(match[1], 10);
    const binData = match[2];

    const binDataBuf = Buffer.from(binData, 'base64');
    const convertedBin = EJSON.stringify(BSON.Binary(binDataBuf, subType));
    procJson = procJson.replace(match[0], convertedBin);

    match = regex.exec(procJson);
  }

  return procJson;
};
