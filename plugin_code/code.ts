// code.ts

/// <reference types="@figma/plugin-typings" />


figma.showUI(__html__, { width: 600, height: 600 });


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
        try {
          JSON.stringify(value);
          result[key] = value;
        } catch {
          // skip unserializable
        }
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
figma.ui.onmessage = msg => {
  if (msg.type === "extract-design") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Please select at least one node.");
      figma.ui.postMessage({ type: "extract-error", data: [] });
      return;
    }
    // Extract data from selected nodes
    const json = selection.map(extractAllNodeData);

    // Post the extracted JSON data back to the UI
    figma.ui.postMessage({ type: "design-json", data: json });
    
    fetch("https://figmatoxaml-cbe8hzfjg2bqdzch.canadacentral-01.azurewebsites.net/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    })
      .then(response => response.text())
      .then(xaml => {
        
          let fileName = msg.xamlName;
          // Remove .xaml extension if present
          fileName = fileName.replace(/\.xaml$/i, "");
          let className = msg.className;
          xaml = updateXamlClass(xaml, className, fileName);

        // Post the extracted XAML back to the UI
        figma.ui.postMessage({ type: "design-xaml", data: xaml });
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }
};




