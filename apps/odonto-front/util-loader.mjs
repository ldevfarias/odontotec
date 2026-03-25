// ESM loader hook to polyfill styleText in node:util for Node < 20.12
export async function load(url, context, nextLoad) {
  if (url === 'node:util' || url.endsWith('/node_modules/util/util.js')) {
    const result = await nextLoad(url, context);
    let source = result.source;
    if (typeof source === 'string' && !source.includes('styleText')) {
      // Add styleText polyfill
      source += '\nexport function styleText(_format, text) { return text; }\n';
    }
    return { ...result, source };
  }
  return nextLoad(url, context);
}
