import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useConnect, Connector, useAccount } from "wagmi";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FloatingElements from "@/components/FloatingElements";
import ScoreDisplay from "@/components/ScoreDisplay";

const walletTasks: string[] = [
  "Checking DEX Trades & Interactions",
  "Analyzing NFT Flip Performance",
  "Measuring DeFi Exposure & Farming Activity",
  "Detecting Blue-Chip Token Holdings",
];

const WalletConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected, isConnecting, status } = useAccount();
  const { connect, connectors } = useConnect();
  
  const [taskStatus, setTaskStatus] = useState<boolean[]>(Array(walletTasks.length).fill(false));
  const [completedScan, setCompletedScan] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const targetScore = 5750;

  // Animation sequence - runs tasks, shows score, then redirects
  const startAnimationSequence = () => {
    console.log("🚀 Starting animation sequence...");
    setIsAnalyzing(true);
    
    // Step 1: Task animation - show each task being completed sequentially
    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < walletTasks.length) {
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
        
        // Step 2: Score animation - increment score until target reached
        let currentScore = 0;
        const scoreIncrement = Math.ceil(targetScore / 50); // Complete in ~50 steps
        const scoreInterval = setInterval(() => {
          currentScore += scoreIncrement;
          
          if (currentScore >= targetScore) {
            // Score animation complete
            currentScore = targetScore;
            clearInterval(scoreInterval);
            
            // Step 3: After score is displayed, redirect
            console.log("⏱️ Score displayed, waiting before redirect...");
            setTimeout(() => {
              console.log("✅ Animation complete, redirecting to /connect/telegram");
              navigate("/connect/telegram");
            }, 2000); // Wait 2 seconds to let user see the final score
          }
          
          setScore(currentScore);
        }, 30); // Update score every 30ms for smooth animation
      }
    }, 800); // Show each task completing every 800ms
  };

  // Start animation immediately when wallet is connected
  useEffect(() => {
    // If we're connected via wagmi and animation hasn't started yet
    if (isConnected && !isAnalyzing && !completedScan) {
      console.log("🔄 Wallet Connected:", address);
      
      // Store wallet address
      if (address) {
        localStorage.setItem("walletAddress", address);
      }
      
      // Start animation sequence immediately when connected
      console.log("🚀 Starting animation for connected wallet");
      startAnimationSequence();
    }
  }, [isConnected, address, isAnalyzing, completedScan]);

  // Function to Connect Wallet via WalletConnect
  const connectWallet = async () => {
    try {
      const wcConnector: Connector | undefined = connectors.find((c) => c.id === "walletConnect");
      if (!wcConnector) {
        alert("WalletConnect is not available.");
        return;
      }

      console.log("⏳ Connecting wallet...");
      
      // Don't set isAnalyzing here - we'll let the useEffect trigger it
      // when isConnected becomes true
      
      await connect({ connector: wcConnector });
      // After successful connection, isConnected will be true
      // The useEffect will automatically trigger the animation sequence
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ WalletConnect Error:", err.message);
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements type="wallets" count={25} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          {/* Progress steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-1 rounded-full ${i <= 1 ? "bg-cyber-green/70" : "bg-white/20"}`}
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
              <div className="w-12 h-12 rounded-full bg-cyber-pink/10 border border-cyber-pink/30 flex items-center justify-center">
                <Wallet size={24} className="text-cyber-pink" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Connecting Wallet" : 
               isAnalyzing ? "Analyzing Your Wallet" : 
               completedScan ? "Analysis Complete" : 
               "Connect Your Wallet"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting ? "Please confirm the connection in your wallet app..." :
               isAnalyzing ? "Your on-chain activity defines your degen rank." :
               completedScan ? "Your degen score has been calculated!" :
               "Tap below to connect and verify your on-chain presence."}
            </motion.p>

            {/* Connect Wallet Button - only show when wallet is not connected or connecting */}
            {!isConnected && !isConnecting && !isAnalyzing && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <CyberButton
                  onClick={connectWallet}
                  className="w-full"
                  variant="secondary" 
                  icon={<Wallet size={18} />}
                >
                  Connect Wallet
                </CyberButton>
                <button
                  onClick={() => navigate("/connect/telegram")}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              </div>
            )}
            
            {/* Show connecting message when wallet is connecting */}
            {isConnecting && !isAnalyzing && (
              <div className="text-center py-2">
                <div className="flex justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-cyber-pink border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-white/70">Waiting for wallet connection...</p>
              </div>
            )}

            {/* Show Scanning Animation when analyzing (after connection is established) */}
            {isAnalyzing && (
              <div className="text-left">
                {walletTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task}
                    completed={taskStatus[index]}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Show Score After Scan */}
            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                <ScoreDisplay score={score} label="Points Earned" variant="secondary" />
              </motion.div>
            )}
          </GlassmorphicCard>

          {/* Connector line animation */}
          {completedScan && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-0.5 h-10 bg-gradient-to-b from-cyber-pink to-transparent mb-4"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default WalletConnectPage;