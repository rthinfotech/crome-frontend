// components/BrowserView.jsx
import { useEffect, useRef, useState } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdRefresh,
  MdHome,
  MdSearch,
} from "react-icons/md";
import { getInjectionRule } from "../../injections/injectionEngine";


export default function BrowserView({ active, onTitleChange }) {
  const GOOGLE_URL = "https://www.google.com";

      const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState(GOOGLE_URL);
  const webviewRef = useRef(null);



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

  setUrl(finalUrl);
  setCurrentUrl(finalUrl);
};

const injectCustomResult = async () => {
  const webview = webviewRef.current;

  if (!webview) return;

  try {
    const query = new URL(webview.getURL())
      .searchParams
      .get("q");

    if (!query) return;

    const rule = getInjectionRule(query);

    if (!rule) {
      console.log("No injection rule for:", query);
      return;
    }

    const result = await webview.executeJavaScript(`
      (() => {

        const position = ${rule.position};
        const injectionId =
          "crome-injected-${rule.name}";

        const inject = () => {

          // Already injected
          if (
            document.getElementById(injectionId)
          ) {
            return true;
          }

          const results =
            document.querySelectorAll(
              "div.MjjYud"
            );

          console.log(
            "Google results:",
            results.length
          );

          // Target result not available yet
          if (results.length < position) {
            return false;
          }

          // Create result
          const customResult =
            document.createElement("div");

          customResult.id = injectionId;

          customResult.innerHTML =
            ${JSON.stringify(rule.inject)};

          // Insert before target
          const target =
            results[position - 1];

          target.before(customResult);

          console.log(
            "Crome result injected!"
          );

          return true;
        };


        // Try immediately
        if (inject()) {
          return "injected";
        }


        // Watch Google's dynamic rendering
        const observer =
          new MutationObserver(() => {

            if (inject()) {
              observer.disconnect();
            }

          });


        observer.observe(
          document.body,
          {
            childList: true,
            subtree: true
          }
        );


        // Safety timeout
        setTimeout(() => {
          observer.disconnect();
        }, 10000);


        return "waiting-for-results";

      })();
    `);

    console.log(
      "Injection result:",
      result
    );

  } catch (error) {
    console.error(
      "Injection error:",
      error
    );
  }
};

useEffect(() => {
  const webview = webviewRef.current;
  if (!webview) return;

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
      setUrl(webview.getURL());
        injectCustomResult();

//       setTimeout(() => {
//   injectCustomResult();
// }, 2000);

    } catch (err) {
      console.error(err);
    }
  };

  // Normal navigation
  const handleNavigate = (event) => {
    setUrl(event.url);
  };

  // SPA / hash navigation
  const handleNavigateInPage = (event) => {
    setUrl(event.url);
  };

  webview.addEventListener("dom-ready", handleDomReady);
  webview.addEventListener("did-navigate", handleNavigate);
  webview.addEventListener("did-navigate-in-page", handleNavigateInPage);

  return () => {
    webview.removeEventListener("dom-ready", handleDomReady);
    webview.removeEventListener("did-navigate", handleNavigate);
    webview.removeEventListener(
      "did-navigate-in-page",
      handleNavigateInPage
    );
  };
}, [currentUrl, onTitleChange]);

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

      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#202124] border-b border-[#3c4043]">

  {/* Navigation Buttons */}
 <button
  onClick={goBack}
  className="w-8 h-8 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-gray-300"
>
  <MdArrowBack size={20} />
</button>

<button
  onClick={goForward}
  className="w-8 h-8 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-gray-300"
>
  <MdArrowForward size={20} />
</button>

<button
  onClick={refreshPage}
  className="w-8 h-8 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-gray-300"
>
  <MdRefresh size={20} />
</button>

<button
  onClick={goHome}
  className="w-8 h-8 rounded-full hover:bg-[#3c4043] flex items-center justify-center text-gray-300"
>
  <MdHome size={20} />
</button>

  {/* Address Bar */}
  <div className="flex items-center flex-1 max-w-4xl h-9 rounded-full bg-[#303134] border border-[#5f6368] px-3">

    <MdSearch
      size={18}
      className="text-gray-400 mr-2 shrink-0"
    />

    <input
      type="text"
      placeholder="Search Google or type a URL"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSearch();
      }}
      className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder:text-gray-400"
    />

    <button
      onClick={handleSearch}
      className="ml-2 px-4 py-1 rounded-full bg-[#1a73e8] hover:bg-[#4285f4] text-white text-sm font-medium transition"
    >
      Go
    </button>
  </div>
</div>
    
   

      {/* Page */}
      <div style={{ flex: 1 }}>
        {currentUrl ? (
          <webview
            ref={webviewRef}
            src={currentUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
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