const SON =  { parse, stringify};
export default SON;

// parse('    {  hello  ": "world", "otro": 8   8, number: 42, nested: { a: 1, b: 2 }, arr: [1,2,3] }   ');

export function parse(sonString) {
  let data = getValue({ code: sonString });
  console.log(data);
  console.log(data.value);
  return data.value;
}

export function stringify(object) {
  return JSON.stringify(object, null, 2);
}

function getValue(data, { delims } = { delims: [] }) {
  const deep = data.deep ||= 0;
  if (deep > 10) {
    throw new Error('Too deep.');
  }

  data.rest ||= data.code.trim();
  console.log(`${'>'.repeat(deep)} ${deep} - ${data.rest}`);
  
  let value,
    newValue,
    isList = false;

  data = getNextToken(data, { delims: ['{', '[', ...delims ] });
  console.log(`Delim: ${data.delim}`);

  let cicle = 0;
  do {
    if (data.delim === '{') {
      delims.push('}');
    }

    cicle++;
    console.log(`${'>'.repeat(deep)} ${deep}.${cicle} - ${data.rest}`);
    data = getSingleValue(data, { delims: [ ':', '.', ',', ';', ...delims ] });
    console.log(`Value: ${data.value}`);
    if (data.value === null || data.value === undefined)
      throw new Error('Unexpected null value');

    newValue = data.value;

    if (delims.includes(data.delim))
      break;

    data = getNextToken(data, { delims: [':', '.', ',', ';', ...delims ] });
    console.log(`Delim: ${data.delim}`);
    if (delims.includes(data.delim))
      break;

    if (data.delim === ':') {
      newValue = [newValue];
      if (!isList) {
        isList = true;
        value = [newValue];
      } else {
        value.push(newValue);
      }

      data = getValue({ ...data, delim: null, deep: deep + 1 }, { delims: [',', '{', '[', ...delims ] });
      console.log(`Value: ${data.value}`);
      newValue.push(data.value);

      data = getNextToken(data, { delims: [':', ',', '{', '[', ...delims ] });
      console.log(`Delim: ${data.delim} - ${delims}`);
      if (data.delim !== ',')
        continue;
    }
  } while (!delims.includes(data.delim));

  data.value = value ?? newValue;

  console.log(`${'<'.repeat(deep)} ${deep} - ${data.rest}`);

  return data;
}

function escapeForRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function getNextToken(data, { delims } = { delims: [] }) {
  const regex = new RegExp(`^\\s*(${delims.map(escapeForRegExp).join('|')})`, 'd');
  const match = regex.exec(data.rest);
  if (!match)
    return data;

  data.delim = match[1];
  data.previousRest = data.rest;
  data.rest = data.rest.substring(match.indices[1][1]);
  data.value = data.previousRest.substring(0, match.indices[1][0]);

  return data;
}

function getUntilToken(data, { delims, trim, includeNextDelim } = { delims: [] }) {
  const regex = new RegExp(`(${delims.map(escapeForRegExp).join('|')})`, 'd');
  const match = regex.exec(data.rest);
  if (!match)
    return data;
  
  data.delim = match[1];
  data.previousRest = data.rest;
  data.rest = data.rest.substring((includeNextDelim !== false) ? match.indices[1][1] : match.indices[1][0]);
  data.value = data.previousRest.substring(0, match.indices[1][0]);

  if (trim !== false)
    data.value = data.value.trim();

  return data;
}

function getSingleValue(data, { delims } = { delims: [] }) {
  data.value = null;
  data.delim = null;
  data = getNextToken(data, { delims: ['"', "'", '`', ...delims ] });
  if (delims.includes(data.delim)) {
    return data;
  }

  const opener = data.delim;
  if (opener === '"' || opener === "'" || opener === '`') {
    data = getUntilToken(data, { delims: [opener], trim: false });
    if (data.delim !== opener) {
      throw new Error('Unclosed string');
    }

    return data;
  }

  return getUntilToken(data, { delims: [':', ',', ';', ...delims ], includeNextDelim: false });
}