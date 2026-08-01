#!/usr/bin/env node
// Meri strukturalni limity (ETH-270) pres 'eslint' JSON vystup + primy pocet radku.
//
// Pouziti:
//   node scripts/quality/baseline.js            // vypise .quality-baseline.json na stdout
//   node scripts/quality/baseline.js --check    // porovna proti .quality-baseline.json,
//                                                // exit 1 jen pri zhorseni (CI job)
//
// Rozsah: jen 'scripts/**/*.js' — to je jediny "kod" v tomhle repu (stejny rozsah
// jako 'npm run lint'). index.html, docs/*.md, faq/*.md a dalsi obsah jsou
// marketingova/dokumentacni stranka, ne kod - limity na delku souboru na ne
// nedava smysl aplikovat (dlouha landing page neni technicky dluh).
//
// Function-level metriky (radky, parametry, vnoreni, slozitost) bere z jadrovych
// ESLint pravidel (max-lines-per-function, max-params, max-depth, complexity)
// s docasne vynucenym prahem 1, aby nahlasily skutecne cislo za KAZDOU funkci.
// Verejne metody na tridu se nemeri — zadna trida v kodu neexistuje a ESLint
// nema jadrove pravidlo pro tuhle metriku.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const BASELINE_PATH = path.join(REPO_ROOT, '.quality-baseline.json');
const TEMP_CONFIG = path.join(REPO_ROOT, '.eslint.baseline-temp.mjs');

const LIMITS = {
  file_lines: { soft: 400, hard: 600 },
  func_lines: { soft: 50, hard: 80 },
  params: { soft: 5, hard: 8 },
  nesting: { soft: 3, hard: 4 },
  complexity: { soft: 10, hard: 15 },
};
const SKIPPED_METRICS = {
  public_methods:
    'projekt je vanilla JS bez trid (zadny `class` v kodu); ESLint navic nema ' +
    'jadrove pravidlo pro pocet verejnych metod na tridu.',
};

const METRIC_BY_RULE = {
  'max-lines-per-function': 'func_lines',
  'max-params': 'params',
  'max-depth': 'nesting',
  complexity: 'complexity',
};

function trackedScriptFiles() {
  const out = execFileSync('git', ['ls-files', 'scripts'], { cwd: REPO_ROOT, encoding: 'utf-8' });
  return out
    .split('\n')
    .map((f) => f.trim())
    .filter((f) => f.endsWith('.js') && existsSync(path.join(REPO_ROOT, f)));
}

function fileLineViolations(jsFiles) {
  const files = [];
  const allLines = {};
  for (const rel of jsFiles) {
    const text = readFileSync(path.join(REPO_ROOT, rel), 'utf-8');
    const nLines = text.split('\n').length;
    allLines[rel] = nLines;
    const { soft, hard } = LIMITS.file_lines;
    if (nLines > soft) {
      files.push({
        path: rel,
        metric: 'file_lines',
        value: nLines,
        level: nLines > hard ? 'hard' : 'soft',
        soft,
        hard,
      });
    }
  }
  return { files, allLines };
}

function withTempEslintConfig(fn) {
  const config = `
import js from '@eslint/js';
import globals from 'globals';
export default [
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node } },
    rules: {
      'max-lines-per-function': ['warn', { max: 1, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', 1],
      'max-depth': ['warn', 1],
      complexity: ['warn', 1],
    },
  },
];
`;
  writeFileSync(TEMP_CONFIG, config, 'utf-8');
  try {
    return fn();
  } finally {
    unlinkSync(TEMP_CONFIG);
  }
}

function collectEslintMetrics(jsFiles) {
  return withTempEslintConfig(() => {
    let stdout;
    let status = 0;
    try {
      stdout = execFileSync(
        'npx',
        ['eslint', '--config', TEMP_CONFIG, '--format', 'json', ...jsFiles],
        { cwd: REPO_ROOT, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024, shell: true }
      );
    } catch (err) {
      // eslint vraci nenulovy exit kod, kdyz najde cokoli — to je ocekavane (chceme
      // KAZDOU funkci). stdout ma vysledky i tak. Skutecnou chybu (parse error,
      // chybejici config) pozname podle chybejiciho/nevalidniho JSON nize.
      stdout = err.stdout ? err.stdout.toString() : '';
      status = err.status ?? 1;
    }
    if (!stdout || !stdout.trim()) {
      console.error(
        `ERROR: eslint nevratil zadny vystup (exit ${status}) — mereni JS ` +
          'function-level metrik je nedostupne.'
      );
      process.exit(3);
    }
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch (err) {
      console.error('ERROR: eslint JSON vystup se nepodarilo naparsovat:', err.message);
      console.error(stdout.slice(0, 4000));
      process.exit(3);
    }
    return parsed;
  });
}

