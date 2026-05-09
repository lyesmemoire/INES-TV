
const fs = require('fs');
const content = fs.readFileSync('final_report_utf8.json', 'utf8').replace(/^\uFEFF/, '');
const report = JSON.parse(content);

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  byFile: {}
};

function processSuite(suite) {
  if (suite.specs) {
    suite.specs.forEach(spec => {
      const fileName = spec.file;
      if (!results.byFile[fileName]) {
        results.byFile[fileName] = { passed: 0, failed: 0, total: 0 };
      }
      
      spec.tests.forEach(test => {
        results.total++;
        results.byFile[fileName].total++;
        
        const status = test.results[0]?.status;
        if (status === 'passed') {
          results.passed++;
          results.byFile[fileName].passed++;
        } else if (status === 'skipped') {
          results.skipped++;
        } else {
          results.failed++;
          results.byFile[fileName].failed++;
        }
      });
    });
  }
  
  if (suite.suites) {
    suite.suites.forEach(processSuite);
  }
}

report.suites.forEach(processSuite);

console.log(JSON.stringify(results, null, 2));
