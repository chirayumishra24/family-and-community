import { Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './state/gameStore';
import FullscreenButton from './components/FullscreenButton/FullscreenButton';
import IntroScreen from './components/IntroScreen/IntroScreen';
import TeamSetup from './components/TeamSetup/TeamSetup';
import CommunityBoard from './components/CommunityBoard/CommunityBoard';
import WhoChallenge from './challenges/WhoChallenge/WhoChallenge';
import ConnectChallenge from './challenges/ConnectChallenge/ConnectChallenge';
import CrisisChallenge from './challenges/CrisisChallenge/CrisisChallenge';
import SharingChallenge from './challenges/SharingChallenge/SharingChallenge';
import DetectiveChallenge from './challenges/DetectiveChallenge/DetectiveChallenge';
import StoryChallenge from './challenges/StoryChallenge/StoryChallenge';
import FinalChallenge from './components/FinalChallenge/FinalChallenge';
import ResultsScreen from './components/ResultsScreen/ResultsScreen';

export default function App() {
  return (
    <GameProvider>
      <FullscreenButton />
      <Routes>
        <Route path="/9-1-intro" element={<IntroScreen />} />
        <Route path="/9-2-team-setup" element={<TeamSetup />} />
        <Route path="/9-3-community-board" element={<CommunityBoard />} />
        <Route path="/9-4-family-challenge" element={<WhoChallenge />} />
        <Route path="/9-5-connect-challenge" element={<ConnectChallenge />} />
        <Route path="/9-6-community-crisis" element={<CrisisChallenge />} />
        <Route path="/9-7-sharing-challenge" element={<SharingChallenge />} />
        <Route path="/9-8-community-detective" element={<DetectiveChallenge />} />
        <Route path="/9-9-community-stories" element={<StoryChallenge />} />
        <Route path="/9-10-final-challenge" element={<FinalChallenge />} />
        <Route path="/9-11-results" element={<ResultsScreen />} />
        <Route path="*" element={<Navigate to="/9-1-intro" replace />} />
      </Routes>
    </GameProvider>
  );
}
