// code.ts
/// <reference types="@figma/plugin-typings" />
figma.showUI(__html__, { width: 600, height: 600 });
function extractAllNodeData(node) {
    var result = {};
    // List of common Figma node properties to extract
    var props = [
        "id", "name", "type", "visible", "locked", "width", "height", "x", "y",
        "fills", "strokes", "strokeWeight", "strokeAlign", "effects", "opacity",
        "blendMode", "cornerRadius", "cornerSmoothing", "rotation", "layoutMode",
        "primaryAxisAlignItems", "counterAxisAlignItems", "paddingLeft", "paddingRight",
        "paddingTop", "paddingBottom", "itemSpacing", "children", "characters",
        "fontName", "fontSize", "textAlignHorizontal", "textAlignVertical", "letterSpacing",
        "lineHeight", "textCase", "textDecoration", "layoutGrids", "constraints",
        "clipsContent", "guides", "layoutAlign", "layoutGrow", "absoluteBoundingBox"
    ];
    for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
        var key = props_1[_i];
        if (key in node) {
            var value = node[key];
            if (key === "children" && Array.isArray(value)) {
                result.children = value.map(extractAllNodeData);
            }
            else {
                try {
                    JSON.stringify(value);
                    result[key] = value;
                }
                catch (_a) {
                    // skip unserializable
                }
            }
        }
    }
    // Optionally, include plugin data
    if ("getPluginDataKeys" in node && typeof node.getPluginDataKeys === "function") {
        var pluginData = {};
        for (var _b = 0, _c = node.getPluginDataKeys(); _b < _c.length; _b++) {
            var key = _c[_b];
            pluginData[key] = node.getPluginData(key);
        }
        if (Object.keys(pluginData).length > 0)
            result.pluginData = pluginData;
    }
    return result;
}
/* function extractNodeData(node: SceneNode): any {
  const base: {
    id: string;
    name: string;
    type: SceneNode["type"];
    layout: { x: number; y: number; width: number; height: number };
    style?: Record<string, any>;
    content?: string;
    children?: any[];
  } = {
    id: node.id,
    name: node.name,
    type: node.type,
    layout: {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    }
  };

  if (
    "fills" in node &&
    Array.isArray(node.fills) &&
    node.fills.length > 0
  ) {
    const fill = node.fills[0] as Paint;
    if (fill.type === "SOLID") {
      base["style"] = {
        fill: rgbToHex(fill.color)
      };
    }
  }

  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    base["content"] = textNode.characters;
    base["style"] = {
      ...base["style"],
      fontSize: textNode.fontSize,
      fontName: textNode.fontName
    };
  }

  if ("children" in node) {
    base["children"] = node.children.map(extractNodeData);
  }

  return base;
}
 */
/* function extractStyle(node: SceneNode) {
  const fills = (node as GeometryMixin).fills;
  let color = undefined;

  if (fills && Array.isArray(fills) && fills.length > 0 && fills[0].type === "SOLID") {
    const { r, g, b } = fills[0].color;
    color = rgbToHex({ r, g, b });
  }

  return {
    color: color, // Foreground color
    opacity: "opacity" in node ? (node as any).opacity ?? 1 : 1 // Opacity
  };
}

function rgbToHex(color: RGB): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
} */
function updateXamlClass(xaml, newClassName, fileName) {
    // This regex matches x:Class="OldClassName" in the root element
    return xaml.replace(/x:Class="MainWindow"/, "x:Class=\"".concat(newClassName, ".").concat(fileName, "\""));
}
figma.ui.onmessage = function (msg) {
    if (msg.type === "extract-design") {
        var selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.notify("Please select at least one node.");
            return;
        }
        var json = selection.map(extractAllNodeData);
        figma.ui.postMessage({ type: "design-json", data: json });
        fetch("https://figmatoxaml-cbe8hzfjg2bqdzch.canadacentral-01.azurewebsites.net/convert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        })
            .then(function (response) { return response.text(); })
            .then(function (xaml) {
            if (msg.className && msg.className.length > 0) {
                var fileName = msg.xamlName || "MainWindow";
                // Remove .xaml extension if present
                fileName = fileName.replace(/\.xaml$/i, "");
                xaml = updateXamlClass(xaml, msg.className, fileName);
            }
            console.log("Received XAML:", xaml);
            figma.ui.postMessage({ type: "design-xaml", data: xaml });
        })
            .catch(function (error) {
            console.error("Error:", error);
        });
        // figma.ui.postMessage({ type: "design-xaml", data: xaml });
    }
    if (msg.type === "close-plugin") {
        figma.closePlugin();
    }
};
/* figma.ui.onmessage = msg => {
  if (msg.type === "extract-design") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Please select at least one node.");
      return;
    }

    const json = selection.map(extractNodeData);
    // const xaml = json.map(jsonToXaml).join("\n");

    figma.ui.postMessage({ type: "design-json", data: json });
    // figma.ui.postMessage({ type: "design-xaml", data: xaml });
  }

  if (msg.type === "close-plugin") {
    figma.closePlugin();
  }
}; */
