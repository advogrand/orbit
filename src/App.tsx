import { useState } from 'react';
import Header from './components/Header';
import ScrollytellingHero from './components/ScrollytellingHero';
import RequestSection from './components/RequestSection';
import { useReducedMotion } from './hooks/useReducedMotion';

export default function App() {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  return (
    <>
      <Header
        progress={progress}
        reducedMotion={reducedMotion}
      />
      <main>
        <ScrollytellingHero
          reducedMotion={reducedMotion}
          onProgressChange={setProgress}
        />
        <RequestSection id="request" />
      </main>
    </>
  );
}
