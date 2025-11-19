var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/borrow.js
var borrow_exports = {};
__export(borrow_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(borrow_exports);
var handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  try {
    console.log("\u{1F4D6} Borrow function called");
    const { bookId } = JSON.parse(event.body);
    if (!bookId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Book ID is required" })
      };
    }
    console.log("Processing book ID:", bookId);
    const mockResponse = {
      success: true,
      message: `\u{1F389} "${bookId}" kitab\u0131 ba\u015Far\u0131yla \xF6d\xFCn\xE7 al\u0131nd\u0131!`,
      loanId: "mock-" + Date.now(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      bookId,
      bookTitle: `Book ${bookId}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("\u2705 Mock loan created:", mockResponse.loanId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResponse)
    };
  } catch (error) {
    console.error("\u274C Error in borrow function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "\xD6d\xFCn\xE7 alma ba\u015Far\u0131s\u0131z: " + error.message
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=borrow.js.map
