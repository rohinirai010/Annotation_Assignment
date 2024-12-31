import React, { useState, useEffect } from "react";
import "../App.css";
import spinningSoundPath from "/src/assets/spinningSound.mp3";
import softSoundPath from "/src/assets/softSound.mp3";

const SpinWheel = () => {
  const [timeLeft, setTimeLeft] = useState("23:59:44");
  const [hasSpun, setHasSpun] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [prize, setPrize] = useState(null);
  
  // Rewards definition
  const rewards = [
    { type: "multiplier", value: "x500", icon: "🪙", background: "from-purple-600/80 to-purple-800/80" },
    { type: "heart", value: "", icon: "💜", background: "from-purple-600/80 to-teal-600/80" },
    { type: "multiplier", value: "x25", icon: "🪙", background: "from-purple-600/80 to-purple-800/80" },
    { type: "refresh", value: "", icon: "🔄", background: "from-purple-600/80 to-teal-600/80" },
    { type: "multiplier", value: "x50", icon: "🪙", background: "from-purple-600/80 to-purple-800/80" },
    { type: "magnet", value: "x2", icon: "🧲", background: "from-purple-600/80 to-teal-600/80" },
    { type: "multiplier", value: "5x", icon: "🪙", background: "from-purple-600/80 to-purple-800/80" },
    { type: "heart", value: "x2", icon: "💜", background: "from-purple-600/80 to-teal-600/80" },
  ];

  // Create sound objects
  const spinningSound = new Audio(spinningSoundPath);
  const stopSound = new Audio("");
  const backgroundMusic = new Audio(softSoundPath);

  // Play background music
  useEffect(() => {
    backgroundMusic.loop = true;
    backgroundMusic.play();
    return () => backgroundMusic.pause();
  }, []);


  useEffect(() => {
    if (showModal) {
      setRotation(0); // Resetting the arrow pointer
    }
  }, [showModal]);

  // Timer for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const [hours, minutes, seconds] = prev.split(":").map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds > 0) totalSeconds--;
        const newHours = Math.floor(totalSeconds / 3600);
        const newMinutes = Math.floor((totalSeconds % 3600) / 60);
        const newSeconds = totalSeconds % 60;
        return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generating confetti
  const createConfetti = () => {
    const confetti = [];
    for (let i = 0; i < 50; i++) {
      confetti.push({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      });
    }
    return confetti;
  };

  const handleSpin = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setHasSpun(true);
      spinningSound.play(); // Playing spinning sound when wheel starts

      const spins = 5 + Math.floor(Math.random() * 5); // Random number of full rotations
      const extraDegrees = Math.floor(Math.random() * 360); // Random additional degrees 
      const totalRotation = spins * 360 + extraDegrees; // Total rotation for the wheel

      // Setting rotation angle to match the total rotation
      const soundDuration = spinningSound.duration * 1000;
      setRotation(rotation + totalRotation); 

      // Calculating prize index
      const finalRotation = totalRotation % 360;
      const prizeIndex = Math.floor((360 - finalRotation + 360 / rewards.length / 2) / (360 / rewards.length)) % rewards.length;

      setTimeout(() => {
        setIsSpinning(false);
        stopSound.play(); 
        setPrize(rewards[prizeIndex]); // Set prize based on calculated index
        setShowModal(true); // Show the modal
      }, skipAnimation ? 0 : soundDuration); // Use sound duration for timeout
    }
  };

  return (
    <div className="flex flex-col items-center xl:justify-center min-h-screen bg-[#181E1A] p-4">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal-backdrop absolute inset-0" />
          {createConfetti().map((conf, i) => (
            <div key={i} className="confetti w-2 h-2 rounded-full" style={{
              left: conf.left,
              top: "-10px",
              animationDelay: conf.animationDelay,
              backgroundColor: conf.backgroundColor,
            }} />
          ))}
          <div className="modal-content relative flex flex-col px-8 py-6 rounded-2xl text-center items-center justify-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Congratulations! 🎉</h3>
            <p className="text-xl text-white">You won {prize?.value} {prize?.icon}</p>
            <button onClick={() => setShowModal(false)} className="mt-6 px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors text-white">
              Claim Reward
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md">
        <div className="text-center mb-[5.5rem]">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-[#8655FA] to-[#E657FB] 0 text-2xl font-medium mb-4">Free spin every day</h2>
          {hasSpun && <p className="text-white text-3xl font-bold">You have already used your Free Spin</p>}
        </div>

        {/* Arrow Pointer */}
        <div className="absolute left-1/2 top-[10.8rem] -translate-x-1/2 z-20">
          <div className="pointer w-10 h-10" style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            transform: "rotate(180deg) scale(1.2)",
          }} />
        </div>

        {/* Wheel Container */}
        <div className="wheel-section relative w-80 h-80 mx-auto shadow-md">
          <div
            className="absolute inset-0 transition-transform duration-[3000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? `transform ${spinningSound.duration}s cubic-bezier(0.2, 0.8, 0.3, 0.9)`
                : "",
            }}
          >
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`wheel-segment shadow-md ${index % 2 === 0 ? "even" : ""}`}
                style={{
                  transform: `rotate(${index * 45}deg)`,
                  transformOrigin: "50% 50%",
                }}
              >
                <div className="absolute top-[0.8rem] md:top-[1.3rem] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <div className="relative">
                    <span className="prize-icon text-4xl">{reward.icon}</span>
                    {reward.value && (
                      <div className="prize-value absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-medium">{reward.value}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center Circle */}
          <div className="center-circle absolute inset-[32%] rounded-full  flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-sm text-gray-600">Next Spin</div>
              <div className="text-xl font-bold text-gray-800">{timeLeft}</div>
            </div>
          </div>
        </div>

        {/* Animation Toggle */}
        <div className="flex items-center justify-center mt-8 text-gray-400">
          <span className="mr-4">Skip animation</span>
          <button className={`w-12 h-6 rounded-full transition-colors ${skipAnimation ? "bg-purple-600" : "bg-gray-700"}`} onClick={() => setSkipAnimation(!skipAnimation)}>
            <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${skipAnimation ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-6 text-base px-[2rem] sm:px-0">You have one Free Spin a day, there are no more Free Spins today</p>
          <button
            className="bg-gradient-to-r from-[#8C52FE] to-[#F445FD] text-white px-8 py-4 rounded-full flex items-center justify-center space-x-2 w-full max-w-[19rem] sm:max-w-xs mx-auto hover:bg-purple-700 transition-colors disabled:opacity-50"
            onClick={handleSpin}
            disabled={isSpinning}
          >
            <span className="text-xl font-bold">Spin the Wheel 🪙 </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;
