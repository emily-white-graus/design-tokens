import tokens from './assets/design-tokens.tokens.json' with { type: 'json' };
import fs from 'node:fs';

const { primitives, "design-tokens": rawDesignTokens } = tokens;

function parseTokens (tokensObject) {
  const result = {};

  const traverseTokensTree = (node, path = []) => {
    for (const key in node) {
      if ('value' in node[key]) {
        const fullTokenKey = [...path, key].join('-');
        const value = node[key].value;

        result[fullTokenKey] = value;
      } else {
        traverseTokensTree(node[key], [...path, key]);
      }
    }
  }

  traverseTokensTree(tokensObject)

  return result;
}

const primitivesMap = parseTokens(primitives);

const designTokens = Object.entries(parseTokens(rawDesignTokens)).reduce((acc, [key, value]) => {
  return {
    ...acc,
    [key]: primitivesMap[value.replace('{primitives.', '').replace('}', '').replace('.', '-')]
  }
}, {});

const designTokensVariables = Object.entries(designTokens).reduce((acc, [key, value]) => {
  return `${acc}\n--${key}: ${value};`
}, '')

const template = `:root {${designTokensVariables}}`;

fs.writeFileSync('assets/design-tokens.css', template, { flag: 'a'} )
