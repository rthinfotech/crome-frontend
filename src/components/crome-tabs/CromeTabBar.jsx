// ChromeTabBar.jsx
import { FiPlus } from "react-icons/fi";
import ChromeTab from "./CromeTab";
import "../../styles/crometab.css";

export default function ChromeTabBar({ tabs, activeTab, setActiveTab, addTab, closeTab }) {
  return (
    <div className="chrome-tabs">
      <div className="chrome-tabs-list">
        {tabs.map((tab) => (
          <ChromeTab
            key={tab.id}
            id={tab.id}
            title={tab.title}
             favicon={tab.favicon}   // <-- Add this
            active={tab.id === activeTab}
            onClick={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
      </div>
      <div className="chrome-new"
      //  onClick={addTab}
        onClick={() => addTab()}
       >
        <FiPlus size={16} />
      </div>
    </div>
  );
}