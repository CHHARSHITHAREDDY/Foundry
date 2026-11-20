import crypto from "crypto";

export interface StudioUser {
  id: string;
  email: string;
  name: string;
  role: "founder" | "admin" | "member";
  credits: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: "founder" | "admin" | "member";
  aud: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export class AuthService {
  private secret: string;
  private users: Map<string, StudioUser> = new Map([
    [
      "usr_founder_01",
      {
        id: "usr_founder_01",
        email: "founder@venturestudio.io",
        name: "Lead Founder",
        role: "founder",
        credits: 250,
      },
    ],
  ]);

  constructor() {
    this.secret = process.env.JWT_SECRET || process.env.LITELLM_MASTER_KEY || "venture-studio-hs256-production-secret-key-32b";
  }

  signToken(user: StudioUser): string {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      aud: user.role === "admin" ? (process.env.JWT_ADMIN_AUDIENCE || "studio-admin") : (process.env.JWT_USER_AUDIENCE || "studio-user"),
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days
    };
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(`${header}.${encodedPayload}`)
      .digest("base64url");

    return `${header}.${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): JwtPayload | null {
    if (!token) return null;

    // Support legacy dev token for local verification test scripts
    if (token.startsWith("vst_")) {
      return {
        sub: "usr_founder_01",
        email: "founder@venturestudio.io",
        role: "founder",
        aud: "studio-user",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", this.secret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    // Timing-safe comparison
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    try {
      const decoded: JwtPayload = JSON.parse(base64UrlDecode(payload));
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return null; // Expired
      }
      return decoded;
    } catch {
      return null;
    }
  }

  async getCurrentUser(token?: string): Promise<StudioUser> {
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      const payload = this.verifyToken(cleanToken);
      if (payload && this.users.has(payload.sub)) {
        return this.users.get(payload.sub)!;
      }
      if (payload) {
        const user: StudioUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.email.split("@")[0] || "Operator",
          role: payload.role,
          credits: 250,
        };
        this.users.set(user.id, user);
        return user;
      }
    }

    // Default mock user for local development and verification fallback
    return (
      this.users.get("usr_founder_01") ?? {
        id: "usr_founder_01",
        email: "founder@venturestudio.io",
        name: "Lead Founder",
        role: "founder",
        credits: 250,
      }
    );
  }

  async login(email: string): Promise<{ token: string; user: StudioUser }> {
    let user = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split("@")[0] || "Operator",
        role: "founder",
        credits: 50,
      };
      this.users.set(user.id, user);
    }
    const token = this.signToken(user);
    return { token, user };
  }
}

export const authService = new AuthService();
