/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as canvas from "../canvas.js";
import type * as canvasChat from "../canvasChat.js";
import type * as canvasChatHelpers from "../canvasChatHelpers.js";
import type * as content from "../content.js";
import type * as cronHelpers from "../cronHelpers.js";
import type * as crons from "../crons.js";
import type * as embeddings from "../embeddings.js";
import type * as embeddingsActions from "../embeddingsActions.js";
import type * as generation from "../generation.js";
import type * as graphCompute from "../graphCompute.js";
import type * as graphComputeHelpers from "../graphComputeHelpers.js";
import type * as graphEdges from "../graphEdges.js";
import type * as helpers from "../helpers.js";
import type * as ideas from "../ideas.js";
import type * as ingestion from "../ingestion.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_rateLimits from "../lib/rateLimits.js";
import type * as lib_similarity from "../lib/similarity.js";
import type * as migrations from "../migrations.js";
import type * as posts from "../posts.js";
import type * as rateLimit from "../rateLimit.js";
import type * as rateLimitHelpers from "../rateLimitHelpers.js";
import type * as theme from "../theme.js";
import type * as users from "../users.js";
import type * as voiceDna from "../voiceDna.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  canvas: typeof canvas;
  canvasChat: typeof canvasChat;
  canvasChatHelpers: typeof canvasChatHelpers;
  content: typeof content;
  cronHelpers: typeof cronHelpers;
  crons: typeof crons;
  embeddings: typeof embeddings;
  embeddingsActions: typeof embeddingsActions;
  generation: typeof generation;
  graphCompute: typeof graphCompute;
  graphComputeHelpers: typeof graphComputeHelpers;
  graphEdges: typeof graphEdges;
  helpers: typeof helpers;
  ideas: typeof ideas;
  ingestion: typeof ingestion;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/rateLimits": typeof lib_rateLimits;
  "lib/similarity": typeof lib_similarity;
  migrations: typeof migrations;
  posts: typeof posts;
  rateLimit: typeof rateLimit;
  rateLimitHelpers: typeof rateLimitHelpers;
  theme: typeof theme;
  users: typeof users;
  voiceDna: typeof voiceDna;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
