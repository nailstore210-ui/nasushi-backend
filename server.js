const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("NASUSHI21"));

// 🏠 Route رئيسي
app.get("/", (req, res) => {
  res.send("✅ Nasushi Backend is running!");
});

// دوال العملاء
function readCustomers() {
  if (!fs.existsSync("customers.json")) return {};
  return JSON.parse(fs.readFileSync("customers.json", "utf8"));
}
function writeCustomers(customers) {
  fs.writeFileSync("customers.json", JSON.stringify(customers, null, 2), "utf8");
}

// ✅ Route لطلبية جديدة
app.post("/order", async (req, res) => {
  try {
    const order = req.body;
    const orderId = "ORD-" + Date.now();
    order.id = orderId;

    // نقاط
    const usedPoints = Number(order.usedPoints) || 0;
    let customers = readCustomers();
    const customerKey = order.phone;
    if (!customers[customerKey]) {
      customers[customerKey] = { name: order.name, phone: order.phone, points: 0 };
    }

    let currentPoints = customers[customerKey].points;
    if (currentPoints >= usedPoints) {
      currentPoints -= usedPoints;
    } else {
      return res.send({ status: "error", message: "رصيد النقاط غير كافي" });
    }

    let earnedPoints = 0;
    if (usedPoints === 0) {
      earnedPoints = Math.floor(Number(order.total) / 100);
      currentPoints += earnedPoints;
    }

    customers[customerKey].points = currentPoints;
    order.pointsEarned = earnedPoints;
    order.pointsUsed = usedPoints;
    order.pointsBalance = currentPoints;

    fs.appendFileSync("orders.txt", JSON.stringify(order) + "\n", "utf8");
    writeCustomers(customers);

    // ✅ توليد PDF (بسيط بلا لوغو)
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `invoice-${orderId}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("فاتورة الطلبية", { align: "center" });
    doc.text(`🆔 رقم الطلب: ${orderId}`);
    doc.text(`👤 الاسم: ${order.name}`);
    doc.text(`📞 الهاتف: ${order.phone}`);
    doc.text(`💰 المجموع: ${order.total} DA`);
    doc.text(`🪙 الرصيد الجديد: ${order.pointsBalance}`);
    doc.end();

    // ✅ بدل redirect برد JSON بسيط
    stream.on("finish", () => {
      res.json({ status: "success", orderId, message: "✅ الطلبية تسجلت والفاتورة تولدت" });
    });
  } catch (err) {
    console.error("❌ خطأ في معالجة الطلبية:", err.message);
    res.status(500).send({ error: "خطأ في معالجة الطلبية" });
  }
});

// ✅ Route لرصيد النقاط
app.get("/points/:phone", (req, res) => {
  const customers = readCustomers();
  const phone = req.params.phone;
  res.send({ points: customers[phone] ? customers[phone].points : 0 });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));