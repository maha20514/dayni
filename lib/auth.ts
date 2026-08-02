/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions, SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { TeamMember } from "@/models/Teammember";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
        }

        await connectDB();
        const email = credentials.email.toLowerCase().trim();
        const user  = await User.findOne({ email });

        if (!user)          throw new Error("هذا البريد غير مسجل");
        if (!user.password) throw new Error("هذا الحساب مسجل عبر جوجل");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid)            throw new Error("كلمة المرور غير صحيحة");
        if (!user.isActive)      throw new Error("الحساب غير نشط");

       
 
        // ✅ أضف هذا:
        if (user.isVerified === false) {
          throw new Error("يرجى تأكيد بريدك الإلكتروني أولاً|UNVERIFIED:" + user._id.toString());
        }
        
 

        return {
          id:           user._id.toString(),
          name:         user.shopName,        // ✅ name = shopName
          email:        user.email,
          image:        user.avatar || null,
          plan:         user.plan         || "free",
          maxCustomers: user.maxCustomers  || 10,
          isActive:     user.isActive,
        };
      },
    }),

    CredentialsProvider({
  id:   "team-member",
  name: "Team Member",
  credentials: {
    email:    { type: "email"    },
    password: { type: "password" },
  },
 async authorize(credentials) {
  console.log("🔵 team-member authorize called:", credentials?.email);
  
  if (!credentials?.email || !credentials?.password) {
    console.log("❌ missing credentials");
    return null;
  }

  await connectDB();

  const member = await TeamMember.findOne({
    email:  credentials.email.toLowerCase().trim(),
    status: "active",
  });

  console.log("🔵 member found:", member?.email, "status:", member?.status);

  if (!member || !member.password) {
    console.log("❌ member not found or no password");
    return null;
  }

  const isValid = await bcrypt.compare(credentials.password, member.password);
  console.log("🔵 password valid:", isValid);

  if (!isValid) return null;

  const owner = await User.findById(member.ownerId);
  console.log("🔵 owner found:", owner?.shopName);

  if (!owner) return null;

  return {
    id:       `member_${member._id.toString()}`,
    name:     member.name,
    email:    member.email,
    image:    null,
    ownerId:  owner._id.toString(),
    shopName: owner.shopName,
    plan:     owner.plan,
    role:     member.role,
    isMember: true,
  };
},
}),
  ],

  callbacks: {
    // ── Google sign-in ──────────────────────────
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            shopName:  user.name || "متجري",
            email:     user.email,
            password:  null,
            avatar:    user.image,
            plan:      "free",
            maxCustomers: 10,
            isActive:  true,
          });
        }
      }
      return true;
    },

    // ── JWT ─────────────────────────────────────
   async jwt({ token, user, trigger }) {
  if (user) {

    // ✅ تحقق من isMember أولاً قبل أي شيء
    if ((user as any).isMember) {
      token.isMember   = true;
      token.memberRole = (user as any).role;
      token.userId     = (user as any).ownerId;
      token.shopName   = (user as any).shopName;
      token.plan       = (user as any).plan;
      token.maxCustomers = 999999;
      token.isActive   = true;
      token.avatar     = null;
      return token; // ← اخرج فوراً بدون ما تدور في User
    }

    // owner عادي
    await connectDB();
    const dbUser = await User.findOne({ email: user.email });
    token.userId       = dbUser?._id.toString();
    token.shopName     = dbUser?.shopName;
    token.plan         = dbUser?.plan || "free";
    token.maxCustomers = dbUser?.maxCustomers || 10;
    token.isActive     = dbUser?.isActive;
    token.avatar       = dbUser?.avatar || null;
  }

  if (trigger === "update") {
    await connectDB();
    const dbUser = await User.findById(token.userId);
    if (dbUser) {
      token.plan         = dbUser.plan;
      token.maxCustomers = dbUser.maxCustomers;
      token.isActive     = dbUser.isActive;
    }
  }

  return token;
},

    // ── Session ──────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id                        = token.userId  as string;
        session.user.name                      = token.shopName as string;
        session.user.image                     = token.avatar  as string | null;
        (session.user as any).shopName         = token.shopName;
        (session.user as any).plan             = token.plan;
        (session.user as any).maxCustomers     = token.maxCustomers;
        (session.user as any).isActive         = token.isActive;
        (session.user as any).isMember   = token.isMember   || false;
        (session.user as any).memberRole = token.memberRole  || null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };