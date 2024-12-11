import "./App.css";
import { ScrollerSection } from "./components/ScrollerSection";

function App() {
  return (
    <>
      <main className="flex justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-red-200 via-green-200 to-purple-200 w-screen">
        <ScrollerSection />
      </main>
    </>
  );
}

export default App;
