import { load } from "js-yaml";

export type HeaderType = {
  sheetId: number;
  author: string;
  sheetTitle: string;
};

function isHeaderType(value: unknown): value is HeaderType {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as HeaderType).sheetId === "number" &&
    typeof (value as HeaderType).author === "string" &&
    typeof (value as HeaderType).sheetTitle === "string"
  );
}

export function processDocumentHeader(doc: string): [number, HeaderType] {
  const regex = /---\s+([^]+?)\s+---\s+/;
  const yamlMatch = regex.exec(doc);
  
  if (!yamlMatch) {
    throw new Error("Document header not found");
  }
  
  const parsed = load(yamlMatch[1]);
  
  if (!isHeaderType(parsed)) {
    throw new Error("Invalid document header format");
  }
  
  return [yamlMatch[0].length + yamlMatch.index, parsed];
}