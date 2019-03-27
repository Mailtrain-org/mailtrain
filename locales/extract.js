'use strict';

// Processes statements like these:
// tUI(/*prefix:account*/'account.passwordChangeRequest', language)
// /*prefix:helpers*/<Trans i18nKey="userMessagesUnread" count={count}>Hello <strong title={t('nameTitle')}>{{name}}</strong>, you have {{count}} unread message. <Link to="/msgs">Go to messages</Link>.</Trans>

const fs = require('fs');
const path = require('path');
const klawSync = require('klaw-sync');
const acorn = require("acorn");
const acornJsx = require("acorn-jsx");
const ellipsize = require('ellipsize');
const camelCase = require('camelcase');
const slugify = require('slugify');
const readline = require('readline');

const localeFile = 'en-US/common.json';
const searchDirs = [
    '../client/src',
    '../server',
    '../shared'
];

function findAllVariantsByPrefixInDict(dict, keyPrefix) {
    const keyElems = keyPrefix.split('.');

    for (const keyElem of keyElems.slice(0, -1)) {
        if (dict[keyElem]) {
            if (typeof dict[keyElem] === 'string') {
                return [];
            } else {
                dict = dict[keyElem];
            }
        } else {
            return [];
        }
    }

    const prefix = keyElems[keyElems.length - 1];
    const res = [];
    for (const key in dict) {
        if (key.startsWith(prefix)) {
            res.push(key.substring(prefix.length));
        }
    }

    return res;
}

function findInDict(dict, key) {
    const keyElems = key.split('.');

    for (const keyElem of keyElems.slice(0, -1)) {
        if (dict[keyElem]) {
            if (typeof dict[keyElem] === 'string') {
                return undefined;
            } else {
                dict = dict[keyElem];
            }
        } else {
            return undefined;
        }
    }

    return dict[keyElems[keyElems.length - 1]];
}

function setInDict(dict, key, value) {
    const keyElems = key.split('.');

    for (const keyElem of keyElems.slice(0, -1)) {
        if (dict[keyElem]) {
            if (typeof dict[keyElem] === 'string') {
                throw new Error(`Overlapping key ${key}`);
            }
        } else {
            dict[keyElem] = {}
        }

        dict = dict[keyElem];
    }

    dict[keyElems[keyElems.length - 1]] = value;
}

