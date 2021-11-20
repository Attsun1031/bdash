import CodeMirror from "codemirror";

function hookIdentifier(stream) {
  let ch: string;
  while ((ch = stream.next()) != null) {
    if (ch === "`" || ch === ".") {
      return "variable-2";
    }
  }
  return "variable-2";
}

// turn a space-separated list into an array
function set(str) {
  var obj = {},
    words = str.split(" ");
  for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
  return obj;
}

export function defineBigQueryMode() {
  const genericSqlMime = CodeMirror.mimeModes["text/x-sql"];
  CodeMirror.defineMIME("text/x-bigquery", {
    name: "sql",
    keywords: genericSqlMime.keywords,
    builtin: genericSqlMime.builtin,
    atoms: genericSqlMime.atoms,
    dateSQL: genericSqlMime.dateSQL,
    support: set("doubleQuote binaryNumber hexNumber"),
    hooks: {
      "`": hookIdentifier
    }
  });
}
