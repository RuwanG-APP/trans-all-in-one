import { useState, useEffect } from 'react';
import heroImage from '../assets/hero.png';

function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500); // Small delay after 100%
          return 100;
        }
        return prev + 2; // Increment speed
      });
    }, 40); // Total time ~2 seconds

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="splash-container">
      <div className="splash-image" style={{ backgroundImage: `url(${heroImage})` }}></div>
      <div className="splash-overlay">
        <div className="splash-content">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Loading... {progress}%</p>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
