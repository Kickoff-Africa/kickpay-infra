/**
 * API error handler service.
 * Parses thrown errors and returns a safe, user-facing message and status code.
 */

import { NextResponse } from "next/server";

export type ApiErrorResult = {
  message: string;
  statusCode: number;
};

/** Prisma error codes we care about */
const PRISMA_UNIQUE_VIOLATION = "P2002";
const PRISMA_NOT_FOUND = "P2025";

/**
 * Parse an unknown error into a consistent API error result.
 * Use in API route catch blocks to return proper JSON to the client.
 */
export function parseApiError(error: unknown): ApiErrorResult {
  if (error instanceof Error) {
    // Prisma errors (client has a code property)
    const prismaError = error as Error & { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === PRISMA_UNIQUE_VIOLATION) {
      const target = prismaError.meta?.target?.[0];
      if (target === "email") {
        return {
          message: "An account with this email already exists.",
          statusCode: 409,
        };
      }
      return {
        message: "This value is already in use.",
        statusCode: 409,
      };
    }
    if (prismaError.code === PRISMA_NOT_FOUND) {
      return {
        message: "The requested resource was not found.",
        statusCode: 404,
      };
    }

    // TypeError / ReferenceError (e.g. prisma.user undefined, bad setup)
    if (error.name === "TypeError" || error.name === "ReferenceError") {
      return {
        message: "Something went wrong on our end. Please try again or contact support.",
        statusCode: 500,
      };
    }

    // Generic Error with safe message (avoid leaking internals)
    const msg = error.message || "An unexpected error occurred.";
    // Don't expose stack or internal messages to client
    if (msg.includes("prisma") || msg.includes("undefined") || msg.includes("null")) {
      return {
        message: "Something went wrong on our end. Please try again.",
        statusCode: 500,
      };
    }
    return {
      message: msg,
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    statusCode: 500,
  };
}

/**
 * Build a NextResponse from a parsed API error.
 * Use in route handlers: return toApiErrorResponse(e);
 */
export function toApiErrorResponse(error: unknown): NextResponse {
  const { message, statusCode } = parseApiError(error);
  return NextResponse.json({ error: message }, { status: statusCode });
}
