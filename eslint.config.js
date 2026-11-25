const browserGlobals=Object.fromEntries(['document','window','matchMedia','navigator','ResizeObserver','CustomEvent','performance','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','Element','URL','console'].map(name=>[name,'readonly']));
const nodeGlobals=Object.fromEntries(['process','console','URL','Buffer','setTimeout','clearTimeout','fetch','performance','global','__dirname'].map(name=>[name,'readonly']));
export default [
 {ignores:['node_modules/**','public/**/*.css']},
 {files:['**/*.js','**/*.mjs'],languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:nodeGlobals},rules:{'no-dupe-keys':'error','no-unreachable':'error','no-constant-condition':['error',{checkLoops:false}]}},
 {files:['public/**/*.js'],languageOptions:{globals:browserGlobals},rules:{'no-undef':'error'}},
];
