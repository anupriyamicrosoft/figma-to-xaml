// code.ts

/// <reference types="@figma/plugin-typings" />


figma.showUI(__html__, { width: 500, height: 600 });


// Deeply sanitize any value to ensure it is serializable
function deepSanitize(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(deepSanitize);
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (typeof value === 'object') {
    // Skip Figma node objects
    if ('id' in value && 'type' in value) return undefined;
    const result: any = {};
    for (const k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        const sanitized = deepSanitize(value[k]);
        if (sanitized !== undefined) result[k] = sanitized;
      }
    }
    return result;
  }
  return undefined;
}

function extractAllNodeData(node: SceneNode): any {
  const result: any = {};
  // List of common Figma node properties to extract
  const props = [
    "id", "name", "type", "visible", "locked", "width", "height", "x", "y",
    "fills", "strokes", "strokeWeight", "strokeAlign", "effects", "opacity",
    "blendMode", "cornerRadius", "cornerSmoothing", "rotation", "layoutMode",
    "primaryAxisAlignItems", "counterAxisAlignItems", "paddingLeft", "paddingRight",
    "paddingTop", "paddingBottom", "itemSpacing", "children", "characters",
    "fontName", "fontSize", "textAlignHorizontal", "textAlignVertical", "letterSpacing",
    "lineHeight", "textCase", "textDecoration", "layoutGrids", "constraints",
    "clipsContent", "guides", "layoutAlign", "layoutGrow", "absoluteBoundingBox"
  ];

  // Extract properties from the node
  for (const key of props) {
    if (key in node) {
      const value = (node as any)[key];
      if (key === "children" && Array.isArray(value)) {
        result.children = value.map(extractAllNodeData);
      } else {
        const sanitized = deepSanitize(value);
        if (sanitized !== undefined) result[key] = sanitized;
      }
    }
  }

  // Optionally, include plugin data keys that might be attached to the node
  if ("getPluginDataKeys" in node && typeof node.getPluginDataKeys === "function") {
    const pluginData: Record<string, string> = {};
    for (const key of node.getPluginDataKeys()) {
      pluginData[key] = node.getPluginData(key);
    }
    if (Object.keys(pluginData).length > 0) result.pluginData = pluginData;
  }
  return result;
}

// This function updates the x:Class attribute in the XAML string to reflect the new class name and file name
function updateXamlClass(xaml: string, newClassName: string, fileName: string): string {
  return xaml.replace(/x:Class="YourNamespace.MainWindow"/, `x:Class="${newClassName}.${fileName}"`);
} 

// Listen for extract message from the UI
figma.ui.onmessage = async msg => {
  if (msg.type === "extract-design") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Please select at least one node.");
      figma.ui.postMessage({ type: "extract-error", data: [] });
      return;
    }
    figma.notify("Selection extracted");
    figma.ui.postMessage({ type: "debug", data: "Selection extracted" });

    
    // Extract combined JSON for the selection with detailed error logging
    let json = null;
    try {
      console.log('Selection for extraction:', selection.map(n => n.name));
      json = selection.map((node, idx) => {
        try {
          return extractAllNodeData(node);
        } catch (nodeErr) {
          console.error(`Error extracting node at index ${idx} (name: ${node.name}):`, nodeErr);
          figma.ui.postMessage({ type: "extract-error", data: `Error extracting node: ${node.name}` });
          return null;
        }
      });
      // Remove any nulls from failed nodes
      json = json.filter(Boolean);
      if (json.length === 0) throw new Error('All nodes failed to extract.');
      figma.notify("JSON extracted");
      figma.ui.postMessage({ type: "debug", data: "JSON extracted" });
      figma.ui.postMessage({ type: "design-json", data: json });
    } catch (err) {
      console.error('Failed to extract JSON:', err);
      figma.notify("Failed to extract JSON.");
      figma.ui.postMessage({ type: "extract-error", data: "JSON extraction failed." });
      return;
    }

    // Send JSON to backend
    try {
      figma.notify("Sending to backend...");
      figma.ui.postMessage({ type: "debug", data: "Sending to backend..." });
      const response = await fetch("https://figmatoxaml-cbe8hzfjg2bqdzch.canadacentral-01.azurewebsites.net/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json, className: msg.className, xamlName: msg.xamlName })
      });
      figma.notify("Response received from backend");
      figma.ui.postMessage({ type: "debug", data: "Response received from backend" });
      if (!response.ok) throw new Error("Backend error");
      let xaml = await response.text();
      let fileName = (msg.xamlName || "MainWindow").replace(/\.xaml$/i, "");
      let className = msg.className || "YourApp";
      xaml = updateXamlClass(xaml, className, fileName);
      figma.ui.postMessage({ type: "design-xaml", data: xaml });
    } catch (error) {
      let errorMsg = (error instanceof Error) ? error.message : String(error);
      figma.notify("Error converting selection: " + errorMsg);
      figma.ui.postMessage({ type: "extract-error", data: errorMsg });
    }
  }
  if (msg.type === "close-plugin") {
    figma.closePlugin();
  }
};




