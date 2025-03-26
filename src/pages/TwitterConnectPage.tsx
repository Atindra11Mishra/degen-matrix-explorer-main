import { useState, useEffect } from "react";
import { auth, twitterProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Twitter } from "lucide-react";
import axios from "axios";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FloatingElements from "@/components/FloatingElements";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useScore } from "@/context/ScoreContext";

const twitterTasks = [
  "Checking Crypto Twitter Presence",
  "Analyzing Engagement & Activity",
  "Measuring Follower Quality & Growth",
  "Detecting Viral Impact Score",
];

// Default score to use if API fails or returns no score
const DEFAULT_SCORE = 30;

const TwitterConnectPage = () => {
  const navigate = useNavigate();
  const { setTwitterScore, setTwitterConnected } = useScore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [completedScan, setCompletedScan] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetScore, setTargetScore] = useState(0);
  const [score, setScore] = useState(0);
  
  // Use Privy authentication
  const { authenticated, user: privyUser } = usePrivy();
  
  useEffect(() => {
    console.log("Privy user:", privyUser);
  }, [privyUser]);

  // Login with Twitter
  const loginWithTwitter = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, twitterProvider);
      setUser(result.user);
      setError(null);
      
      // Get user details from Privy user and Twitter auth
      const privyId = privyUser?.id || "guest";
      const email = privyUser?.email || "";
      const username = result.user.displayName || "unknown";
      
      try {
        // Get Twitter score from backend using axios
        console.log("Fetching score with data:", { privyId, email, username });
        const response = await axios.post('http://localhost:5000/api/score/get-twitterScore', {
          privyId,
          email,
          username
        });
        
        console.log("API response:", response.data.Twitterscore);
        
        // Extract score safely with fallback to default
        let twitterScore = response.data.Twitterscore || 30;
        
        
        // If no valid score found, use default
        if (!twitterScore || twitterScore <= 0) {
          console.log("No valid score in API response, using default:", DEFAULT_SCORE);
          twitterScore = DEFAULT_SCORE;
        }
        
        console.log("Setting target score to:", twitterScore);
        setTargetScore(twitterScore);
      } catch (apiError) {
        console.error("API error:", apiError);
        console.log("API failed, using default score:", DEFAULT_SCORE);
        setTargetScore(DEFAULT_SCORE);
      }
      
      setLoading(false);
    } catch (authErr) {
      console.error("Auth error:", authErr);
      setError(authErr.message);
      setLoading(false);
    }
  };

  // Start animation and handle connection process
  const handleConnect = () => {
    console.log("Starting animation with target score:", targetScore);
    setIsConnecting(true);

    // Task animation sequence
    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < taskStatus.length) {
        setTaskStatus((prev) => {
          const newStatus = [...prev];
          newStatus[currentTask] = true;
          return newStatus;
        });
        currentTask++;
      } else {
        // All tasks completed
        clearInterval(taskInterval);
        setCompletedScan(true);

        // Score animation
        let currentScore = 0;
        const scoreIncrement = Math.max(1, Math.ceil(targetScore / 50));
        const scoreInterval = setInterval(() => {
          currentScore += scoreIncrement;
          if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreInterval);

            // Wait 2 seconds and then redirect
            setTimeout(() => {
              console.log("Animation complete, redirecting with score:", targetScore);
              setTwitterScore(targetScore);
              setTwitterConnected(true);
              navigate("/connect/wallet");
            }, 2000);
          }
          setScore(currentScore);
        }, 30);
      }
    }, 800);
  };

  // Start animation when user is authenticated and score is available
  useEffect(() => {
    if (user && !isConnecting && !completedScan) {
      if (targetScore > 0) {
        console.log("User authenticated and score received, starting animation");
        handleConnect();
      } else {
        console.log("User authenticated but no score yet");
      }
    }
  }, [user, targetScore, isConnecting, completedScan]);

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements type="tweets" count={20} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-1 rounded-full ${
                  i === 0 ? "bg-cyber-green/70" : "bg-white/20"
                }`}
              />
            ))}
          </motion.div>

          <GlassmorphicCard className="w-full mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
                <Twitter size={24} className="text-cyber-green" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Analyzing Your Twitter" : "Connect Your Twitter"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting 
                ? "Calculating your Crypto Twitter influence..." 
                : "Let's analyze your CT engagement, influence & activity."}
            </motion.p>

            {!user ? (
              <div className="flex flex-col items-center gap-2">
                <CyberButton
                  onClick={loginWithTwitter}
                  className="w-full"
                  variant="primary"
                  icon={<Twitter size={18} />}
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Connect Twitter"}
                </CyberButton>
                <button
                  onClick={() => navigate("/connect/wallet")}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              </div>
            ) : (
              <p className="text-green-500"></p>
            )}

            {isConnecting && (
              <div className="text-left">
                {twitterTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task}
                    completed={taskStatus[index]}
                    index={index}
                  />
                ))}
              </div>
            )}

            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                <ScoreDisplay score={score} label="Points Earned" variant="primary" />
              </motion.div>
            )}
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 mt-4 text-sm"
              >
                Error: {error}
              </motion.p>
            )}
          </GlassmorphicCard>
          
        </div>
      </div>
    </PageTransition>
  );
};

export default TwitterConnectPage;