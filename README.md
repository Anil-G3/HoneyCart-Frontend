# 🛒 HoneyCart — Frontend

> React-based storefront for the HoneyCart e-commerce platform.  
> This repo handles the UI. The real engineering lives in the **[backend repo →](https://github.com/Anil-G3/HoneyCart-Backend)**

![Live](https://img.shields.io/badge/Status-Live-brightgreen?style=flat)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## 🔗 Links

| | |
|---|---|
| 🖥️ Live App | https://honeycart-frontend.onrender.com/ |
| ⚙️ Backend Repo | [HoneyCart-Backend](https://github.com/Anil-G3/HoneyCart-Backend) |

---

## 🧩 What This Does

The frontend connects to the HoneyCart REST API and provides:

- Customer-facing product browsing, cart, and checkout flow
- Admin panel for product and order management
- JWT-based auth — tokens handled via the backend API

---

## ⚙️ Run Locally

**Prerequisites:** Node.js, npm

```bash
git clone https://github.com/Anil-G3/HoneyCart-Frontend.git
cd HoneyCart-Frontend
npm install
npm start
```

> Make sure the [backend server](https://github.com/Anil-G3/HoneyCart-Backend) is running before starting the frontend.

Configure the API base URL in your `.env` file:

```env
REACT_APP_API_URL=http://localhost:8080
```

---

## 🏗️ Tech Stack

- **React JS** — UI framework
- **JavaScript** — application logic
- **REST API** — communicates with the Spring Boot backend

---

## 👨‍💻 Author

**G Anil Kumar** — Java Developer  
[GitHub](https://github.com/Anil-G3) · [LinkedIn](https://linkedin.com/in/anil-g3) · [Portfolio](https://portfolio-anil-20.netlify.app)

> Primarily a backend developer — the Spring Boot side of this project is where the real work is.  
> Check out the **[backend repo](https://github.com/Anil-G3/HoneyCart-Backend)** for JWT auth, Razorpay integration, and API design.
