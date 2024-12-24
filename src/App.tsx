import "./App.css";
import { InfiniteScrollerSection } from "./components/InfiniteScrollerSection";

function App() {
  return (
    <>
      <main className="flex justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-red-200 via-green-200 to-purple-200 w-screen">
        <InfiniteScrollerSection />
      </main>
    </>
  );
}

export default App;
