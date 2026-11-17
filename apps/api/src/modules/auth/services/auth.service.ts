export interface StudioUser {
  id: string;
  email: string;
  name: string;
  role: "founder" | "admin" | "member";
  credits: number;
}

export class AuthService {
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

  async getCurrentUser(token?: string): Promise<StudioUser> {
    // Default mock user for local development and verification
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
    const user: StudioUser = {
      id: `usr_${Date.now()}`,
      email,
      name: email.split("@")[0] || "Operator",
      role: "founder",
      credits: 50,
    };
    this.users.set(user.id, user);
    return { token: `vst_${user.id}_jwt`, user };
  }
}

export const authService = new AuthService();