function parseMetricValue(msg) {
  const metric = METRIC_BY_RULE[msg.ruleId];
  if (!metric) return null;
  const m = msg.message.match(/\((\d+)\)/) || msg.message.match(/of (\d+)\./);
  const value = m ? parseInt(m[1], 10) : null;
  return value === null ? null : { metric, value };
}

function functionViolations(eslintResults) {
  const functions = [];
  const maxComplexityPerFile = {};
  for (const fileResult of eslintResults) {
    const rel = path.relative(REPO_ROOT, fileResult.filePath).replace(/\\/g, '/');
    for (const msg of fileResult.messages) {
      const parsed = parseMetricValue(msg);
      if (!parsed) continue;
      const { metric, value } = parsed;
      if (metric === 'complexity') {
        maxComplexityPerFile[rel] = Math.max(maxComplexityPerFile[rel] || 0, value);
      }
      const limits = LIMITS[metric];
      if (value > limits.soft) {
        functions.push({
          path: rel,
          name: null,
          line: msg.line,
          metric,
          value,
          level: value > limits.hard ? 'hard' : 'soft',
          soft: limits.soft,
          hard: limits.hard,
        });
      }
    }
  }
  return { functions, maxComplexityPerFile };
}

function buildLeaderboard(debtPaths, allLines, maxComplexityPerFile) {
  const hardComplexity = LIMITS.complexity.hard;
  const leaderboard = [...debtPaths].map((p) => {
    const lines = allLines[p] || 0;
    const maxComplexity = maxComplexityPerFile[p];
    if (maxComplexity === undefined) {
      return {
        path: p,
        lines,
        max_complexity: null,
        score: round3(lines / 600),
        note: 'slozitost nezmerena (zadna funkce v souboru nezachycena eslint) - skore jen z radku',
      };
    }
    return {
      path: p,
      lines,
      max_complexity: maxComplexity,
      score: round3((lines / 600) * (maxComplexity / hardComplexity)),
    };
  });
  leaderboard.sort((a, b) => b.score - a.score);
  return leaderboard.slice(0, 10);
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function buildReport() {
  const jsFiles = trackedScriptFiles();
  const { files, allLines } = fileLineViolations(jsFiles);
  const eslintResults = jsFiles.length ? collectEslintMetrics(jsFiles) : [];
  const { functions, maxComplexityPerFile } = functionViolations(eslintResults);

  const debtPaths = new Set([...files.map((f) => f.path), ...functions.map((f) => f.path)]);
  return {
    ecosystem: 'javascript',
    measured_by:
      'scripts/quality/baseline.js (git ls-files scripts/**/*.js + eslint core pravidla: ' +
      'max-lines-per-function/max-params/max-depth/complexity)',
    scope_note:
      "meri jen 'scripts/**/*.js' (to same, co 'npm run lint'). HTML/MD obsah (landing, " +
      'docs, faq) je marketingovy/dokumentacni obsah, ne kod — limity na delku souboru ' +
      'na nej nedavaji smysl.',
    limits: LIMITS,
    skipped_metrics: SKIPPED_METRICS,
    violations: { files, functions, classes: [] },
    score_formula:
      '(radky_souboru / 600) * (max_slozitost_funkce_v_souboru / tvrdy_limit_slozitosti[15])',
    top10_worst_files: buildLeaderboard(debtPaths, allLines, maxComplexityPerFile),
  };
}

function keyOf(item) {
  return `${item.path}::${item.name || ''}::${item.metric}`;
}

function regressionMessage(item, baselineIndex) {
  const prior = baselineIndex.get(keyOf(item));
  if (!prior) {
    return `NOVE porusi limit: ${item.path} ${item.name || ''} ${item.metric}=${item.value} (limit ${item.soft})`;
  }
  if (item.value > prior.value) {
    return `ZHORSENI: ${item.path} ${item.name || ''} ${item.metric} ${prior.value} -> ${item.value}`;
  }
  return null;
}

function checkMode() {
  if (!existsSync(BASELINE_PATH)) {
    console.error('Chybi .quality-baseline.json — spust bez --check pro vygenerovani.');
    return 1;
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
  const current = buildReport();

  const baselineIndex = new Map();
  for (const group of Object.values(baseline.violations)) {
    for (const item of group) baselineIndex.set(keyOf(item), item);
  }

  const allCurrent = Object.values(current.violations).flat();
  const regressions = allCurrent
    .map((item) => regressionMessage(item, baselineIndex))
    .filter(Boolean);

  if (regressions.length) {
    console.error('Baseline regrese nalezeny:');
    for (const r of regressions) console.error(`  - ${r}`);
    return 1;
  }
  const total = Object.values(baseline.violations).reduce((n, g) => n + g.length, 0);
  console.log(`OK — zadna regrese proti baseline (${total} polozek v baseline).`);
  return 0;
}

if (process.argv.includes('--check')) {
  process.exit(checkMode());
} else {
  console.log(JSON.stringify(buildReport(), null, 2));
}
