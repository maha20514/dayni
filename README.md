# 🧾 Debt Management System

A simple and professional web application to manage customer debts, invoices, and payments.
Built using **Next.js**, **MongoDB**, and **TypeScript**.

---

## ✨ Features

* 👤 Add and manage customers
* 🧾 Issue invoices for customers
* 💰 Record payments (receipts)
* 📊 Automatic debt calculation
* 🧮 Transaction history for each customer
* 🌐 Arabic RTL interface

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router)
* **Backend:** Next.js API Routes
* **Database:** MongoDB + Mongoose
* **Language:** TypeScript
* **Styling:** Tailwind CSS

---

## 📁 Project Structure

```
app/
 ├── api/
 │    ├── customers/
 │    ├── invoices/
 │    └── payments/
 ├── customers/
 │    ├── [id]/
 │    │    ├── page.tsx
 │    │    ├── invoice/
 │    │    └── payment/
 │    └── new/
 └── layout.tsx

lib/
 └── mongodb.ts

models/
 ├── Customer.ts
 ├── Invoice.ts
 └── Payment.ts
```

---

## 🚀 Getting Started

### 1. Clone the repository

```
git clone https://github.com/your-username/debt-management-system.git
cd debt-management-system
```

### 2. Install dependencies

```
npm install
```

### 3. Setup environment variables

Create a `.env.local` file:

```
MONGODB_URI=your_mongodb_connection_string
```

### 4. Run the development server

```
npm run dev
```

Then open:

```
http://localhost:3000
```

---

## 🧑‍💼 How It Works

### Adding a Customer

* Go to `/customers`
* Click **Add Customer**
* Enter name and phone

### Issuing an Invoice

* Open customer details
* Click **Issue Invoice**
* Enter amount and description

### Recording a Payment

* Open customer details
* Click **Record Payment**
* Enter payment amount

The system will automatically:

* Increase debt on invoice
* Decrease debt on payment

---

## 🧾 Data Models

### Customer

```
name: string
phone: string
totalDebt: number
```

### Invoice

```
customerId: ObjectId
amount: number
description: string
date: Date
```

### Payment

```
customerId: ObjectId
amount: number
date: Date
```

---

<!-- ## 📸 Screenshots

You can add screenshots here after deploying:

```
/screenshots/customers.png
/screenshots/customer-details.png
/screenshots/invoice.png
```

--- -->

## 📦 Future Improvements

* Generate PDF invoices
* Dashboard with statistics
* Export reports to Excel
* Multi-user authentication

---

## 🧑‍💻 Author

Developed by **Maha**
Software Developer | Next.js & MongoDB

---

## 📄 License

This project is open-source and available under the MIT License.
