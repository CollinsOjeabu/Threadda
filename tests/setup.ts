/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import schema from "../convex/schema"

// All Convex modules, so convex-test can resolve api.* / internal.* references.
// "use node" action files are excluded: they can't run in this runtime, and
// these tests only call queries and mutations.
const all = import.meta.glob("../convex/**/*.*s")
const modules = Object.fromEntries(
  Object.entries(all).filter(([path]) => !/\/convex\/(ideasActions|canvasChat|generation|ingestion|voiceDna|embeddingsActions|graphCompute)\.ts$/.test(path)),
)

export const makeT = () => convexTest(schema, modules)
