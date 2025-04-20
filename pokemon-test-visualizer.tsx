import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Check, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const COLORS = {
  passed: '#4ade80', // green
  failed: '#f87171', // red
  expectedFail: '#fbbf24', // amber/yellow for expected failures
  sv1: '#60a5fa', // blue
  sv3pt5: '#c084fc', // purple
  sv5: '#fcd34d', // yellow
  sv8: '#f97316', // orange
  default: '#94a3b8', // slate
};

const TestResultVisualizer = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTestCase, setExpandedTestCase] = useState(null);
  const [textInput, setTextInput] = useState('');
  
  const parseTestResults = (text) => {
    // Extract all test result lines
    const testResultLines = text.split('\n').filter(line => 
      line.includes('Results: TestResult')
    );
    
    // Parse the test results
    const testResults = testResultLines.map(line => {
      // Extract the relevant parts
      const passedMatch = line.match(/passed=(true|false)/);
      const passed = passedMatch ? passedMatch[1] === 'true' : null;
      
      const messageMatch = line.match(/message=\[([^\]]+)\]/);
      const message = messageMatch ? messageMatch[1] : null;
      
      // Extract supposedToFail flag
      const supposedToFailMatch = line.match(/supposedToFail=(true|false)/);
      const supposedToFail = supposedToFailMatch ? supposedToFailMatch[1] === 'true' : false;
      
      // Extract the check type from the message
      const checkType = message ? (message.includes('Expected Check') ? 'Expected Check' : 'Unexpected Check') : null;
      
      // Extract expected and unexpected cards
      const expectedMatch = line.match(/Expected: \[([^\]]*)\]/);
      const expectedCardsStr = expectedMatch ? expectedMatch[1] : '';
      
      const unexpectedMatch = line.match(/Unexpected: \[([^\]]*)\]/);
      const unexpectedCardsStr = unexpectedMatch ? unexpectedMatch[1] : '';
      
      // Parse card information
      const parseCards = (cardsStr) => {
        if (!cardsStr) return [];
        
        // Split by closing parenthesis followed by comma to separate cards
        return cardsStr.split('), ')
          .map(cardStr => {
            // Remove trailing parenthesis from the last item if present
            const cleanCardStr = cardStr.endsWith(')') ? cardStr : cardStr + ')';
            
            // Extract ID and name
            const idMatch = cleanCardStr.match(/id=([^,]+)/);
            const nameMatch = cleanCardStr.match(/name=([^)]+)/);
            
            return {
              id: idMatch ? idMatch[1] : null,
              name: nameMatch ? (nameMatch[1] === 'null' ? null : nameMatch[1]) : null
            };
          });
      };
      
      const expectedCards = parseCards(expectedCardsStr);
      const unexpectedCards = parseCards(unexpectedCardsStr);
      
      // Extract test categories
      const categoriesMatch = line.match(/testCategories=\[([^\]]*)\]/);
      const categoriesStr = categoriesMatch ? categoriesMatch[1] : '';
      const categories = categoriesStr && categoriesStr !== 'null' ? 
        categoriesStr.split(', ') : [];
      
      return {
        passed,
        checkType,
        message,
        expectedCards,
        unexpectedCards,
        categories,
        supposedToFail,
        timestamp: line.split(' ')[0],
        raw: line
      };
    });
    
    // Group pairs of tests (Expected Check and Unexpected Check for the same test case)
    const testCases = [];
    for (let i = 0; i < testResults.length; i += 2) {
      if (i + 1 < testResults.length) {
        const supposedToFail = testResults[i].supposedToFail || testResults[i+1].supposedToFail;
        testCases.push({
          unexpectedCheck: testResults[i].checkType === 'Unexpected Check' ? testResults[i] : testResults[i+1],
          expectedCheck: testResults[i].checkType === 'Expected Check' ? testResults[i] : testResults[i+1],
          categories: testResults[i].categories.length > 0 ? testResults[i].categories : 
                      (testResults[i+1].categories.length > 0 ? testResults[i+1].categories : []),
          passed: testResults[i].passed && testResults[i+1].passed,
          supposedToFail: supposedToFail
        });
      }
    }
    
    // Process each test case
    testCases.forEach((testCase, index) => {
      testCase.id = index + 1;
      
      // Identify the expected and unexpected cards
      testCase.expectedCards = testCase.expectedCheck.expectedCards;
      testCase.unexpectedCards = testCase.unexpectedCheck.unexpectedCards;
      
      // Extract card series (e.g., sv1, sv3pt5)
      const cardSeries = new Set();
      testCase.expectedCards.forEach(card => {
        if (card.id) {
          const series = card.id.split('-')[0];
          cardSeries.add(series);
        }
      });
      testCase.unexpectedCards.forEach(card => {
        if (card.id) {
          const series = card.id.split('-')[0];
          cardSeries.add(series);
        }
      });
      testCase.cardSeries = [...cardSeries];
      
      // Check if this is a duplicate test case
      testCase.isDuplicate = testCases.some((tc, tcIndex) => {
        if (tcIndex >= index) return false; // Only check previous test cases
        
        // Compare expected cards
        const sameExpected = JSON.stringify(tc.expectedCards) === JSON.stringify(testCase.expectedCards);
        
        // Compare unexpected cards
        const sameUnexpected = JSON.stringify(tc.unexpectedCards) === JSON.stringify(testCase.unexpectedCards);
        
        return sameExpected && sameUnexpected;
      });
    });
    
    // Filter out duplicates
    const uniqueTestCases = testCases.filter(tc => !tc.isDuplicate);
    
    // Get summary stats
    const passedTests = uniqueTestCases.filter(tc => tc.passed).length;
    const failedTests = uniqueTestCases.length - passedTests;
    const expectedFailedTests = uniqueTestCases.filter(tc => !tc.passed && tc.supposedToFail).length;
    const unexpectedFailedTests = failedTests - expectedFailedTests;
    
    // Identify unique card series
    const allCardSeries = new Set();
    uniqueTestCases.forEach(tc => {
      tc.cardSeries.forEach(series => allCardSeries.add(series));
    });
    
    // Stats about the failures
    const failureAnalysis = uniqueTestCases
      .filter(tc => !tc.passed)
      .map(tc => {
        // Analyze why it failed
        let failureReason;
        if (!tc.unexpectedCheck.passed && tc.expectedCheck.passed) {
          failureReason = "Unexpected cards present";
        } else if (tc.unexpectedCheck.passed && !tc.expectedCheck.passed) {
          failureReason = "Expected cards missing";
        } else {
          failureReason = "Both expected missing and unexpected present";
        }
        
        return {
          testCaseId: tc.id,
          failureReason,
          expectedCards: tc.expectedCards,
          unexpectedCards: tc.unexpectedCards,
          categories: tc.categories
        };
      });
    
    return {
      summary: {
        totalTests: uniqueTestCases.length,
        passedTests,
        failedTests,
        expectedFailedTests,
        unexpectedFailedTests,
        cardSeries: [...allCardSeries]
      },
      testCases: uniqueTestCases,
      failures: failureAnalysis
    };
  };
  
  const handleParse = () => {
    try {
      if (!textInput.trim()) {
        setError("Please paste the log data first");
        return;
      }
      
      const parsed = parseTestResults(textInput);
      setTestData(parsed);
      setError(null);
    } catch (err) {
      setError(`Error parsing data: ${err.message}`);
      console.error(err);
    }
  };
  
  const handleExpandTestCase = (id) => {
    if (expandedTestCase === id) {
      setExpandedTestCase(null);
    } else {
      setExpandedTestCase(id);
    }
  };

  const renderSummaryCharts = () => {
    if (!testData || !testData.summary) return null;
    
    const { totalTests, passedTests, expectedFailedTests, unexpectedFailedTests } = testData.summary;
    
    const pieData = [
      { name: 'Passed', value: passedTests, color: COLORS.passed },
      { name: 'Expected Failures', value: expectedFailedTests, color: COLORS.expectedFail },
      { name: 'Unexpected Failures', value: unexpectedFailedTests, color: COLORS.failed },
    ];
    
    // Count cards by series
    const seriesCounts = {};
    testData.testCases.forEach(tc => {
      tc.cardSeries.forEach(series => {
        seriesCounts[series] = (seriesCounts[series] || 0) + 1;
      });
    });
    
    const seriesData = Object.keys(seriesCounts).map(series => ({
      name: series,
      count: seriesCounts[series],
      color: COLORS[series] || COLORS.default
    }));
    
    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/2">
          <h3 className="text-xl font-bold mb-4">Test Results Summary</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tests`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <p className="text-sm font-medium">Total Tests</p>
              <p className="text-2xl font-bold">{totalTests}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-600">Passed</p>
              <p className="text-2xl font-bold text-green-600">{passedTests}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-amber-500">Expected Fails</p>
              <p className="text-2xl font-bold text-amber-500">{expectedFailedTests}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-500">Unexpected Fails</p>
              <p className="text-2xl font-bold text-red-500">{unexpectedFailedTests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/2">
          <h3 className="text-xl font-bold mb-4">Card Series Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} tests`, 'Count']} />
              <Legend />
              <Bar dataKey="count" name="Test Cases">
                {seriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const CardList = ({ cards, title, borderColor }) => {
    if (!cards || cards.length === 0) return null;
    
    return (
      <div className={`border-l-4 pl-2 ${borderColor}`}>
        <h4 className="font-medium text-gray-700">{title} ({cards.length})</h4>
        <ul className="ml-2">
          {cards.map((card, idx) => (
            <li key={idx} className="text-sm py-1">
              <span className="font-mono text-gray-500">{card.id}</span>: {card.name || '<null>'}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const renderTestCases = () => {
    if (!testData || !testData.testCases) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Test Cases</h3>
        {testData.testCases.map((testCase) => (
          <div 
            key={testCase.id}
            className="border-b border-gray-200 py-2 last:border-b-0"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => handleExpandTestCase(testCase.id)}
            >
              <div className="flex items-center">
                {testCase.passed ? (
                  <Check className="text-green-500 mr-2" size={20} />
                ) : testCase.supposedToFail ? (
                  <X className="text-amber-500 mr-2" size={20} />
                ) : (
                  <X className="text-red-500 mr-2" size={20} />
                )}
                <span className="font-medium">Test Case #{testCase.id}</span>
                {testCase.supposedToFail && !testCase.passed && (
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs py-1 px-2 rounded-full">
                    Expected to Fail
                  </span>
                )}
                {testCase.categories.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded-full">
                    {testCase.categories.join(', ')}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {testCase.cardSeries.map((series) => (
                    <span
                      key={series}
                      className="ml-1 inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[series] || COLORS.default }}
                      title={`Card Series: ${series}`}
                    />
                  ))}
                </div>
                {expandedTestCase === testCase.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </div>
            
            {expandedTestCase === testCase.id && (
              <div className="mt-2 ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardList 
                  cards={testCase.expectedCards} 
                  title="Expected Cards" 
                  borderColor="border-blue-400"
                />
                <CardList 
                  cards={testCase.unexpectedCards} 
                  title="Unexpected Cards" 
                  borderColor="border-orange-400"
                />
                
                {!testCase.passed && (
                  <div className="col-span-1 md:col-span-2 bg-red-50 p-2 rounded-md mt-2">
                    <p className="text-red-700 text-sm">
                      <strong>Failure Reason:</strong> {
                        testData.failures.find(f => f.testCaseId === testCase.id)?.failureReason || 'Unknown'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pokémon Card Test Result Visualizer</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-2">
          <FileText size={20} className="mr-2 text-blue-500" />
          <h2 className="text-lg font-semibold">Input Log Data</h2>
        </div>
        
        <textarea
          className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm"
          placeholder="Paste your test log data here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        
        <div className="flex justify-between mt-2">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md ml-auto"
            onClick={handleParse}
          >
            Parse Log Data
          </button>
        </div>
      </div>
      
      {testData && (
        <>
          {renderSummaryCharts()}
          {renderTestCases()}
        </>
      )}
    </div>
  );
};

export default TestResultVisualizer;