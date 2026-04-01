import { authClient } from "./lib/auth-client";
console.log(typeof authClient.useActiveOrganization === 'function');
console.log(typeof authClient.organization === 'object');
