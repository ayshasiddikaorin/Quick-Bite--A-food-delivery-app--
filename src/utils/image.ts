/**
 * Image helpers — guard against React Native's
 * "source.uri should not be an empty string" warning.
 * Live backend data often has empty image / coverImage / logo / avatar fields,
 * so every <Image> renders through safeImageUri() and falls back to a
 * neutral placeholder instead of an empty uri.
 */

export const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAB4CAYAAAC3kr3rAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFPSURBVHhe7dOxCQAhAMBA959U+MYNtHwQyQRXXJM+Y35rA2/jDsDPIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwC4QADImAh7R0xHAAAAABJRU5ErkJggg==';

/** Returns the given URI when non-empty, otherwise a neutral placeholder. */
export function safeImageUri(uri?: string | null): string {
  return uri && uri.trim().length > 0 ? uri : PLACEHOLDER_IMAGE;
}
