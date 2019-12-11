import EJSON from 'mongodb-extjson';
import BSON from 'bson';

export const toStrictSimple = (json) => {
  let procJson = json;
  // Timestamps
  procJson = procJson.replace(/Timestamp\(\s*?(\d+)\s*?\n?,\s*?\n?(\d+)\s*?\)/g,
    (match, p1, p2) => EJSON.stringify(BSON.Timestamp(parseInt(p2, 10), parseInt(p1, 10))))

  // MinKey and MaxKey are erroneously already printed in strict json format
  // @see https://jira.mongodb.org/browse/SERVER-19171
  // .replace(/MinKey/g, '{ "$minKey": 1 }')
  // .replace(/MaxKey/g, '{ "$maxKey": 1 }')

  // DBRef
  // IgalR:
  //  DBRef was not implemented to receive 3 arguments
  //  It looks like that BSON.DBRef constructor ignores the first namespace argument
  //   therefore I did an ugly tweak of stringify then parsing, setting the $ref and stringify
    .replace(/DBRef\("(.+?)",\s*ObjectId\("([0-9abcdef]{24})"\)(\s*,\s*)?"?(.+?)?"?\s*\)/g, (match, p1, p2, p3, p4) => {
      const ref = EJSON.stringify(BSON.DBRef(p1.trim(), BSON.ObjectID(p2), p4 ? p4.trim() : null));
      const refObj = EJSON.parse(ref);
      // Setting $ref as a namespace provided as a first argument
      refObj.$ref = p1;
      return EJSON.stringify(refObj);
    })
    // ObjectId
    .replace(/ObjectId\("([0-9abcdef]{24})"\)/g, (match, p1) => EJSON.stringify(BSON.ObjectID(p1)))
    // NumberLong
    .replace(/NumberLong\("?([0-9]+)"?\)/g, (match, p1) => EJSON.stringify(BSON.Long(parseInt(p1, 10))))
    // NumberDecimal
    .replace(/NumberDecimal\("?([0-9.]+)"?\)/g, (match, p1) => EJSON.stringify(BSON.Decimal128.fromString(p1)))
    // NumberInteger
    .replace(/NumberInt\("?([0-9.]+)"?\)/g, (match, p1) => EJSON.stringify(BSON.Int32(parseInt(p1, 10))))

    // Date also prints the wrong format,
    // @see https://jira.mongodb.org/browse/SERVER-19171
    .replace(/ISODate\("(.+?)"\)/g, (match, p1) => {
      const msL = BSON.Long.fromNumber(new Date(p1).getTime());
      return '{"$date": ' + EJSON.stringify(msL) + '}';
    })
    .replace(/{\n?\s*\"?\$date\"?\s*:\s*?(\d+\.\d)\s*\n?}/g, '$1') // TODO FIX $date issues this is very ugly

    .replace(/{\n?\s*\"?\$date\"?\s*:\s*?(\d+)\s*\n?}/g, (match, p1) => EJSON.stringify(new Date(p1)))

    // undefined, shell is buggy here too,
    // @see https://jira.mongodb.org/browse/SERVER-6102
    .replace('undefined', '{ "$undefined": true }');

  return procJson;
};
