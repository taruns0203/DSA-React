import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Home from "./pages/Home.jsx";
import Arrays from "./pages/Arrays.jsx";
import LinkedList from "./pages/LinkedList.jsx";
import LegacyPage from "./pages/LegacyPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import LegacyRoute from "./components/LegacyRoute.jsx";
import ArrayVisualizer from "./pages/arrays/ArrayVisualizer.jsx";
import TwoPointers from "./pages/arrays/TwoPointers.jsx";
import ProblemPage from "./pages/arrays/Problems/ProblemPage.jsx";
import MergeIntervalsVisualizer from "./pages/arrays/MergeIntervals.jsx";
import SortingVisualizer from "./pages/arrays/SortingVisualizer.jsx";
import PrefixSumsVisualizer from "./pages/arrays/PrefixSum.jsx";
import SlidingWindowVisualizer from "./pages/arrays/SlidingWindow.jsx";
import LinkedListTopicPage from "./pages/linkedList/Home.jsx";
import LinkedListVisualizer from "./pages/linkedList/LinkedListVisualizer.jsx";
import { useEffect } from "react";

const HLJS_THEME = `
.hljs{background:transparent!important;color:inherit}
.hljs-keyword,.hljs-built_in,.hljs-type{color:#F59E0B;font-weight:600}
.hljs-string,.hljs-attr,.hljs-template-tag{color:#34D399}
.hljs-number,.hljs-literal{color:#FB923C}
.hljs-comment,.hljs-doctag{color:#6B7280;font-style:italic}
.hljs-title.function_,.hljs-title{color:#60A5FA}
.hljs-variable,.hljs-params{color:#E7E5E4}
.hljs-operator,.hljs-punctuation{color:#A8A29E}
.hljs-title.class_{color:#FBBF24}
.hljs-property{color:#C4B5FD}
.hljs-regexp{color:#F87171}
.hljs-meta,.hljs-meta .hljs-keyword{color:#A78BFA}
.hljs-subst{color:#E7E5E4}
.hljs-name,.hljs-tag{color:#F87171}
.hljs-symbol{color:#FB923C}
`;

export default function App() {
  useEffect(() => {
    if (!document.getElementById("hljs-custom-theme")) {
      const style = document.createElement("style");
      style.id = "hljs-custom-theme";
      style.textContent = HLJS_THEME;
      document.head.appendChild(style);
    }
  }, []);
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arrays" element={<Arrays />} />
        <Route path="/arrays/array-visualizer" element={<ArrayVisualizer />} />
        <Route path="/arrays/two-pointers" element={<TwoPointers />} />
        <Route
          path="/arrays/merge-intervals"
          element={<MergeIntervalsVisualizer />}
        />
        <Route path="/arrays/sorting" element={<SortingVisualizer />} />
        <Route path="/arrays/prefix-sum" element={<PrefixSumsVisualizer />} />
        <Route
          path="/arrays/sliding-window"
          element={<SlidingWindowVisualizer />}
        />
        <Route
          path="/:dsaSlug/:techniqueSlug/:problemSlug"
          element={<ProblemPage />}
        />
        <Route path="/linked-list" element={<LinkedListTopicPage />} />
        <Route
          path="/linked-list/visualizer"
          element={<LinkedListVisualizer />}
        />
        <Route
          path="/recursion"
          element={<LegacyPage sourcePath="/Recursion/index.html" />}
        />
        <Route path="/legacy/*" element={<LegacyPage />} />
        <Route path="/Arrays/*" element={<LegacyRoute />} />
        <Route path="/Linked-List/*" element={<LegacyRoute />} />
        <Route path="/Recursion/*" element={<LegacyRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
