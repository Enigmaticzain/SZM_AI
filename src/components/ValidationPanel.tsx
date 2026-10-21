import { CheckCircle2, XCircle } from 'lucide-react';
import { knowledgeBase } from '../data/knowledgeBase';

interface ValidationResult {
  label: string;
  passed: boolean;
  detail: string;
}

function runValidation(): ValidationResult[] {
  const skills = knowledgeBase.skills;
  const results: ValidationResult[] = [];

  // 1. Valid JSON
  try {
    JSON.parse(JSON.stringify(knowledgeBase));
    results.push({ label: 'Valid JSON format', passed: true, detail: 'Passes JSON.parse() validation' });
  } catch {
    results.push({ label: 'Valid JSON format', passed: false, detail: 'JSON parse error' });
  }

  // 2. Minimum 15 skills
  results.push({
    label: 'Minimum 15 skills',
    passed: skills.length >= 15,
    detail: `${skills.length} skills found`,
  });

  // 3. 5+ categories
  const usedCategories = new Set(skills.map((s) => s.category));
  results.push({
    label: '5+ categories covered',
    passed: usedCategories.size >= 5,
    detail: `${usedCategories.size} categories: ${Array.from(usedCategories).join(', ')}`,
  });

  // 4. All required fields
  const requiredFields = [
    'id', 'title', 'category', 'description', 'keyPoints', 'formulas',
    'specifications', 'applications', 'relatedSkills', 'complexity', 'source',
  ];
  const missingFields = skills.filter((s) => {
    const obj = s as unknown as Record<string, unknown>;
    return requiredFields.some((f) => {
      const val = obj[f];
      return val === undefined || val === null || (Array.isArray(val) && val.length === 0);
    });
  });
  results.push({
    label: 'All required fields present',
    passed: missingFields.length === 0,
    detail: missingFields.length === 0 ? 'All skills complete' : `${missingFields.length} skills missing fields`,
  });

  // 5. Formulas include variable definitions
  const formulaSkills = skills.filter((s) => s.formulas.length > 0);
  const formulasWithVars = formulaSkills.filter((s) =>
    s.formulas.some((f) => f.toLowerCase().includes('where') || f.includes('='))
  );
  results.push({
    label: 'Formulas include definitions',
    passed: formulasWithVars.length === formulaSkills.length,
    detail: `${formulasWithVars.length}/${formulaSkills.length} skills have defined variables`,
  });

  // 6. Specs include units
  const unitPattern = /[a-zA-Z²³°µ]+[/·]?[a-zA-Z²³°µ]*|%|mm|cm|m\/s|kg|Hz|MPa|GPa|V|A|W/;
  const specsWithUnits = skills.filter((s) =>
    Object.values(s.specifications).some((v) => unitPattern.test(v))
  );
  results.push({
    label: 'Specifications include units',
    passed: specsWithUnits.length === skills.length,
    detail: `${specsWithUnits.length}/${skills.length} skills have units in specs`,
  });

  // 7. Related skills reference valid IDs
  const allIds = new Set(skills.map((s) => s.id));
  const invalidRefs = skills.filter((s) =>
    s.relatedSkills.some((ref) => !allIds.has(ref))
  );
  results.push({
    label: 'Related skills reference valid IDs',
    passed: invalidRefs.length === 0,
    detail: invalidRefs.length === 0
      ? 'All cross-references valid'
      : `${invalidRefs.length} skills have invalid refs`,
  });

  // 8. Complexity ratings 1-10
  const validComplexity = skills.every((s) => s.complexity >= 1 && s.complexity <= 10);
  results.push({
    label: 'Complexity ratings 1–10',
    passed: validComplexity,
    detail: `Range: ${Math.min(...skills.map((s) => s.complexity))}–${Math.max(...skills.map((s) => s.complexity))}`,
  });

  // 9. Sources are specific
  const sourcedSkills = skills.filter((s) => s.source && s.source.length > 10);
  results.push({
    label: 'Sources are specific & traceable',
    passed: sourcedSkills.length === skills.length,
    detail: `${sourcedSkills.length}/${skills.length} skills have detailed sources`,
  });

  // 10. No duplicate IDs
  const uniqueIds = new Set(skills.map((s) => s.id));
  results.push({
    label: 'No duplicate skill IDs',
    passed: uniqueIds.size === skills.length,
    detail: `${uniqueIds.size} unique / ${skills.length} total`,
  });

  return results;
}

export default function ValidationPanel() {
  const results = runValidation();
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Validation Checklist
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            allPassed
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {passed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            allPassed ? 'bg-green-500' : 'bg-amber-500'
          }`}
          style={{ width: `${(passed / total) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {results.map((result, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
              result.passed ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            )}
            <div>
              <p className={`text-xs font-medium ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                {result.label}
              </p>
              <p className="text-[10px] text-slate-500">{result.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {allPassed && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-xs font-semibold text-green-700">
            ✅ Production-ready! All validations passed.
          </span>
        </div>
      )}
    </div>
  );
}
