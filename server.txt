const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("NASUSHI21"));

// Twilio (يتفعل فقط إذا عندك المتغيرات)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

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

    // Twilio (يتفعل فقط إذا client موجود)
    if (client) {
      try {
        await client.messages.create({
          from: "whatsapp:+14155238886",
          to: "whatsapp:+213792106084",
          body: `طلب جديد 🛒 رقم الطلب: ${order.id}`
        });
        console.log("✅ تم إرسال الطلب إلى واتساب");
      } catch (err) {
        console.error("❌ خطأ في إرسال واتساب:", err.message);
      }
    }

    // توليد PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `invoice-${orderId}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // شعار إذا موجود
    const logoPath = path.join(__dirname, "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [100, 100], align: "center", valign: "top" });
    }

    doc.fontSize(20).text("فاتورة الطلبية", { align: "center" });
    doc.text(`🆔 رقم الطلب: ${orderId}`);
    doc.text(`👤 الاسم: ${order.name}`);
    doc.text(`📞 الهاتف: ${order.phone}`);
    doc.text(`💰 المجموع: ${order.total} DA`);
    doc.text(`🪙 الرصيد الجديد: ${order.pointsBalance}`);
    doc.end();

    stream.on("finish", () => {
      res.redirect(`/invoice/${orderId}`);
    });
  } catch (err) {
    console.error("❌ خطأ في معالجة الطلبية:", err.message);
    res.status(500).send({ error: "خطأ في معالجة الطلبية" });
  }
});

// ✅ Route لعرض الفاتورة
app.get("/invoice/:id", (req, res) => {
  const filePath = path.join(__dirname, `invoice-${req.params.id}.pdf`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { headers: { "Content-Type": "application/pdf" } });
  } else {
    res.status(404).send("❌ الفاتورة غير موجودة");
  }
});

// ✅ Route لرصيد النقاط
app.get("/points/:phone", (req, res) => {
  const customers = readCustomers();
  const phone = req.params.phone;
  res.send({ points: customers[phone] ? customers[phone].points : 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));