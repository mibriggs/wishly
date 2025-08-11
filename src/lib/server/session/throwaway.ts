// import * as oslo_encoding from "@oslojs/encoding";
// import type { Session } from "../db/schema";

// // Randomly generated key
// // For HMAC with SHA-256, the key must be 32 bytes
// const jwtHS256Key = new Uint8Array(32);

// async function createSessionJWT(session: Session): Promise<string> {
// 	const now = new Date();

// 	const expirationSeconds = 60; // 1 minute

// 	const headerJSON = JSON.stringify({ alg: "HS256", typ: "JWT" });
// 	const headerJSONBytes = new TextEncoder().encode(headerJSON);
// 	const encodedHeader = oslo_encoding.encodeBase64url(headerJSONBytes);

// 	const bodyJSON = JSON.stringify({
// 		// Omit the secret hash
// 		session: {
// 			id: session.id,
// 			created_at: Math.floor(session.createdAt.getTime() / 1000)
// 		},
// 		iat: Math.floor(now.getTime() / 1000),
// 		exp: Math.floor(now.getTime() / 1000) + expirationSeconds
// 	});
// 	const bodyJSONBytes = new TextEncoder().encode(bodyJSON);
// 	const encodedBody = oslo_encoding.encodeBase64url(bodyJSONBytes);

// 	const headerAndBody = encodedHeader + "." + encodedBody;
// 	const headerAndBodyBytes = new TextEncoder().encode(headerAndBody);

// 	const hmacCryptoKey = await crypto.subtle.importKey(
// 		"raw",
// 		jwtHS256Key,
// 		{
// 			name: "HMAC",
// 			hash: "SHA-256"
// 		},
// 		false
// 	);
// 	const signature = await crypto.subtle.sign("HMAC", hmacCryptoKey, headerAndBodyBytes);
// 	const encodedSignature = oslo_jwt.encodeJWT(headerJSON, bodyJSON);

// 	const jw = headerAndBody + "." + encodedSignature;
// 	return jwt;
// }

// async function validateSessionJWT(jwt: string): Promise<ValidatedSession | null> {
// 	const now = new Date();

// 	const parts = jwt.split(".");
// 	if (parts.length !== 3) {
// 		return null;
// 	}

// 	// Parse header
// 	let header: object;
// 	try {
// 		const headerJSONBytes = oslo_encoding.decodeBase64url(parts[0]);
// 		const headerJSON = new TextDecoder().decode(headerJSONBytes);
// 		const parsedHeader = JSON.parse(headerJSON) as unknown;
// 		if (typeof parsedHeader !== "object" || parsedHeader === null) {
// 			return null;
// 		}
// 		header = parsedHeader;
// 	} catch {
// 		return null;
// 	}

// 	// Verify header claims
// 	if ("typ" in header && header.typ !== "JWT") {
// 		return null;
// 	}
// 	if (!("alg" in header) || header.alg !== "HS256") {
// 		return null;
// 	}

// 	// Verify signature
// 	const signature = oslo_encoding.decodeBase64url(parts[2]);
// 	const headerAndBodyBytes = new TextEncoder().encode(parts[0] + "." + parts[1]);
// 	const hmacCryptoKey = await crypto.subtle.importKey(
// 		"raw",
// 		jwtHS256Key,
// 		{
// 			name: "HMAC",
// 			hash: "SHA-256"
// 		},
// 		false
// 	);
// 	const validSignature = await crypto.subtle.verify(
// 		"HMAC",
// 		hmacCryptoKey,
// 		signature,
// 		headerAndBodyBytes
// 	);
// 	if (!validSignature) {
// 		return null;
// 	}

// 	// Parse body
// 	let body: object;
// 	try {
// 		const bodyJSONParts = oslo_encoding.decodeBase64url(parts[1]);
// 		const bodyJSON = new TextDecoder().decode(bodyJSONParts);
// 		const parsedBody = JSON.parse(bodyJSON) as unknown;
// 		if (typeof parsedBody !== "object" || parsedBody === null) {
// 			return null;
// 		}
// 		body = parsedBody;
// 	} catch {
// 		return null;
// 	}

// 	// Check expiration
// 	if (!("exp" in body) || typeof body.exp !== "number") {
// 		return null;
// 	}
// 	const expiresAt = new Date(body.exp * 1000);
// 	if (now.getTime() >= expiresAt.getTime()) {
// 		return null;
// 	}

// 	// Parse session
// 	if (!("session" in body) || typeof body.session !== "object" || body.session === null) {
// 		return null;
// 	}
// 	const parsedSession = body.session;
// 	if (!("id" in parsedSession) || typeof parsedSession.id !== "string") {
// 		return null;
// 	}
// 	if (!("created_at" in parsedSession) || typeof parsedSession.created_at !== "number") {
// 		return null;
// 	}

// 	const session: ValidatedSession = {
// 		id: parsedSession.id,
// 		createdAt: new Date(parsedSession.created_at * 1000)
// 	};
// 	return session;
// }

// interface ValidatedSession {
// 	id: string;
// 	createdAt: Date;
// }
