/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export type ApiOwner = {
  ownerId: string;
  isMember: boolean;
  memberRole: string | null;
  viaGoogle: boolean; // signed in with Google (directly or through the mobile app flow)
};

// Resolves the signed-in shop owner (team members resolve to their owner's id).
export async function getApiOwner(req: NextRequest): Promise<ApiOwner | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const ownerId = (token as any)?.userId as string | undefined;
  if (!ownerId) return null;
  return {
    ownerId,
    isMember: !!(token as any).isMember,
    memberRole: ((token as any).memberRole as string) || null,
    viaGoogle: ["google", "mobile-code"].includes((token as any).provider),
  };
}

// Constant-time-ish admin secret check; an unset ADMIN_SECRET never matches.
export function isAdminSecret(header: string | null): boolean {
  const secret = process.env.ADMIN_SECRET;
  return !!secret && !!header && header === secret;
}
