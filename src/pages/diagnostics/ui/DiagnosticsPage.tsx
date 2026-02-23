
import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Terminal, RotateCcw } from 'lucide-react';
import { PageLayout, ViewHeader, SectionCard, Button } from '../../../shared/ui';
import { TestResult } from '../../../shared/lib/testRunner';
import { runMathTests, runParserTests, runShoppingTests } from '../../../tests/unitTests';
import { runCartIntegration } from '../../../tests/integrationTests';
import { useCartContext } from '../../../features/shopping-cart/model/CartContext';

export const DiagnosticsPage: React.FC = () => {
  const [results, setResults] = useState<{ suite: string; data: TestResult[] }[]>([]);
  const [running, setRunning] = useState(false);
  
  // Contexts needed for integration tests
  const cartContext = useCartContext();

  const handleRunAll = async () => {
    setRunning(true);
    setResults([]);
    
    // 1. Run Granular Unit Tests
    const mathResults = await runMathTests();
    const parserResults = await runParserTests();
    const shoppingResults = await runShoppingTests();
    
    // 2. Run Integration Tests
    // We pass the context hooks down
    const cartResults = await runCartIntegration(cartContext);

    setResults([
        { suite: "Natural Language Parsers", data: parserResults },
        { suite: "Shopping Logic (Aggregation)", data: shoppingResults },
        { suite: "Math & Tracker Logic", data: mathResults },
        { suite: "Integration (Cart)", data: cartResults }
    ]);
    
    setRunning(false);
  };

  const totalTests = results.reduce((acc, r) => acc + r.data.length, 0);
  const passedTests = results.reduce((acc, r) => acc + r.data.filter(t => t.passed).length, 0);
  const failedTests = totalTests - passedTests;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <ViewHeader 
            title="System Diagnostics" 
            subtitle="In-App Test Runner"
            icon={<Terminal />}
            actions={
                <Button 
                    onClick={handleRunAll} 
                    loading={running} 
                    icon={results.length > 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4"/>}
                >
                    {results.length > 0 ? 'Rerun Tests' : 'Run Suite'}
                </Button>
            }
        />

        {results.length > 0 && (
             <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-xl flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-content dark:text-content-dark">{totalTests}</span>
                    <span className="text-xs font-bold uppercase text-content-tertiary">Total</span>
                </div>
                <div className="p-4 bg-success-container/20 border border-success/20 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-success">{passedTests}</span>
                    <span className="text-xs font-bold uppercase text-success/70">Passed</span>
                </div>
                <div className="p-4 bg-danger-container/20 border border-danger/20 rounded-xl flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${failedTests > 0 ? 'text-danger' : 'text-content-tertiary'}`}>{failedTests}</span>
                    <span className={`text-xs font-bold uppercase ${failedTests > 0 ? 'text-danger/70' : 'text-content-tertiary'}`}>Failed</span>
                </div>
             </div>
        )}

        {results.map((suite, idx) => (
            <SectionCard key={idx} title={suite.suite} icon={<Terminal />} noPadding>
                <div className="divide-y divide-outline/30 dark:divide-outline-dark/30">
                    {suite.data.map((test, tIdx) => (
                        <div key={tIdx} className="p-4 flex items-center justify-between group hover:bg-surface-variant/30">
                            <div className="flex items-start gap-3">
                                {test.passed ? (
                                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-danger mt-0.5" />
                                )}
                                <div>
                                    <div className={`text-sm font-medium ${test.passed ? 'text-content dark:text-content-dark' : 'text-danger'}`}>
                                        {test.description}
                                    </div>
                                    {test.error && (
                                        <div className="mt-1 text-xs font-mono bg-danger-container/20 text-danger p-2 rounded">
                                            {test.error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs font-mono text-content-tertiary">
                                {test.duration.toFixed(2)}ms
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        ))}
      </div>
    </PageLayout>
  );
};
