import type { ZodError } from "zod";

/**
 * Standard return type for all server actions.
 * Never throw in server actions — always return ActionResult.
 */
export type ActionResult<T = void> =
  | { data: T; error?: never; fieldErrors?: never }
  | {
      data?: never;
      error: string;
      fieldErrors?: ReturnType<ZodError["flatten"]>;
    };

/**
 * Standard wrapper for paginated query results.
 */
export type PaginatedResult<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
