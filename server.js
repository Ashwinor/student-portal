const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "studentportal123",
    resave: false,
    saveUninitialized: true
}));

// ==========================================
// Read Server Status
// ==========================================

function getServerStatus() {

    const file = path.join(__dirname, "data", "server-status.json");

    return JSON.parse(fs.readFileSync(file));

}

// ==========================================
// Save Server Status
// ==========================================

function setServerStatus(status) {

    const file = path.join(__dirname, "data", "server-status.json");

    fs.writeFileSync(
        file,
        JSON.stringify({ online: status }, null, 4)
    );

}

// ==========================================
// Maintenance Check
// ==========================================

app.use((req, res, next) => {

    if (
        req.path === "/admin-login.html" ||
        req.path === "/admin-dashboard.html" ||
        req.path === "/admin/server/on" ||
        req.path === "/admin/server/off"
    ) {
        return next();
    }

    if (!getServerStatus().online) {

        return res.sendFile(
            path.join(__dirname, "public", "maintenance.html")
        );

    }

    next();

});

// ==========================================
// Static Files
// ==========================================

app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// Home
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});

// ==========================================
// ADMIN DASHBOARD
// ==========================================

app.get("/admin-dashboard.html", (req, res) => {

    const online = getServerStatus().online;

    const statusColor = online ? "green" : "red";
    const statusIcon = online ? "🟢" : "🔴";
    const statusText = online ? "ONLINE" : "OFFLINE";

    res.send(`

<!DOCTYPE html>

<html>

<head>

<title>Admin Dashboard</title>

<link rel="stylesheet" href="/style.css">

</head>

<body class="home-page">

<div class="fees-card">

<h1>🛠 Admin Dashboard</h1>

<h2>Server Status</h2>

<h1 style="color:${statusColor};">
${statusIcon} ${statusText}
</h1>

<br>

<form action="/admin/server/off" method="POST">

<button class="btn" style="background:#ff3b30;">
🔴 Turn OFF Server
</button>

</form>

<br>

<form action="/admin/server/on" method="POST">

<button class="btn" style="background:#34c759;">
🟢 Turn ON Server
</button>

</form>

<br><br>

<a href="/index.html">
Logout
</a>

</div>

</body>

</html>

`);

});

// ==========================================
// TURN OFF SERVER
// ==========================================

app.post("/admin/server/off", (req, res) => {

    setServerStatus(false);

    res.redirect("/admin-dashboard.html");

});

// ==========================================
// TURN ON SERVER
// ==========================================

app.post("/admin/server/on", (req, res) => {

    setServerStatus(true);

    res.redirect("/admin-dashboard.html");

});

// ==========================================
// START SERVER
// ==========================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(`Student Portal running at http://localhost:${PORT}`);

});