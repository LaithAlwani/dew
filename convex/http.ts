import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Exposes Better Auth's HTTP routes on the Convex deployment (.convex.site).
authComponent.registerRoutes(http, createAuth);

export default http;
