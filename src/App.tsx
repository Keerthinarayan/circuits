import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrainCircuit as Circuit, Code2, Brain, Trophy, ChevronRight, Github, Lock, Radio, Monitor, Cpu, Lightbulb, ArrowLeft, RefreshCcw, Play, Check, X } from 'lucide-react';
import { CircuitBoard } from './components/CircuitBoard';
import { ComponentPalette } from './components/ComponentPalette';
import { useStore } from './store';
import { levels } from './levels';

function App() {
  const [selectedLevel, setSelectedLevel] = useState<typeof levels[0] | null>(null);
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeEmail, setShowWelcomeEmail] = useState(false);

  const { components, wires, runSimulation, reset } = useStore();

  const handleCodeSubmit = () => {
    if (!selectedLevel) return;

    const error = selectedLevel.validateCircuit(components, wires);
    if (error) {
      setError(error);
      return;
    }

    const isValidCode = selectedLevel.validateCode(code);
    if (!isValidCode) {
      setError('Invalid code syntax');
      return;
    }

    // Start simulation
    runSimulation();
    setIsSuccess(true);
    setError(null);
    setAttempts(prev => prev + 1);

    // Make LED blink on success
    const led = Object.values(components).find(c => c.type === 'led');
    if (led) {
      led.state = { ...led.state, blinking: true };
    }
  };

  const resetLevel = () => {
    setCode('');
    setAttempts(0);
    setShowSolution(false);
    setIsSuccess(false);
    setError(null);
    reset();
  };

  const handleLevelSelect = (level: typeof levels[0]) => {
    if (!level.locked) {
      setSelectedLevel(level);
      setShowWelcomeEmail(true);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-900 text-white">
        {!selectedLevel ? (
          <>
            {/* Hero Section */}
            <header className="relative overflow-hidden">
              <div 
                className="absolute inset-0 z-0 opacity-20"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="text-center">
                  <Circuit className="h-16 w-16 mx-auto mb-6 text-blue-400" />
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                    CIRCUITS
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                    Master Electronics Through Progressive Challenges
                  </p>
                </div>
              </div>
            </header>

            {/* Level Selection */}
            <section className="py-20 bg-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Challenge</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleLevelSelect(level)}
                      className={`bg-slate-700 p-6 rounded-xl transition-colors text-left relative ${
                        level.locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500 rounded-lg">
                          {React.createElement(level.icon, { className: "h-6 w-6" })}
                        </div>
                        <h3 className="text-xl font-semibold">{level.title}</h3>
                      </div>
                      <p className="text-slate-300 mb-4">{level.description}</p>
                      <div className="flex items-center text-blue-400">
                        <span>{level.locked ? 'Coming Soon' : 'Start Challenge'}</span>
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </div>
                      {level.locked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          // Level Interface
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button 
              onClick={() => {
                setSelectedLevel(null);
                setShowWelcomeEmail(false);
              }}
              className="flex items-center text-blue-400 mb-8 hover:text-blue-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Levels
            </button>
            
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Left Panel - Instructions & Components */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {React.createElement(selectedLevel.icon, { className: "h-6 w-6" })}
                    <h2 className="text-2xl font-bold">{selectedLevel.title}</h2>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Hints:</h3>
                    <ul className="space-y-2">
                      {selectedLevel.hints.map((hint, index) => (
                        <li key={index} className="text-slate-300 flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-slate-300">
                    <p>Attempts remaining: {selectedLevel.maxAttempts - attempts}</p>
                  </div>
                </div>

                <ComponentPalette />
              </div>

              {/* Circuit Board & Code Editor */}
              <div className="lg:col-span-3 space-y-8">
                <CircuitBoard />

                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-semibold">Code Editor</h3>
                    <button
                      onClick={resetLevel}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      <RefreshCcw className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-64 bg-slate-900 text-slate-300 p-4 rounded-lg font-mono"
                    placeholder="Write your code here..."
                  />
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {isSuccess && (
                        <div className="flex items-center text-green-400">
                          <Check className="h-5 w-5 mr-2" />
                          Success!
                        </div>
                      )}
                      {!isSuccess && attempts > 0 && (
                        <div className="flex items-center text-red-400">
                          <X className="h-5 w-5 mr-2" />
                          Try again
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleCodeSubmit}
                      disabled={isSuccess}
                      className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-5 w-5" />
                      Run Code
                    </button>
                  </div>

                  {showSolution && (
                    <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                      <h4 className="font-semibold mb-2">Example Solution:</h4>
                      <pre className="text-slate-300 font-mono">
                        {`MOV P0, 1  ; Turn LED ON
WAIT 100   ; Wait 100 cycles
MOV P0, 0  ; Turn LED OFF
WAIT 100   ; Wait 100 cycles
JMP 0      ; Loop forever`}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Email Modal */}
        {showWelcomeEmail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl max-w-2xl mx-4">
              <h2 className="text-xl font-semibold mb-4">New Message</h2>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">From: mentor@ossil8.com</p>
                <p className="text-slate-300 whitespace-pre-line">{selectedLevel.description}</p>
              </div>
              <button 
                onClick={() => setShowWelcomeEmail(false)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Circuit className="h-6 w-6 text-blue-400" />
                <span className="font-semibold">CIRCUITS</span>
              </div>
              <div className="text-slate-400">
                © 2025 Circits Electronics. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
}

export default App;