const assignedKeys = new Map();
function getKeyFromValue(spec, value) {
    let key = value.replace(/<\/?[0-9]+>/g, ''); // Remove Trans markup
    key = slugify(key, { replacement: ' ', remove: /[\\()"':.,;\/\[\]\{\}*+-]/g, lower: false });
    key = camelCase(key);
    key = ellipsize(key, 40, {
        chars: [...Array(26)].map((_, i) => String.fromCharCode('A'.charCodeAt(0) + i)) /* This is an array of characters A-Z */,
        ellipse: ''
    });

    if (spec.prefix) {
        key = spec.prefix + '.' + key;
    }

    let idx = 0;
    while (true) {
        const keyExt = key + (idx ? '-' + idx : '')
        if (assignedKeys.has(keyExt)) {
            if (assignedKeys.get(keyExt) === value) {
                return keyExt;
            }
        } else {
            assignedKeys.set(keyExt, value);
            return keyExt;
        }

        idx++;
    }
}

function allowedDirOrFile(item) {
    const pp = path.parse(item.path)

    return (
        (item.stats.isDirectory() &&
            pp.base !== 'node_modules'
        ) ||
        (item.stats.isFile() &&
            ( pp.ext === '.js' || pp.ext === '.jsx' || pp.ext === '.hbs')
        )
    );
}

function parseSpec(specStr) {
    const spec = {};

    if (specStr) {
        const entryMatcher = /([a-zA-Z]*)\s*:\s*(.*)/

        const entries = specStr.split(/\s*,\s*/);
        for (const entry of entries) {
            const elems = entry.match(entryMatcher);
            if (elems) {
                spec[elems[1]] = elems[2];
            } else {
                spec[entry] = true;
            }
        }
    }

    return spec;
}

// see http://blog.stevenlevithan.com/archives/match-quoted-string
const tMatcher = /(^|[ {+(=.\[])((?:tUI|tLog|t|tMark)\s*\(\s*(?:\/\*(.*?)\*\/)?\s*)(["'])((?:(?!\4)[^\\]|\\.)*)(\4)/;
const jsxTransMatcher = /(\/\*(.*?)\*\/\s*)?(\<Trans[ >][\s\S]*?\<\/Trans\>)/;
const hbsTranslateMatcher = /(\{\{!--(.*?)--\}\}\s*)?(\{\{#translate\}\})([\s\S]*?)(\{\{\/translate\}\})/;

const jsxParser = acorn.Parser.extend(acornJsx());
function parseJsxTrans(fragment) {
    const match = fragment.match(jsxTransMatcher);
    const spec = parseSpec(match[2]);
    const jsxStr = match[3];

    const jsxStrSmpl = jsxStr.replace('{::', '{  '); // Acorn does not handle bind (::) operator. So we just leave it out because we are not interested in the code anyway.
    const ast = jsxParser.parse(jsxStrSmpl);

    function convertChildren(children) {
        const entries = [];
        let childNo = 0;

        for (const child of children) {
            const type = child.type;

            if (type === 'JSXText') {
                entries.push(child.value);
                childNo++;

            } else if (type === 'JSXElement') {
                const inner = convertChildren(child.children);
                entries.push(`<${childNo}>${convertChildren(child.children)}</${childNo}>`);
                childNo++;

            } else if (type === 'JSXExpressionContainer') {
                entries.push(jsxStr.substring(child.start, child.end));
                childNo++;

            } else {
                throw new Error('Unknown JSX node: ' + child);
            }
        }

        return entries.join('');
    }

    const expr = ast.body[0].expression;

    let originalKey;
    for (const attr of expr.openingElement.attributes) {
        const name = attr.name.name;
        if (name === 'i18nKey') {
            originalKey = attr.value.value;
        }
    }

    const convValue = convertChildren(expr.children);

    if (originalKey === undefined) {
        originalKey = convValue;
    }

    let value;
    const originalValue = findInDict(originalResDict, originalKey);

    if (originalValue === undefined) {
        value = convValue;
    } else {
        value = originalValue;
    }

    const key = getKeyFromValue(spec, value);

    const replacement = `${match[1] || ''}<Trans i18nKey="${key}">${jsxStr.substring(expr.openingElement.end, expr.closingElement.start)}</Trans>`;

    return { key, originalKey, value, replacement };
}


function parseHbsTranslate(fragment) {
    const match = fragment.match(hbsTranslateMatcher);
    const spec = parseSpec(match[2]);
    const originalKey = match[4];

    let value;
    const originalValue = findInDict(originalResDict, originalKey);

    if (originalValue === undefined) {
        value = originalKey;
    } else {
        value = originalValue;
    }

    const key = getKeyFromValue(spec, value);

    const replacement = `${match[1] || ''}${match[3]}${key}${match[5]}`;

    return { key, originalKey, value, replacement };
}

function parseT(fragment) {
    const match = fragment.match(tMatcher);

    const originalKey = match[5];
    const spec = parseSpec(match[3]);

    if (spec.ignore) {
        return null;
    }

    // console.log(`${fragment}`);
    // console.log(`    |${match[1]}|${match[2]}|${match[4]}|${match[5]}|${match[6]}|  -  ${JSON.stringify(spec)}`);

    let value;
    const originalValue = findInDict(originalResDict, originalKey);

    if (originalValue === undefined) {
        value = originalKey;
    } else {
        value = originalValue;
    }

    const key = getKeyFromValue(spec, value);

    const replacement = `${match[1]}${match[2]}${match[4]}${key}${match[6]}`;

    return { key, originalKey, value, originalValue, replacement };
}

const renamedKeys = new Map();
const resDict = {};
let anyUpdatesToResDict = false;

function processFile(file) {
    let source = fs.readFileSync(file, 'utf8');
    let anyUpdates = false;

    function update(fragments, parseFun) {
        if (fragments) {
            for (const fragment of fragments) {
                const parseStruct = parseFun(fragment);
                if (parseStruct) {
                    const {key, originalKey, value, originalValue, replacement} = parseStruct;
                    // console.log(`${key} <- ${originalKey} | ${value} <- ${originalValue} | ${fragment} -> ${replacement}`);

                    source = source.split(fragment).join(replacement);
                    setInDict(resDict, key, value);

                    const variants = originalKey ? findAllVariantsByPrefixInDict(originalResDict, originalKey + '_') : [];
                    for (const variant of variants) {
                        setInDict(resDict, key + '_' + variant, findInDict(originalResDict, originalKey + '_' + variant));
                    }

                    if (originalKey !== key) {
                        renamedKeys.set(originalKey, key);

                        for (const variant of variants) {
                            renamedKeys.set(originalKey + '_' + variant, key + '_' + variant);
                        }
                    }

                    if (originalKey !== key || originalValue !== value) {
                        anyUpdates = true;
                    }
                }
            }
        }
    }

    const lines = source.split(/\r?\n/g);
    for (const line of lines) {
        const fragments = line.match(new RegExp(tMatcher, 'g'));
        update(fragments, parseT);
    }

    const hbsFragments = source.match(new RegExp(hbsTranslateMatcher, 'g'));
    update(hbsFragments, parseHbsTranslate);

    const jsxFragments = source.match(new RegExp(jsxTransMatcher, 'g'));
    update(jsxFragments, parseJsxTrans);

    if (anyUpdates) {
        console.log(`Updating ${file}`);
        fs.writeFileSync(file, source);

        anyUpdatesToResDict = true;
    }
}

const originalResDict = JSON.parse(fs.readFileSync(localeFile));

function run() {
    for (const dir of searchDirs) {
        const files = klawSync(dir, { nodir: true, filter: allowedDirOrFile })

        for (const file of files) {
            processFile(file.path);
        }
    }

    if (anyUpdatesToResDict) {
        console.log(`Updating ${localeFile}`);
        fs.writeFileSync(localeFile, JSON.stringify(resDict, null, 2));
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('This script does modifications in the source tree. You should first commit all your files in git before proceeding.');
rl.question('To proceed type YES: ', (answer) => {
    if (answer === 'YES') {
        run();
    }

    rl.close();
});
