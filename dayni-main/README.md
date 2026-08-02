# Dayni (دَيني) 🧾

A multi-tenant SaaS debt management platform designed for small businesses in Saudi Arabia.

Dayni helps shop owners and small businesses track customer debts, record payments, manage suppliers, and maintain financial relationships through a secure and modern digital platform—eliminating the need for traditional paper debt notebooks.

## Live Demo

https://dayni.app

---

## Overview

Dayni enables business owners to:

* Track customer debts and payments in real time
* Generate digital invoices and payment receipts
* Send automated WhatsApp reminders
* Manage supplier debts and purchase records
* Access financial reports and analytics
* Invite team members with role-based permissions

---

## Security Features

This project explores practical API security challenges commonly faced by small-scale SaaS platforms.

### Authentication & Authorization

* JWT-based authentication with token expiration
* Email verification using OTP codes
* Password reset via secure OTP flow
* Google OAuth integration
* Role-Based Access Control (RBAC)

  * Owner
  * Admin
  * Member

### Multi-Tenant Security

* Tenant-scoped database queries
* Strict data isolation between organizations
* Protection against unauthorized cross-tenant access

### API Protection

* Rate limiting on authentication endpoints
* Secure session management using HTTP-only cookies
* Input validation and sanitization
* Stripe webhook signature verification
* Idempotent payment processing

---

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | Next.js 14, React, Tailwind CSS   |
| Backend        | Next.js API Routes, Node.js       |
| Database       | MongoDB, Mongoose                 |
| Authentication | NextAuth.js, JWT, Google OAuth    |
| Payments       | Stripe                            |
| Notifications  | WhatsApp Business API, Nodemailer |
| Deployment     | Vercel                            |

---

## Project Structure

```text
app/
├── api/              # API endpoints
├── dashboard/        # Main dashboard
├── customers/        # Customer management
├── suppliers/        # Supplier management
└── reports/          # Reporting & analytics

models/               # MongoDB schemas
lib/                  # Utilities and helpers
components/           # Reusable UI components
```

---

## Key Features

### For Business Owners

* Unlimited customer management
* Supplier management
* Debt and payment tracking
* Automatic balance calculations
* WhatsApp invoice notifications
* Printable PDF invoices and receipts
* Financial analytics and reporting

### For Teams

* Multi-user access
* Email-based team invitations
* Permission-based activity management
* Admin and Member role separation

### Subscription Plans

#### Free

* Up to 10 customers

#### Basic

* Unlimited customers
* Data export

#### Pro

* Team management
* Smart reminders
* Advanced analytics
* Full platform features

---

## Research Context

Dayni was developed while exploring real-world security challenges in SaaS applications.

The project inspired research interests in:

* Lightweight ML-based anomaly detection for API behavior
* Authorization failure patterns in multi-tenant systems
* Security maturity frameworks for resource-constrained SaaS products

### Related Article

**The Security Questions Nobody Warned Me About When Building SaaS Applications**

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/maha20514/dayni.git
cd dayni
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env.local
```

### Run Development Server

```bash
npm run dev
```

---

## Environment Variables

```env
MONGODB_URI=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

GMAIL_USER=
GMAIL_APP_PASSWORD=

NEXT_PUBLIC_SITE_URL=
```

---

## License

MIT License

This project is available for educational and learning purposes.

---

## Author

**Maha Aledresi**

Computer Science Graduate • Backend Developer

* Website: https://dayni.app
* GitHub: https://github.com/maha20514
* LinkedIn: www.linkedin.com/in/maha-aledresi

