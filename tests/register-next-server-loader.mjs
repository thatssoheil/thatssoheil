import { registerHooks } from "node:module";
import { resolve } from "./next-server-loader.mjs";

registerHooks({ resolve });
