// App.jsx
import { useState, useCallback } from "react";
import ChromeTabBar from "./components/crome-tabs/CromeTabBar";
import BrowserView from "./components/browser-view/BrowserView";

function App() {
  // const [tabs, setTabs] = useState([{ id: 1, title: "New Tab" }]);
  const [tabs, setTabs] = useState([
  {
    id: 1,
    title: "New Tab",
    favicon: "",
  },
]);
  const [activeTab, setActiveTab] = useState(1);

const addTab = () => {
  const id = Date.now();

  setTabs((prev) => [
    ...prev,
    {
      id,
      title: "New Tab",
      favicon: "",
    },
  ]);

  setActiveTab(id);
};

  const closeTab = (id) => {
    if (tabs.length === 1) return;

    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);

    if (activeTab === id) {
      setActiveTab(filtered[filtered.length - 1].id);
    }
  };

const updateTabInfo = useCallback((id, data) => {
  setTabs((prev) =>
    prev.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            title: data.title || "New Tab",
            favicon: data.favicon || "",
          }
        : tab
    )
  );
}, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#f5f5f5",
      }}
    >
      <ChromeTabBar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        addTab={addTab}
        closeTab={closeTab}
      />

      <div style={{ flex: 1, position: "relative" }}>
        {tabs.map((tab) => (
        <BrowserView
  key={tab.id}
  active={tab.id === activeTab}
  onTitleChange={(data) => updateTabInfo(tab.id, data)}
/>
        ))}
      </div>
    </div>
  );
}

export default App;