function runMobileNavDiagnostics() {
  console.log("🚀 Starting Mobile Navigation Diagnostics 🚀");

  const diagnostics = {};
  let allElementsPresent = true;

  function getElementInfo(selector, name) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`❌ Element not found: ${name} (selector: ${selector})`);
      diagnostics[name] = { error: `Element not found with selector: ${selector}` };
      allElementsPresent = false;
      return null;
    }

    const computedStyle = window.getComputedStyle(element);
    const info = {
      exists: true,
      tagName: element.tagName,
      id: element.id,
      classes: Array.from(element.classList).join(', '),
      styles: {
        display: computedStyle.display,
        flexDirection: computedStyle.flexDirection,
        justifyContent: computedStyle.justifyContent,
        alignItems: computedStyle.alignItems,
        width: computedStyle.width,
        height: computedStyle.height,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
      },
      childrenCount: element.children.length,
      parentTagName: element.parentElement ? element.parentElement.tagName : null,
      parentClasses: element.parentElement ? Array.from(element.parentElement.classList).join(', ') : null,
    };
    diagnostics[name] = info;
    return element;
  }

  console.log("\n--- Checking Main Navigation Container ---");
  const mobileNav = getElementInfo('.mobile-nav', 'Mobile Navigation Bar');

  if (mobileNav) {
    console.log("\n--- Checking Navigation Items (first 3 direct children as sample) ---");
    const navItems = mobileNav.children;
    diagnostics['Navigation Items'] = [];
    for (let i = 0; i < Math.min(navItems.length, 3); i++) {
      const item = navItems[i];
      const itemName = `Nav Item ${i + 1}`;
      const computedStyle = window.getComputedStyle(item);
      diagnostics['Navigation Items'].push({
        name: itemName,
        tagName: item.tagName,
        id: item.id,
        classes: Array.from(item.classList).join(', '),
        styles: {
          display: computedStyle.display,
          flexDirection: computedStyle.flexDirection,
          flexGrow: computedStyle.flexGrow,
          flexBasis: computedStyle.flexBasis,
          textAlign: computedStyle.textAlign,
          width: computedStyle.width,
        }
      });
    }
     if (navItems.length > 0) {
        console.log(`✅ Found ${navItems.length} direct child items in .mobile-nav.`);
     } else {
        console.warn("⚠️ No direct child items found in .mobile-nav. This might be an issue.");
     }
  }

  console.log("\n--- Checking Toggle Button Container ---");
  const toggleContainer = getElementInfo('.mobile-nav-toggles', 'Toggle Container');

  if (toggleContainer) {
    console.log("\n--- Checking Language Toggle Button ---");
    getElementInfo('#mobile-language-toggle', 'Language Toggle');

    console.log("\n--- Checking Theme Toggle Button ---");
    getElementInfo('#mobile-theme-toggle', 'Theme Toggle');

    // Parent-child check for toggles
    const langToggle = document.querySelector('#mobile-language-toggle');
    const themeToggle = document.querySelector('#mobile-theme-toggle');
    if (langToggle && langToggle.parentElement !== toggleContainer) {
        console.warn("⚠️ Language toggle is not a direct child of the toggle container.");
        diagnostics['Language Toggle'].parentWarning = "Not a direct child of .mobile-nav-toggles";
    }
    if (themeToggle && themeToggle.parentElement !== toggleContainer) {
        console.warn("⚠️ Theme toggle is not a direct child of the toggle container.");
        diagnostics['Theme Toggle'].parentWarning = "Not a direct child of .mobile-nav-toggles";
    }
  }

  console.log("\n--- Computed Styles Summary ---");
  if (diagnostics['Mobile Navigation Bar'] && diagnostics['Mobile Navigation Bar'].styles) {
    console.log("Mobile Nav (.mobile-nav):");
    console.log(`  display: ${diagnostics['Mobile Navigation Bar'].styles.display}`);
    console.log(`  justify-content: ${diagnostics['Mobile Navigation Bar'].styles.justifyContent}`);
    console.log(`  align-items: ${diagnostics['Mobile Navigation Bar'].styles.alignItems}`);
  }
  if (diagnostics['Toggle Container'] && diagnostics['Toggle Container'].styles) {
    console.log("Toggle Container (.mobile-nav-toggles):");
    console.log(`  display: ${diagnostics['Toggle Container'].styles.display}`);
    console.log(`  flex-direction: ${diagnostics['Toggle Container'].styles.flexDirection}`);
    console.log(`  align-items: ${diagnostics['Toggle Container'].styles.alignItems}`);
  }
  if (diagnostics['Language Toggle'] && diagnostics['Language Toggle'].styles) {
    console.log("Language Toggle (#mobile-language-toggle):");
     console.log(`  font-size: ${diagnostics['Language Toggle'].styles.fontSize}`); // Example specific style
    console.log(`  padding: ${diagnostics['Language Toggle'].styles.padding}`);
  }
   if (diagnostics['Theme Toggle'] && diagnostics['Theme Toggle'].styles) {
    console.log("Theme Toggle (#mobile-theme-toggle):");
     console.log(`  font-size: ${diagnostics['Theme Toggle'].styles.fontSize}`);
    console.log(`  padding: ${diagnostics['Theme Toggle'].styles.padding}`);
  }


  if (allElementsPresent) {
    console.log("\n✅ All key elements seem to be present.");
  } else {
    console.error("\n❌ Some key elements are missing. Please check the errors above.");
  }

  console.log("\n📋 Full Diagnostics Object: 📋");
  console.log(diagnostics);
  console.log("\n🚀 Mobile Navigation Diagnostics Complete 🚀");
  return diagnostics; // Optionally return the object for further programmatic use
}

// To run this diagnostic, open your browser's developer console and type:
// runMobileNavDiagnostics();
// Make sure this script is loaded on the page or pasted directly into the console.
