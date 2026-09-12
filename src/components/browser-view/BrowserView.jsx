// components/BrowserView.jsx
import { useEffect, useRef, useState } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdRefresh,
  MdHome,
  MdSearch,
} from "react-icons/md";
import {
  LuSparkles,
  LuEllipsisVertical,
} from "react-icons/lu";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

// import { getInjectionRule } from "../../injections/injectionEngine";
import { urlMappings } from "../../injections/urlMapping";
// import { FiX } from "react-icons/fi";


export default function BrowserView({ active, onTitleChange, onNewTab, initialUrl }) {
  const GOOGLE_URL = "https://www.google.com";

    const [url, setUrl] = useState(
  initialUrl || GOOGLE_URL
);

const [currentUrl, setCurrentUrl] = useState(
  initialUrl || GOOGLE_URL
);

const [isLoading, setIsLoading] = useState(false);

const webviewRef = useRef(null);
// const activeRuleRef = useRef(null);
const activeMappingRef = useRef(null);



const getUrlMapping = (url) => {
  try {
    const current = new URL(url);

return urlMappings.find((mapping) => {
  const compare = new URL(mapping.compareUrl);

  return (
    current.origin === compare.origin &&
    current.pathname === compare.pathname
  );
});
  } catch {
    return null;
  }
};






// const handleSearch = () => {
//   if (!url.trim()) return;

//   let finalUrl = "";

//   if (url.includes(".")) {
//     finalUrl = url.startsWith("http")
//       ? url
//       : `https://${url}`;
//   } else {
//     finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
//   }

//   setUrl(finalUrl);
//   setCurrentUrl(finalUrl);
// };

const handleSearch = () => {
  if (!url.trim()) return;

  let finalUrl = "";

  if (url.includes(".")) {
    finalUrl = url.startsWith("http")
      ? url
      : `https://${url}`;
  } else {
    finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
  }

  const mapping = getUrlMapping(finalUrl);

  if (mapping) {
    // What the address bar shows
    const displayUrl = mapping.displayUrl;

    // What the webview actually loads
    const actualUrl = mapping.actualUrl;

    console.log("MAPPING FOUND");
    console.log("DISPLAY:", displayUrl);
    console.log("ACTUAL:", actualUrl);

    activeMappingRef.current = mapping;

    setUrl(displayUrl);
    setCurrentUrl(actualUrl);

    return;
  }

  // Normal URL
  activeMappingRef.current = null;
  setUrl(finalUrl);
  setCurrentUrl(finalUrl);
};

useEffect(() => {
  const webview = webviewRef.current;
  if (!webview) return;

  const handleStartLoading = () => {
  console.log("🌐 Page loading...");
  setIsLoading(true);
};

const handleStopLoading = () => {
  console.log("🌐 Page loaded");
  setIsLoading(false);
};

const handleFailLoad = () => {
  console.log("❌ Page failed to load");
  setIsLoading(false);
};

const handleTargetBlank = (event) => {
  if (event.channel !== "target-blank") return;

  const url = event.args[0];

  console.log("TARGET BLANK URL:", url);

  onNewTab(url);
};




const handleDomReady = async () => {
  try {
    const data = await webview.executeJavaScript(`
      (() => {
        const icon =
          document.querySelector('link[rel="icon"]')?.href ||
          document.querySelector('link[rel="shortcut icon"]')?.href ||
          document.querySelector('link[rel*="icon"]')?.href ||
          '/favicon.ico';

        return {
          title: document.title,
          favicon: new URL(icon, location.origin).href
        };
      })();
    `);

    onTitleChange(data);

    // Update address bar
    // setUrl(webview.getURL());

    // Update address bar using display alias
    const actualUrl = webview.getURL();

    // --------------------------------------------------
    // 3 URL MAPPING
    // --------------------------------------------------

    const activeMapping = activeMappingRef.current;

    if (activeMapping) {
      // const displayUrl = buildMappedUrl(
      //   actualUrl,
      //   activeMapping.displayUrl
      // );
const displayUrl = activeMapping.displayUrl;
      console.log("🌐 ACTUAL URL:", actualUrl);
      console.log("👁️ DISPLAY URL:", displayUrl);

      setUrl(displayUrl);
      setCurrentUrl(actualUrl);
    } else {
      // Normal website
      setUrl(actualUrl);
      setCurrentUrl(actualUrl);
    }


    // ⭐ TEST: detect target="_blank"
    await webview.executeJavaScript(`
      (() => {
        if (window.__cromeClickTracker) return;

        window.__cromeClickTracker = true;

        document.addEventListener("click", (event) => {
          const element =
            event.target.closest("a, button");

          if (!element) return;

          const target =
            element.getAttribute("target");

          const href = element.href;

          console.log("🔥 CLICKED ELEMENT");
          console.log(
            "TAG:",
            element.tagName
          );
          console.log(
            "TEXT:",
            element.innerText
          );
          console.log(
            "TARGET:",
            target
          );
          console.log(
            "HREF:",
            href
          );

          if (
            element.tagName === "A" &&
            target === "_blank" &&
            href
          ) {
            event.preventDefault();

            console.log(
              "🔥🔥 TARGET BLANK FOUND:",
              href
            );

            window.dispatchEvent(
              new CustomEvent("crome-target-blank", {
                detail: href,
              })
            );
          }
        }, true);
      })();
    `);


    // injectCustomResult();

    // setTimeout(() => {
    //   injectCustomResult();
    // }, 2000);

  } catch (err) {
    console.error(err);
  }
};

const buildMappedUrl = (sourceUrl, targetUrl) => {
  try {
    const source = new URL(sourceUrl);
    const target = new URL(targetUrl);

    target.pathname = source.pathname;
    target.search = source.search;
    target.hash = source.hash;

    return target.toString();
  } catch {
    return targetUrl;
  }
};

const handleNavigate = (event) => {
  const navigatedUrl = event.url;

  // Check if this is a compare URL
  const mapping = getUrlMapping(navigatedUrl);

  if (mapping) {
    activeMappingRef.current = mapping;

    const displayUrl = buildMappedUrl(
      navigatedUrl,
      mapping.displayUrl
    );

    // const actualUrl = buildMappedUrl(
    //   navigatedUrl,
    //   mapping.actualUrl
    // );
const actualUrl = mapping.actualUrl;
    console.log("🔄 MAPPING FOUND");
    console.log("COMPARE:", mapping.compareUrl);
    console.log("DISPLAY:", displayUrl);
    console.log("ACTUAL:", actualUrl);

    setUrl(displayUrl);

    if (navigatedUrl !== actualUrl) {
      setCurrentUrl(actualUrl);
    }

    return;
  }

  // If we're already inside a mapped destination
  const activeMapping = activeMappingRef.current;

  if (activeMapping) {
    try {
      const current = new URL(navigatedUrl);
      const actual = new URL(activeMapping.actualUrl);

      if (current.origin === actual.origin) {
        const displayUrl = buildMappedUrl(
          navigatedUrl,
          activeMapping.displayUrl
        );

        setUrl(displayUrl);
        setCurrentUrl(navigatedUrl);

        return;
      }
    } catch {
      // Fall through to normal navigation
    }
  }

  // Normal website
  activeMappingRef.current = null;

  setUrl(navigatedUrl);
  setCurrentUrl(navigatedUrl);
};



const handleNavigateInPage = (event) => {
  const navigatedUrl = event.url;

  // First: check if this is the original compare URL
  const mapping = getUrlMapping(navigatedUrl);

  if (mapping) {
    activeMappingRef.current = mapping;

    const displayUrl = buildMappedUrl(
      navigatedUrl,
      mapping.displayUrl
    );

    const actualUrl = buildMappedUrl(
      navigatedUrl,
      mapping.actualUrl
    );

    setUrl(displayUrl);
    setCurrentUrl(actualUrl);

    return;
  }

  // IMPORTANT:
  // If we are already inside a mapped actual website,
  // keep using the display URL.
  const activeMapping = activeMappingRef.current;

  if (activeMapping) {
    try {
      const current = new URL(navigatedUrl);
      const actual = new URL(activeMapping.actualUrl);

      if (current.origin === actual.origin) {
        const displayUrl = buildMappedUrl(
          navigatedUrl,
          activeMapping.displayUrl
        );

        setUrl(displayUrl);
        setCurrentUrl(navigatedUrl);

        return;
      }
    } catch {
      // Continue to normal navigation
    }
  }

  // Normal website
  activeMappingRef.current = null;

  setUrl(navigatedUrl);
  setCurrentUrl(navigatedUrl);
};


webview.addEventListener("ipc-message", handleTargetBlank);
webview.addEventListener(
  "did-start-loading",
  handleStartLoading
);

webview.addEventListener(
  "did-stop-loading",
  handleStopLoading
);

webview.addEventListener(
  "did-fail-load",
  handleFailLoad
);
  webview.addEventListener("dom-ready", handleDomReady);
  webview.addEventListener("did-navigate", handleNavigate);
  webview.addEventListener("did-navigate-in-page", handleNavigateInPage);

  return () => {
    webview.removeEventListener(
  "ipc-message",
  handleTargetBlank
);
  webview.removeEventListener(
    "did-start-loading",
    handleStartLoading
  );

  webview.removeEventListener(
    "did-stop-loading",
    handleStopLoading
  );

  webview.removeEventListener(
    "did-fail-load",
    handleFailLoad
  );

    webview.removeEventListener("dom-ready", handleDomReady);
    webview.removeEventListener("did-navigate", handleNavigate);
    webview.removeEventListener(
      "did-navigate-in-page",
      handleNavigateInPage
    );
  };
}, [ onTitleChange]);

  const goBack = () => {
  if (webviewRef.current?.canGoBack()) {
    webviewRef.current.goBack();
  }
};

const goForward = () => {
  if (webviewRef.current?.canGoForward()) {
    webviewRef.current.goForward();
  }
};

const refreshPage = () => {
  webviewRef.current?.reload();
};

const goHome = () => {
  const home = "https://www.google.com";
  setUrl(home);
  setCurrentUrl(home);
};

  return (
    <div
      style={{
        display: active ? "flex" : "none",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Navbar */}

      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#d1dff7]">

  {/* Navigation Buttons */}
 <button
  onClick={goBack}
  className="w-8 h-8 rounded-full hover:bg-[#e9f0fb] flex items-center justify-center text-gray-600"
>
  <MdArrowBack size={20} />
</button>

<button
  onClick={goForward}
  className="w-8 h-8 rounded-full hover:bg-[#e9f0fb] flex items-center justify-center text-gray-600"
>
  <MdArrowForward size={20} />
</button>

<button
  onClick={refreshPage}
  className="w-8 h-8 rounded-full hover:bg-[#e9f0fb] flex items-center justify-center text-gray-600"
>
  <MdRefresh size={20} />
</button>

<button
  onClick={goHome}
  className="w-8 h-8 rounded-full hover:bg-[#e9f0fb] flex items-center justify-center text-gray-600"
>
  <MdHome size={20} />
</button>

  {/* Address Bar */}
  <div className="flex items-center flex-1 max-w-4xl h-9 rounded-full bg-[#e9f0fb] border-3 border-[#b3caf2] px-3">

    <MdSearch
      size={18}
      className="text-gray-400 mr-2 shrink-0"
    />

    <input
      type="text"
      placeholder="Search Google or type a URL"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
       onFocus={(e) => {
    e.target.select();
  }}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSearch();
      }}
      className="flex-1 bg-transparent outline-none text-[14px] text-gray-600 placeholder:text-gray-400"
    />

    {/* <button
      onClick={handleSearch}
      className="ml-2 px-4 py-1 rounded-full  hover:bg-[#b3caf2] text-[#3c4043] text-sm font-medium transition"
    >
                <FiX size={13} />
    </button> */}
  </div>

  <div className="flex h-12 items-center gap-3 px-3">

  {/* Extensions */}
  <button
    className="flex h-9 w-9 items-center justify-center rounded-full
               text-gray-600 transition hover:bg-[#e9f0fb]"
  >
    {/* <LuPuzzle size={21} strokeWidth={1.8} /> */}
    <IoExtensionPuzzleOutline size={18} strokeWidth={1.8} />

  </button>

  {/* Divider */}
  <div className="h-6 w-px bg-gray-500" />

  {/* Sparkle */}
  <button
    className="flex h-9 w-9 items-center justify-center rounded-full
               text-gray-600 transition hover:bg-[#e9f0fb]"
  >
    <LuSparkles size={18} strokeWidth={1.8} />
  </button>

  {/* Divider */}
  <div className="h-6 w-px bg-gray-500" />

  {/* Profile */}
  <button
    className="flex h-8 w-8 items-center justify-center
               rounded-full bg-indigo-500 text-sm font-medium text-white"
  >
    G
  </button>

  {/* More */}
  <button
    className="flex h-9 w-9 items-center justify-center rounded-full
               text-gray-600 transition hover:bg-[#e9f0fb]"
  >
    <LuEllipsisVertical  size={18} strokeWidth={2} />
  </button>

</div>

</div>
    
   


      <div style={{ flex: 1, position: "relative" }}>
  {currentUrl ? (
    <>
      <webview
        ref={webviewRef}
        src={currentUrl}
        preload={`file://${window.__dirname}/electron/webviewPreload.cjs`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />

      {isLoading && (
       <div
  className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden z-10"
>
  <div className="h-full w-1/3 bg-[#1a73e8] animate-[pulse_1s_ease-in-out_infinite]" />
</div>
      )}
    </>
  ) : (
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "28px",
        color: "#666",
      }}
    >
      Mini Browser
    </div>
  )}
</div>
    </div>
  );
}